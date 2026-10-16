import "server-only";

import { env, MSG91_CACHE_TTL_MS } from "@/lib/env";
import { cached } from "@/lib/clients/cache";
import { httpJson, UpstreamError } from "@/lib/clients/http";

/**
 * Lago, **read-only**. Every function here is a GET.
 *
 * gtwy-node's `services/lago.service.js` owns the writes (wallets, top-ups,
 * subscriptions, invoices) and the invariants that go with them. This console
 * reports; it does not bill. Plan §1.2: our only write is `admin_audit_logs`.
 *
 * Field selection and the multi-wallet summing below follow
 * `lago.service.js#getWallet`, which sums across every active wallet because an
 * org with two wallets otherwise reports a balance that never moves.
 */

function config() {
  const url = env.billingApiUrl();
  const key = env.billingApiKey();
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ""), key };
}

/** True when Lago is configured. Pages degrade to "—" rather than fail when not. */
export function lagoConfigured(): boolean {
  return config() !== null;
}

async function get<T>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
  const cfg = config();
  if (!cfg) throw new UpstreamError("lago", null, "BILLING_API_URL / BILLING_API_KEY are not configured");

  return httpJson<T>(`${cfg.url}${path}`, {
    source: `lago${path}`,
    headers: { Authorization: `Bearer ${cfg.key}` },
    query,
    timeoutMs: env.billingTimeoutMs(),
    // Lago answers 404 for "this org has no customer/wallet/subscription",
    // which is a normal state on this console, not an outage.
    nullOn: [404],
  });
}

export interface LagoWallet {
  credits_balance: number;
  credits_ongoing_usage_balance: number;
  rate_amount: number | null;
  currency: string | null;
  active_wallet_count: number;
  /**
   * The active wallets' own Lago ids, oldest first.
   *
   * `getWallet` sums balances across wallets, which is right for a balance and
   * loses the thing `listWalletTransactions` keys on. The ledger on the
   * Workspace Billing tab needs one, so the ids ride along rather than being
   * fetched a second time from the same endpoint.
   */
  lago_ids: string[];
}

interface RawWallet {
  lago_id?: string;
  status?: string;
  created_at?: string;
  credits_balance?: string | number;
  credits_ongoing_usage_balance?: string | number;
  rate_amount?: string | number;
  currency?: string;
}

const num = (v: unknown): number => Number(v) || 0;

/** `lago.service.js#getWallet` — summed across every active wallet. */
export async function getWallet(orgId: string): Promise<LagoWallet | null> {
  const payload = await get<{ wallets?: RawWallet[] } | null>("/wallets", {
    external_customer_id: String(orgId),
  });

  const active = (payload?.wallets ?? [])
    .filter((w) => w.status === "active")
    .sort((a, b) => String(a.created_at ?? "").localeCompare(String(b.created_at ?? "")));

  if (active.length === 0) return null;

  return {
    credits_balance: active.reduce((t, w) => t + num(w.credits_balance), 0),
    credits_ongoing_usage_balance: active.reduce((t, w) => t + num(w.credits_ongoing_usage_balance), 0),
    rate_amount: active[0].rate_amount === undefined ? null : num(active[0].rate_amount),
    currency: active[0].currency ?? null,
    active_wallet_count: active.length,
    lago_ids: active.map((w) => w.lago_id).filter((id): id is string => typeof id === "string" && id !== ""),
  };
}

export interface LagoSubscription {
  external_id: string;
  plan_code: string;
  plan_amount_cents: number | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
}

/** `lago.service.js#getSubscription`, read path only — the active subscription. */
export async function getSubscription(orgId: string): Promise<LagoSubscription | null> {
  const payload = await get<{ subscriptions?: Array<Record<string, unknown>> } | null>("/subscriptions", {
    external_customer_id: String(orgId),
    "status[]": "active",
  });

  const active = (payload?.subscriptions ?? []).find((s) => s.status === "active");
  if (!active) return null;

  return {
    external_id: String(active.external_id ?? orgId),
    plan_code: String(active.plan_code ?? ""),
    plan_amount_cents: active.plan_amount_cents === undefined || active.plan_amount_cents === null
      ? null
      : num(active.plan_amount_cents),
    status: String(active.status),
    current_period_start: (active.current_billing_period_started_at as string) ?? null,
    current_period_end: (active.current_billing_period_ending_at as string) ?? null,
  };
}

/**
 * Every active subscription, org id → Lago `plan_code`.
 *
 * Same endpoint and same `status[]=active` filter as `getSubscription` above —
 * without the `external_customer_id` narrowing, so one request answers the whole
 * universe instead of one per org.
 *
 * Plan §5/02 says "batched for the page". A page of 25 orgs would be 25 round
 * trips, and the `paid` / `free` header filters need the plan for orgs that are
 * *not* on the current page — you cannot filter a 493-org universe down to the
 * paid ones from 25 answers. One cached listing does both jobs; at 493 orgs it
 * is at most five pages of 100.
 *
 * Cached for 5 minutes, the same TTL plan §4.1 sets for the msg91 org list.
 */
export async function activePlanCodeByOrg(): Promise<Map<string, string>> {
  return cached("lago:active-subscriptions", MSG91_CACHE_TTL_MS, async () => {
    const byOrg = new Map<string, string>();
    let page = 1;

    // 100 per page over a universe of a few hundred orgs. The cap is the same
    // guard `listOrgUsers` uses: a wrong `meta` must not loop forever.
    for (; page <= 50; page += 1) {
      const payload = await get<{
        subscriptions?: Array<Record<string, unknown>>;
        meta?: { total_pages?: number; current_page?: number };
      } | null>("/subscriptions", { "status[]": "active", per_page: 100, page });

      const batch = payload?.subscriptions ?? [];
      for (const sub of batch) {
        const orgId = sub.external_customer_id ?? sub.external_id;
        if (orgId === undefined || orgId === null) continue;
        const code = sub.plan_code;
        if (typeof code !== "string" || code === "") continue;
        byOrg.set(String(orgId), code);
      }

      const totalPages = Number(payload?.meta?.total_pages) || 0;
      if (batch.length === 0 || page >= totalPages) break;
    }

    return byOrg;
  });
}

/**
 * Lago `plan_code` → our slug, `configs/billingPlans.js#planSlugForCode`.
 *
 * `LAGO_PLAN_CODE_FREE` / `LAGO_PLAN_CODE_PAID` are per-environment and are the
 * authority when set. When they are not, we fall back to gtwy-node's own slug
 * vocabulary — `billingPlan.validation.js` restricts `billing_plans.plan_code`
 * to exactly `"free"` or `"paid"`, and this deployment's `billing_plans` holds
 * those two codes — rather than reporting every org as free.
 *
 * A code we did not create maps to `null`, and the caller applies gtwy-node's
 * `DEFAULT_PLAN_SLUG` ("free"), exactly as `getOrgPlanSlug` does.
 */
export function planSlugForCode(planCode: string | null | undefined): "free" | "paid" | null {
  if (!planCode) return null;

  const free = env.lagoPlanCodeFree();
  const paid = env.lagoPlanCodePaid();
  if (paid && planCode === paid) return "paid";
  if (free && planCode === free) return "free";
  if (free || paid) return null;

  const slug = planCode.toLowerCase();
  if (slug === "paid") return "paid";
  if (slug === "free") return "free";
  return null;
}

/**
 * Our slug → the Lago `plan_code`, `configs/billingPlans.js#planCodeFor`.
 *
 * The inverse of {@link planSlugForCode} and it degrades the same way: the
 * per-environment `LAGO_PLAN_CODE_*` variables are the authority when set, and
 * when they are not we ask Lago for the slug verbatim rather than guess. If no
 * Lago plan carries that code Lago answers 404, `getPlan` returns `null`, and
 * the Billing plans card renders price / orgs / MRR as em dashes (plan §7) —
 * which is the honest answer, not an invented price.
 *
 * gtwy-node throws here instead; throwing is right when you are about to *move*
 * a subscription and wrong when you are only reporting on one.
 */
export function lagoPlanCodeForSlug(slug: string): string {
  const configured = slug.toLowerCase() === "paid" ? env.lagoPlanCodePaid() : slug.toLowerCase() === "free" ? env.lagoPlanCodeFree() : undefined;
  return configured ?? slug;
}

/** `lago.service.js#getLagoPlan` — the plan's price, for the Billing plans page. */
export async function getPlan(planCode: string) {
  const payload = await get<{ plan?: Record<string, unknown> } | null>(
    `/plans/${encodeURIComponent(planCode)}`,
  );
  const plan = payload?.plan;
  if (!plan) return null;
  return {
    code: String(plan.code),
    name: (plan.name as string) ?? null,
    amount_cents: num(plan.amount_cents),
    amount_currency: (plan.amount_currency as string) ?? null,
    interval: (plan.interval as string) ?? null,
  };
}

/** `lago.service.js#listSubscriptionsByPlan` — org count and MRR per plan. */
export async function listSubscriptionsByPlan(
  planCode: string,
  opts: { perPage?: number; page?: number } = {},
) {
  const payload = await get<{ subscriptions?: Array<Record<string, unknown>>; meta?: Record<string, unknown> } | null>(
    "/subscriptions",
    { plan_code: planCode, "status[]": "active", per_page: opts.perPage ?? 100, page: opts.page ?? 1 },
  );
  return {
    subscriptions: payload?.subscriptions ?? [],
    meta: payload?.meta ?? {},
  };
}

/** `lago.service.js#listInvoices`, newest first. `orgId` omitted lists platform-wide. */
export async function listInvoices(opts: { orgId?: string; perPage?: number; page?: number } = {}) {
  const payload = await get<{ invoices?: Array<Record<string, unknown>> } | null>("/invoices", {
    external_customer_id: opts.orgId ? String(opts.orgId) : undefined,
    per_page: opts.perPage ?? 25,
    page: opts.page ?? 1,
  });
  return payload?.invoices ?? [];
}

/** One row of the wallet ledger, normalised as `lago.service.js` normalises it. */
export interface LagoWalletTransaction {
  lago_id: string | null;
  /** `inbound` — credits added · `outbound` — credits spent. */
  direction: string;
  status: string | null;
  credits: number;
  /** Lago's own `source`: `manual`, `interval`, `threshold`, … */
  source: string | null;
  created_at: string | null;
  settled_at: string | null;
  /** The `[{ key, value }]` tag list, flattened — gtwy-node tags its own writes. */
  metadata: Record<string, string>;
}

/**
 * Wallet ledger — the Workspace Billing tab's credits list.
 *
 * The path is `lago.service.js#listWalletTransactions`'s own:
 * `GET /wallets/{wallet_id}/wallet_transactions`, newest first. Lago also
 * exposes a flat `/wallet_transactions`, but the wallet-scoped route is the one
 * gtwy-node proves against this deployment, so it is the one we use.
 */
export async function listWalletTransactions(
  walletId: string,
  opts: { perPage?: number } = {},
): Promise<LagoWalletTransaction[]> {
  const payload = await get<{ wallet_transactions?: Array<Record<string, unknown>> } | null>(
    `/wallets/${encodeURIComponent(walletId)}/wallet_transactions`,
    { page: 1, per_page: opts.perPage ?? 25 },
  );

  return (payload?.wallet_transactions ?? [])
    .map((t) => ({
      lago_id: (t.lago_id as string) ?? null,
      direction: String(t.transaction_type ?? ""),
      status: (t.status as string) ?? null,
      credits: num(t.credit_amount),
      source: (t.source as string) ?? null,
      created_at: (t.created_at as string) ?? null,
      settled_at: (t.settled_at as string) ?? null,
      metadata: Object.fromEntries(
        ((t.metadata as Array<{ key?: unknown; value?: unknown }>) ?? []).map((m) => [
          String(m?.key ?? ""),
          String(m?.value ?? ""),
        ]),
      ),
    }))
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

/** Credits → USD, using gtwy's own `LAGO_CREDIT_RATE_USD`. */
export function creditsToUsd(credits: number): number {
  return credits * env.lagoCreditRateUsd();
}
