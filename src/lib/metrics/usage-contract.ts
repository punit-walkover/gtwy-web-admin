/**
 * The wire contract for `GET /api/admin/usage` (plan §5, "06 — Usage").
 *
 * Client-safe on purpose: the page, the mapper and the route all need these
 * names, and only the query module next door may touch a database. Nothing here
 * imports `server-only`, and nothing here holds a value that came from the
 * environment.
 *
 * Raw values only, per plan §1.3 — counts, token totals, milliseconds, percent
 * as a number, cost as a number. The `"252.5M"` and the `"1.35 s"` are produced
 * by `src/lib/mappers/usage.ts` and nowhere else.
 */

/** Plan §5/06 and §4.5 Q22: the page's three windows, and they are live. */
export const USAGE_RANGES = ["7d", "30d", "90d"] as const;

export type UsageRange = (typeof USAGE_RANGES)[number];

/** The Segmented control on `/usage` opens on 30d, so the API default matches. */
export const DEFAULT_USAGE_RANGE: UsageRange = "30d";

export function isUsageRange(value: unknown): value is UsageRange {
  return typeof value === "string" && (USAGE_RANGES as readonly string[]).includes(value);
}

/** Calendar days behind each window. `daily_data` retention is 1 year (plan §4.3). */
export const USAGE_RANGE_DAYS: Record<UsageRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

/** One row per `daily_data.service` in the window. The design shows no latency here. */
export interface UsageServiceTotals {
  name: string;
  calls: number;
  tokens: number;
  /** USD — plan §4.5 Q24 treats `cost_sum` as dollars. */
  cost: number;
}

/** One row per `(model, service)` pair in the window. */
export interface UsageModelTotals {
  name: string;
  service: string;
  calls: number;
  tokens: number;
  /**
   * True `percentile_cont(0.5)`, never `latency_sum / record_count` (plan §5/06,
   * §4.4). `null` when the raw source has no row for this model, or when the
   * percentile query exceeded the statement timeout — the page renders "—".
   */
  p50LatencyMs: number | null;
  /** 0–100. */
  successRate: number;
  /** USD. */
  cost: number;
}

export interface PlatformUsage {
  range: UsageRange;
  services: UsageServiceTotals[];
  models: UsageModelTotals[];
}
