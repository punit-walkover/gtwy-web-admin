import type { Invoice, PlanCard, PlanChoice } from "@/mocks/types";
import { EM_DASH, istDate, invoiceTag, orDash, orgLabel, planStatus, thousands } from "./primitives";

/**
 * Billing plans and invoices (plan §5, page 07).
 *
 * The page is a join of two sources that do not overlap:
 *
 *   - **Mongo `billing_plans`** owns what a plan *grants*: `display_name`,
 *     `services`, `credit_grant`, `monthly_credits`, `hit_fees`, `credit_packs`,
 *     `status`, `updated_by`, `updated_at`. Read exactly as
 *     `billingPlan.service.js#listPlans` reads it — `find({}).sort({plan_code:1})`.
 *   - **Lago** owns what a plan *costs* and who is on it: the subscription fee
 *     (`getLagoPlan`) and the active subscriptions (`listSubscriptionsByPlan`).
 *     There is no database source for price, org count or MRR.
 *
 * So every Lago-sourced cell is nullable in the raw payload and renders as an em
 * dash when Lago is unreachable (plan §7): the Mongo half of each card still
 * renders and the page never blanks.
 *
 * **Feature bullets (plan §9 gap 9).** The design's bullet list is marketing
 * copy with no source. Per the plan's §07 decision it is *derived* from what the
 * plan actually grants — `credit_grant` + `monthly_credits` + `services` +
 * `hit_fees` — so a card cannot drift from the document behind it. Nothing here
 * is keyed on `plan_code`; a plan added tomorrow gets correct bullets.
 */

// ------------------------------------------------------------------- raw ---

/** The Lago plan behind one `billing_plans` document. `null` when Lago is out. */
export interface RawLagoPlan {
  /** The Lago plan_code this resolved to — `planCodeFor(slug)` in gtwy-node. */
  planCode: string;
  amountCents: number;
  amountCurrency: string | null;
  /** `weekly | monthly | quarterly | yearly`, as Lago reports it. */
  interval: string | null;
}

/** One `billing_plans` document plus its Lago half. */
export interface RawPlan {
  planCode: string;
  displayName: string;
  /** Mixed in Mongo: `"*"` or `Record<string, "*" | string[]>`. */
  services: unknown;
  creditGrant: number;
  monthlyCredits: number;
  /** `{ api, chatbot, embed }` in USD, or `null` when the plan charges none. */
  hitFees: Record<string, number> | null;
  /** USD top-up amounts offered on this plan. Not rendered; carried for parity. */
  creditPacks: number[] | null;
  status: 0 | 1;
  updatedBy: string;
  updatedAt: string | null;

  /** Lago-only, `null` when Lago is unreachable or the slug has no Lago plan. */
  lago: RawLagoPlan | null;
  /** Active subscriptions on this plan. `null` when Lago is unreachable. */
  orgs: number | null;
  /** Monthly-normalised sum of those subscriptions' fees, USD. `null` as above. */
  mrrUsd: number | null;
}

export interface RawPlans {
  plans: RawPlan[];
  /** False when every Lago read failed — the page degrades, it does not error. */
  lagoAvailable: boolean;
}

/** One Lago invoice, narrowed to the five columns the design renders. */
export interface RawInvoice {
  number: string;
  /** `customer.external_id` — the gtwy org id. */
  orgId: string;
  /** From the msg91 company list (plan §4.1); `null` when msg91 could not answer. */
  orgName: string | null;
  /** ISO-8601 start of the billed window, when the invoice carries fee dates. */
  periodStart: string | null;
  /** ISO-8601 `issuing_date` — the fallback when no fee window is present. */
  issuingDate: string | null;
  totalAmountCents: number;
  currency: string | null;
  /** Lago's own `succeeded | pending | failed`. */
  paymentStatus: string | null;
}

// ---------------------------------------------------------------- money ---

/**
 * `1999 → "$19.99"`, `39900 → "$399"`.
 *
 * Whole dollars drop the decimals because that is the form the design renders
 * (`$399`, `$0`); a fractional amount keeps them rather than lying by rounding.
 * A non-USD currency is labelled rather than given a `$` it does not have —
 * gtwy-node bills in USD (`lago.service.js` `WALLET_CURRENCY`), so this is a
 * guard, not a path anyone is expected to hit.
 */
export function money(amountCents: number, currency: string | null | undefined): string {
  const amount = amountCents / 100;
  const body = Number.isInteger(amount) ? thousands(amount) : amount.toFixed(2);
  if (!currency || currency.toUpperCase() === "USD") return `$${body}`;
  return `${body} ${currency.toUpperCase()}`;
}

/**
 * A per-hit fee, which is priced in thousandths: `0.009 → "$0.009"`,
 * `0.07 → "$0.07"`, `1 → "$1.00"`. Trailing zeros go, but never below two
 * decimals, so a round fee still reads as money.
 */
export function feeUsd(amount: number): string {
  const trimmed = amount
    .toFixed(4)
    .replace(/(\.\d*?[1-9])0+$/, "$1")
    .replace(/\.0+$/, "");
  return "$" + (trimmed.includes(".") ? trimmed : `${trimmed}.00`);
}

// ------------------------------------------------------------- services ---

/**
 * Is this allowlist entry a grant?
 *
 * Same rule as `platformKeys.ts#planAllowsService`: `"*"` allows the service
 * outright, an array allows the models it names, and an empty array or a missing
 * key denies (`BillingPlan.model.js:3-4`).
 */
function isGrant(value: unknown): boolean {
  return value === "*" || (Array.isArray(value) && value.length > 0);
}

/**
 * The `servicesSummary` cell and the services feature bullet.
 *
 * `"*"` is unbounded, so it is named rather than enumerated. The object form
 * lists its services, and a service restricted to an explicit model list carries
 * that count — `mistral (1)` means one model of `mistral`, not one call.
 */
export function servicesSummary(services: unknown): string {
  if (services === "*") return "All services & models";
  if (!services || typeof services !== "object" || Array.isArray(services)) return EM_DASH;

  const parts = Object.entries(services as Record<string, unknown>)
    .filter(([, value]) => isGrant(value))
    .map(([name, value]) => (Array.isArray(value) ? `${name} (${value.length})` : name));

  return parts.length > 0 ? parts.join(", ") : EM_DASH;
}

/**
 * The hit-fee bullet: one phrase per distinct rate, kinds grouped.
 *
 * `{ api: 0.009, chatbot: 0.009, embed: 0.006 }` — the live shape — becomes
 * `"$0.009 per api & chatbot hit, $0.006 per embed hit"`. A kind that is absent
 * or `0` is not charged and is not named (`BillingPlan.model.js` `hit_fees`).
 */
export function hitFeeSummary(hitFees: Record<string, number> | null | undefined): string | null {
  if (!hitFees) return null;

  // `api, chatbot, embed` is the order the model documents; anything else a plan
  // carries follows, sorted, so the copy is stable between reads.
  const known = ["api", "chatbot", "embed"];
  const kinds = [
    ...known.filter((kind) => Number(hitFees[kind]) > 0),
    ...Object.keys(hitFees)
      .filter((kind) => !known.includes(kind) && Number(hitFees[kind]) > 0)
      .sort(),
  ];
  if (kinds.length === 0) return null;

  const byRate = new Map<number, string[]>();
  for (const kind of kinds) {
    const rate = Number(hitFees[kind]);
    byRate.set(rate, [...(byRate.get(rate) ?? []), kind]);
  }

  return [...byRate.entries()]
    .map(([rate, group]) => `${feeUsd(rate)} per ${group.join(" & ")} hit`)
    .join(", ");
}

/**
 * The card's bullet list, derived — never marketing copy (plan §9 gap 9).
 *
 * Order runs from what an org is given to what it is charged: the one-off grant,
 * the recurring allowance, what it may spend them on, then the per-hit fee. A
 * plan that grants none of the first three simply renders fewer bullets.
 */
export function planFeatures(plan: {
  creditGrant: number;
  monthlyCredits: number;
  services: unknown;
  hitFees: Record<string, number> | null;
}): string[] {
  const features: string[] = [];

  // "Granted once, at wallet creation" — BillingPlan.model.js `credit_grant`.
  if (plan.creditGrant > 0) features.push(`${thousands(plan.creditGrant)} signup credits`);

  // "the balance every PAID subscription invoice tops the wallet up TO" — the
  // model's own example reads "8,000 credits a month".
  if (plan.monthlyCredits > 0) features.push(`${thousands(plan.monthlyCredits)} credits / month`);

  const services = servicesSummary(plan.services);
  if (services !== EM_DASH) features.push(services);

  const fees = hitFeeSummary(plan.hitFees);
  features.push(fees ?? "No per-hit fee");

  return features;
}

// ---------------------------------------------------------------- price ---

/** Lago's `interval` → the small print beside the price. */
const INTERVAL_LABEL: Record<string, string> = {
  weekly: "/ week",
  monthly: "/ month",
  quarterly: "/ quarter",
  yearly: "/ year",
};

/**
 * Price and its unit. Both come from the Lago plan and only from there, so both
 * degrade together: no Lago, no price, and the unit goes with it rather than
 * leaving a stranded "/ month" beside an em dash.
 */
export function priceLabels(lago: RawLagoPlan | null): { price: string; per: string } {
  if (!lago) return { price: EM_DASH, per: "" };
  return {
    price: money(lago.amountCents, lago.amountCurrency),
    per: lago.interval ? (INTERVAL_LABEL[lago.interval] ?? "") : "",
  };
}

// --------------------------------------------------------------- mappers ---

/** Raw route JSON → the exact strings `src/mocks/types.ts` declares. */
export function mapPlanCards(raw: RawPlans): PlanCard[] {
  return raw.plans.map((plan) => {
    const { price, per } = priceLabels(plan.lago);
    return {
      plan_code: plan.planCode,
      display_name: plan.displayName,
      price,
      per,
      features: planFeatures(plan),
      ...planStatus(plan.status),
      // Lago-only. An em dash here is the §7 degraded state, not "zero orgs" —
      // a plan genuinely nobody is on reports `0`.
      orgs: plan.orgs === null ? EM_DASH : plan.orgs,
      mrr: plan.mrrUsd === null ? EM_DASH : money(Math.round(plan.mrrUsd * 100), plan.lago?.amountCurrency),
      credit_grant: plan.creditGrant,
      status: plan.status,
      updated: istDate(plan.updatedAt),
      updated_by: orDash(plan.updatedBy),
      servicesSummary: servicesSummary(plan.services),
    };
  });
}

/**
 * The plan picker's options — active plans only, which is exactly what
 * `billingPlan.service.js#listActivePlans` returns (`status: 1`, ordered by
 * `plan_code`). Derived from the same payload rather than a second route.
 */
export function mapPlanChoices(raw: RawPlans): PlanChoice[] {
  return raw.plans
    .filter((plan) => plan.status === 1)
    .map((plan) => ({
      plan_code: plan.planCode,
      display_name: plan.displayName,
      servicesSummary: servicesSummary(plan.services),
    }));
}

/**
 * Lago's `payment_status` → the design's three labels.
 * `INVOICE_STATUS_LABEL` in `lagoBilling.service.js:542` is this exact map;
 * anything outside it is treated as still-pending rather than invented.
 */
export function invoiceStatus(paymentStatus: string | null | undefined): Invoice["status"] {
  if (paymentStatus === "succeeded") return "Paid";
  if (paymentStatus === "failed") return "Failed";
  return "Pending";
}

/** `"2026-08-01" → "Aug 2026"`, in IST (plan §4.5 Q26). */
export function monthYear(value: string | null | undefined): string {
  if (!value) return EM_DASH;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EM_DASH;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function mapInvoices(raw: RawInvoice[]): Invoice[] {
  return raw.map((invoice) => {
    const status = invoiceStatus(invoice.paymentStatus);
    return {
      no: invoice.number,
      // msg91 is the only source of an org name (plan §4.1); when it cannot
      // answer the row still renders, as `org <id>`.
      org: orgLabel(invoice.orgId, invoice.orgName),
      orgId: invoice.orgId,
      // The billed window when the invoice carries fee dates, else the month it
      // was issued — see the note on `RawInvoice.periodStart`.
      period: monthYear(invoice.periodStart ?? invoice.issuingDate),
      amount: money(invoice.totalAmountCents, invoice.currency),
      status,
      tag: invoiceTag(status),
    };
  });
}
