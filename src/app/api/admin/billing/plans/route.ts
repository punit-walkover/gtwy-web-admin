import { ok } from "@/lib/api/envelope";
import { withAdmin } from "@/lib/auth/withAdmin";
import { getPlan, lagoConfigured, lagoPlanCodeForSlug, listSubscriptionsByPlan } from "@/lib/clients/lago";
import { MONGO_MAX_TIME_MS, collection } from "@/lib/db/mongo";
import type { RawLagoPlan, RawPlan, RawPlans } from "@/lib/mappers/billing";

/**
 * `GET /api/admin/billing/plans` → the Billing plans page (plan §5, page 07).
 *
 * Two sources, joined per plan:
 *
 *   - **Mongo `billing_plans`** — `find({}).sort({ plan_code: 1 })`, exactly what
 *     `billingPlan.service.js#listPlans` does, so the cards come back in the same
 *     order every read. It owns everything the plan *grants*.
 *   - **Lago** — `getLagoPlan` for the subscription fee and
 *     `listSubscriptionsByPlan` for the org count and MRR. Price, orgs and MRR
 *     have **no database source**; they exist only in Lago.
 *
 * The two halves fail independently on purpose (plan §7). A Lago outage leaves
 * `lago`, `orgs` and `mrrUsd` null on every card and the Mongo half still
 * renders; nothing here throws on an upstream failure, because a billing console
 * that blanks when the biller hiccups is worse than one that shows an em dash.
 *
 * Read-only. Nothing on this page writes.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** `billing_plans`, as stored. Every field is optional — old documents predate the newer ones. */
interface BillingPlanDoc {
  plan_code?: string;
  display_name?: string;
  services?: unknown;
  credit_grant?: number;
  monthly_credits?: number;
  hit_fees?: Record<string, unknown> | null;
  credit_packs?: number[] | null;
  status?: number;
  updated_by?: string;
  updated_at?: Date | string | null;
}

const num = (value: unknown): number => Number(value) || 0;

/** `hit_fees` is `Mixed` in Mongo; only numeric entries are a fee. */
function toHitFees(raw: Record<string, unknown> | null | undefined): Record<string, number> | null {
  if (!raw || typeof raw !== "object") return null;
  const fees: Record<string, number> = {};
  for (const [kind, value] of Object.entries(raw)) {
    const amount = Number(value);
    if (Number.isFinite(amount)) fees[kind] = amount;
  }
  return Object.keys(fees).length > 0 ? fees : null;
}

/**
 * Lago's `interval` normalised to a monthly multiplier, so MRR is comparable
 * across plans billed on different cycles. An interval Lago does not report is
 * treated as monthly — the only intervals in play here are Lago's own four.
 */
const MONTHLY_FACTOR: Record<string, number> = {
  weekly: 52 / 12,
  monthly: 1,
  quarterly: 1 / 3,
  yearly: 1 / 12,
};

/**
 * Every active subscription on one Lago plan, paged.
 *
 * `listSubscriptionsByPlan` is one page; gtwy-node's reconcile sweep walks them
 * the same way. The 50-page cap is the guard `listOrgUsers` uses — a wrong
 * `meta` must not loop forever.
 */
async function activeSubscriptions(lagoPlanCode: string): Promise<Array<Record<string, unknown>>> {
  const all: Array<Record<string, unknown>> = [];

  for (let page = 1; page <= 50; page += 1) {
    const { subscriptions, meta } = await listSubscriptionsByPlan(lagoPlanCode, { perPage: 100, page });
    all.push(...subscriptions);

    const totalPages = Number((meta as { total_pages?: number })?.total_pages) || 0;
    if (subscriptions.length === 0 || page >= totalPages) break;
  }

  return all;
}

/**
 * The Lago half of one card: price, org count, MRR.
 *
 * MRR is the sum of each active subscription's own fee — `plan_amount_cents`,
 * which is what that org is actually charged and differs from the plan's list
 * price for an org comped with an override (`lago.service.js#getSubscription`
 * documents that case). It falls back to the plan price when the subscription
 * does not carry one, and is normalised to a month so plans on different
 * intervals add up to a single figure.
 *
 * Returns `null` on any Lago failure. The caller keeps the Mongo half.
 */
async function lagoHalf(
  slug: string,
): Promise<{ lago: RawLagoPlan; orgs: number; mrrUsd: number } | null> {
  const lagoPlanCode = lagoPlanCodeForSlug(slug);

  const plan = await getPlan(lagoPlanCode);
  // Lago answers 404 for a plan_code it does not hold, which `getPlan` turns
  // into null. That is "we cannot price this plan", not an outage — but the
  // subscription count is meaningless without it, so the whole half degrades.
  if (!plan) return null;

  const subscriptions = await activeSubscriptions(lagoPlanCode);
  const factor = plan.interval ? (MONTHLY_FACTOR[plan.interval] ?? 1) : 1;

  const mrrCents = subscriptions.reduce((total, sub) => {
    const own = sub.plan_amount_cents;
    const cents = own === undefined || own === null ? plan.amount_cents : num(own);
    return total + cents;
  }, 0);

  return {
    lago: {
      planCode: plan.code,
      amountCents: plan.amount_cents,
      amountCurrency: plan.amount_currency,
      interval: plan.interval,
    },
    orgs: subscriptions.length,
    mrrUsd: (mrrCents / 100) * factor,
  };
}

export const GET = withAdmin(async () => {
  const docs = await (await collection<BillingPlanDoc>("billing_plans"))
    .find({}, { maxTimeMS: MONGO_MAX_TIME_MS })
    .sort({ plan_code: 1 })
    .toArray();

  // One Lago attempt per plan, all of them settled: a single plan whose code
  // Lago does not hold must not take the other cards' prices down with it.
  const halves = lagoConfigured()
    ? await Promise.all(
        docs.map((doc) =>
          lagoHalf(String(doc.plan_code ?? "")).catch((err) => {
            console.error(`[admin-api] lago plan lookup failed for ${String(doc.plan_code ?? "")}`, err);
            return null;
          }),
        ),
      )
    : docs.map(() => null);

  const plans: RawPlan[] = docs.map((doc, index) => {
    const half = halves[index];
    return {
      planCode: String(doc.plan_code ?? ""),
      displayName: String(doc.display_name ?? doc.plan_code ?? ""),
      services: doc.services,
      // Absent on both live documents; the model defaults it to 0.
      creditGrant: num(doc.credit_grant),
      monthlyCredits: num(doc.monthly_credits),
      hitFees: toHitFees(doc.hit_fees),
      creditPacks: Array.isArray(doc.credit_packs) ? doc.credit_packs.map(num) : null,
      status: doc.status === 0 ? 0 : 1,
      updatedBy: doc.updated_by ?? "",
      updatedAt: doc.updated_at ? new Date(doc.updated_at).toISOString() : null,
      lago: half?.lago ?? null,
      orgs: half?.orgs ?? null,
      mrrUsd: half?.mrrUsd ?? null,
    };
  });

  const payload: RawPlans = {
    plans,
    lagoAvailable: halves.some((half) => half !== null),
  };
  return ok(payload);
});
