/**
 * The wire contract for the three `/api/admin/overview/*` routes (plan §5,
 * "01 — Overview").
 *
 * Client-safe on purpose, exactly as `usage-contract.ts` is: the page, the
 * mapper and the routes all need these names, and only the query module next
 * door may touch a database. Nothing here imports `server-only` and nothing here
 * holds a value that came from the environment.
 *
 * Raw values only, per plan §1.3 — counts, percent as a number, milliseconds.
 * The `"17.9k"`, the `"2.84 s"` and the `"−0.3 pt"` are produced by
 * `src/lib/mappers/overview.ts` and nowhere else.
 */

/** Plan §5/01 and §4.5 Q22: the page's three windows, and they are live. */
export const OVERVIEW_RANGES = ["24h", "7d", "30d"] as const;

export type OverviewRange = (typeof OVERVIEW_RANGES)[number];

/** The Segmented control on `/` opens on 24h, so the API default matches. */
export const DEFAULT_OVERVIEW_RANGE: OverviewRange = "24h";

export function isOverviewRange(value: unknown): value is OverviewRange {
  return typeof value === "string" && (OVERVIEW_RANGES as readonly string[]).includes(value);
}

/** Window length. The delta window is the same length again, immediately before. */
export const OVERVIEW_RANGE_MS: Record<OverviewRange, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

/** Plan §4.5 Q25: ten rows in each of the two Overview tables. */
export const OVERVIEW_ROW_LIMIT = 10;

/** Highest limit a caller may ask for, so `?limit=` cannot become a table scan. */
export const OVERVIEW_MAX_LIMIT = 50;

/**
 * The error rate above which an agent counts as degraded.
 *
 * Same threshold and same strictness as `primitives.ts#agentHealth`, because the
 * "N agents above 8% error" line under the Failed-calls KPI and the Agents tab's
 * healthy/degraded tag must never disagree about the same agent.
 */
export const DEGRADED_ERROR_RATE_PCT = 8;

export interface OverviewDeltas {
  /**
   * Percent change in call volume against the preceding window of equal length.
   * `null` when the preceding window has no data at all — see the note on
   * `daily_data` freshness in `overview.ts`.
   */
  callsPct: number | null;
  /** Success-rate change in **percentage points**, not percent. `null` as above. */
  successRatePoints: number | null;
  /**
   * p95 change in milliseconds, positive meaning slower. `null` when either
   * window's p95 is unavailable, or when the two windows would have to be read
   * from different sources — see `p95SourceFor` in `overview.ts`.
   */
  p95LatencyMs: number | null;
  /**
   * How many `(bridge_id, model)` agents exceeded `DEGRADED_ERROR_RATE_PCT` in
   * the window. The design renders this as the Failed-calls KPI's own delta line
   * ("3 agents above 8% error"), which is a count and not a comparison.
   */
  agentsAboveErrorThreshold: number;
}

export interface OverviewKpis {
  range: OverviewRange;
  calls: number;
  /** 0–100. `null` when the window recorded no calls, so there is no rate. */
  successRate: number | null;
  failedCalls: number;
  /**
   * True `percentile_cont(0.95)`, never `latency_sum / record_count` (plan §4.4).
   * `null` when the source has no row in the window, or when the percentile query
   * exceeded the statement timeout — the page renders "—" and still loads.
   */
  p95LatencyMs: number | null;
  deltas: OverviewDeltas;
}

/** One `(bridge_id, model)` pair from the window, worst by failed calls first. */
export interface FailingAgentRow {
  bridgeId: string;
  /** Mongo `configurations.name`. `null` when the agent has been deleted since. */
  name: string | null;
  orgId: string;
  /** msg91 company name. `null` degrades to `org <id>` (plan §4.1, §7). */
  orgName: string | null;
  model: string | null;
  calls: number;
  failed: number;
  /** 0–100. */
  errorRate: number;
}

/** One org from the window, worst success rate first. */
export interface OrgSuccessRateRow {
  orgId: string;
  orgName: string | null;
  calls: number;
  /** 0–100. */
  successRate: number;
}
