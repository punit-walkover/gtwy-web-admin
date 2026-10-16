import "server-only";

import { ObjectId } from "mongodb";

import { orgNamesOrEmpty } from "@/lib/api/orgName";
import { MONGO_MAX_TIME_MS, mongoDb } from "@/lib/db/mongo";
import { query, queryOrNull } from "@/lib/db/sql";
import {
  DEGRADED_ERROR_RATE_PCT,
  OVERVIEW_RANGE_MS,
  type FailingAgentRow,
  type OrgSuccessRateRow,
  type OverviewKpis,
  type OverviewRange,
} from "@/lib/metrics/overview-contract";

/**
 * The Overview page's three reads (plan §5, "01 — Overview", with §4.3 and §4.4).
 *
 * ## Which table answers which window (plan §4.3)
 *
 * Retention, from `migrations/timescale/20240301071935-add-retention-policy.cjs`:
 * `metrics_raw_data` 1 day · `fifteen_minute_data` 1 day · `daily_data` 1 year.
 * So the rule is not "24h means fifteen_minute_data" but "a window whose *start*
 * is still inside the last 24 hours can be read from the fifteen-minute table;
 * anything older must come from `daily_data`". `tableFor()` below is that one
 * sentence, and it reproduces §4.3's table exactly while also answering the case
 * §4.3 does not tabulate — the *preceding* window behind each delta.
 *
 * That matters most at `range=24h`, where the current window is
 * `fifteen_minute_data` but the window it is compared against is 24–48 h old and
 * `fifteen_minute_data` has already dropped it. The comparison therefore reads
 * `daily_data`, which is the only table that retains it.
 *
 * > **Measured, and worth knowing.** `daily_data` is filled by TimescaleDB's own
 * > `insert_into_daily_data` job on a 1-day schedule, so its newest bucket lags
 * > real time. On the live database while building this route, `now()` was
 * > 2026-09-30T10:40Z and `max(created_at)` in `daily_data` was
 * > 2026-09-28T00:00Z — nearly two days behind. Where the preceding window has
 * > no bucket yet, the delta is `null` and the design renders "—"; the KPI value
 * > itself is unaffected. This is a property of the ingestion job, not of this
 * > code, and it is reported on the issue rather than papered over with a
 * > different window.
 *
 * ## p95 is a percentile, never an average (plan §4.4)
 *
 * `latency_sum / record_count` is a mean and is not used here for anything.
 * The p95 comes from raw per-request rows:
 *
 *  - a window inside the last 24 h → Timescale `metrics_raw_data`, column
 *    `latency`;
 *  - anything older → Postgres `conversation_logs`,
 *    `(latency->>'over_all_time')::float8` — the same expression gtwy-node's
 *    `analytics.service.js#getResponseTime` uses.
 *
 * **Units.** Both columns are **seconds**, not milliseconds. Measured on the
 * live databases: `metrics_raw_data.latency` samples 4.00 / 2.79 / 0.87 / 0.62
 * with a 24 h p95 of 22.07, and `conversation_logs.latency.over_all_time`
 * samples 4.81 / 5.06 / 1.69. The API returns milliseconds because that is the
 * raw unit plan §1.3 asks for, so the `× 1000` happens here, once.
 *
 * A p95 delta is only computed when **both** windows resolve to the same source.
 * At `range=24h` they do not — the current window is `metrics_raw_data` and the
 * preceding one can only be `conversation_logs`, and the two do not cover the
 * same set of requests (341 rows against 215 for the same 24 hours on the live
 * data). Subtracting one from the other would report an ingestion difference as
 * a latency change, so that delta is `null` and renders "—".
 *
 * Every value is a bind parameter. gtwy-node's
 * `metrics.utils.js#buildWhereClause` interpolates values straight into the SQL
 * string; plan §4.3 says explicitly that we do not copy that pattern. The table
 * *name* is concatenated, but only ever from the two-member union below — it can
 * never carry anything a caller supplied.
 */

type AggregateTable = "fifteen_minute_data" | "daily_data";
type P95Source = "metrics_raw_data" | "conversation_logs";

export interface TimeWindow {
  from: Date;
  to: Date;
}

export interface OverviewWindows {
  current: TimeWindow;
  previous: TimeWindow;
}

/** The window, and the window of equal length immediately before it (plan §5/01). */
export function windowsFor(range: OverviewRange, now: Date = new Date()): OverviewWindows {
  const span = OVERVIEW_RANGE_MS[range];
  const to = now;
  const from = new Date(now.getTime() - span);
  return {
    current: { from, to },
    previous: { from: new Date(from.getTime() - span), to: from },
  };
}

/** `fifteen_minute_data` and `metrics_raw_data` both retain exactly one day. */
const RAW_RETENTION_MS = 24 * 60 * 60 * 1000;

function servedByRawTables(window: TimeWindow, now: Date): boolean {
  return window.from.getTime() >= now.getTime() - RAW_RETENTION_MS;
}

/** Plan §4.3, as one rule rather than a lookup table. */
export function tableFor(window: TimeWindow, now: Date): AggregateTable {
  return servedByRawTables(window, now) ? "fifteen_minute_data" : "daily_data";
}

/** Plan §4.4, same rule applied to the two raw latency sources. */
export function p95SourceFor(window: TimeWindow, now: Date): P95Source {
  return servedByRawTables(window, now) ? "metrics_raw_data" : "conversation_logs";
}

// ------------------------------------------------------------------- SQL ---

function totalsSql(table: AggregateTable): string {
  return (
    "SELECT COALESCE(SUM(record_count),  0)::float8 AS calls," +
    "       COALESCE(SUM(success_count), 0)::float8 AS successes" +
    "  FROM " +
    table +
    " WHERE created_at >= $1 AND created_at < $2"
  );
}

/**
 * How many agents sat above the degraded threshold in the window.
 *
 * Grouped by `(bridge_id, model)` — the same grain the failing-agents table
 * uses — so the KPI's "N agents above 8% error" always counts the same rows the
 * table below it can show.
 */
function degradedAgentCountSql(table: AggregateTable): string {
  return (
    "SELECT COUNT(*)::int AS n FROM (" +
    "  SELECT bridge_id, model," +
    "         COALESCE(SUM(record_count),  0)::float8 AS calls," +
    "         COALESCE(SUM(success_count), 0)::float8 AS successes" +
    "    FROM " +
    table +
    "   WHERE created_at >= $1 AND created_at < $2 AND bridge_id IS NOT NULL" +
    "   GROUP BY bridge_id, model" +
    "  HAVING COALESCE(SUM(record_count), 0) > 0" +
    "     AND (COALESCE(SUM(record_count), 0) - COALESCE(SUM(success_count), 0))" +
    "         / COALESCE(SUM(record_count), 0) * 100 > $3" +
    ") agents"
  );
}

/** `metrics_raw_data.latency` is already a per-request number of seconds. */
const RAW_P95_SQL =
  "SELECT percentile_cont(0.95) WITHIN GROUP (ORDER BY latency) AS p95_seconds" +
  "  FROM metrics_raw_data" +
  " WHERE created_at >= $1 AND created_at < $2 AND latency IS NOT NULL";

/**
 * Both windows in one pass over `conversation_logs`, so the 7d/30d page pays for
 * one scan rather than two. The NULL guard is the one gtwy-node itself applies
 * (`analytics.service.js:126`).
 */
const LOG_P95_SQL =
  "SELECT percentile_cont(0.95) WITHIN GROUP (" +
  "         ORDER BY (latency->>'over_all_time')::float8" +
  "       ) FILTER (WHERE created_at >= $1 AND created_at < $2) AS current_p95_seconds," +
  "       percentile_cont(0.95) WITHIN GROUP (" +
  "         ORDER BY (latency->>'over_all_time')::float8" +
  "       ) FILTER (WHERE created_at >= $3 AND created_at < $4) AS previous_p95_seconds" +
  "  FROM conversation_logs" +
  " WHERE created_at >= $3 AND created_at < $2" +
  "   AND (latency->>'over_all_time') IS NOT NULL";

/**
 * Plan §5/01: grouped by `bridge_id, model`, worst by failed calls first.
 *
 * `org_id` joins the GROUP BY only so the row can carry it — an agent belongs to
 * exactly one org, so it splits nothing. An agent with no failures is not a
 * failing agent, hence the HAVING.
 */
function failingAgentsSql(table: AggregateTable): string {
  return (
    "SELECT org_id, bridge_id, model," +
    "       COALESCE(SUM(record_count),  0)::float8 AS calls," +
    "       COALESCE(SUM(success_count), 0)::float8 AS successes" +
    "  FROM " +
    table +
    " WHERE created_at >= $1 AND created_at < $2" +
    "   AND bridge_id IS NOT NULL AND org_id IS NOT NULL" +
    " GROUP BY org_id, bridge_id, model" +
    " HAVING COALESCE(SUM(record_count), 0) - COALESCE(SUM(success_count), 0) > 0" +
    " ORDER BY COALESCE(SUM(record_count), 0) - COALESCE(SUM(success_count), 0) DESC," +
    "          bridge_id ASC" +
    " LIMIT $3"
  );
}

/** Plan §5/01: grouped by `org_id`, **worst first**. */
function orgRatesSql(table: AggregateTable): string {
  return (
    "SELECT org_id," +
    "       COALESCE(SUM(record_count),  0)::float8 AS calls," +
    "       COALESCE(SUM(success_count), 0)::float8 AS successes" +
    "  FROM " +
    table +
    " WHERE created_at >= $1 AND created_at < $2 AND org_id IS NOT NULL" +
    " GROUP BY org_id" +
    " HAVING COALESCE(SUM(record_count), 0) > 0" +
    " ORDER BY COALESCE(SUM(success_count), 0) / COALESCE(SUM(record_count), 0) ASC," +
    "          org_id ASC" +
    " LIMIT $3"
  );
}

// ----------------------------------------------------------------- reads ---

interface TotalsRow {
  calls: number;
  successes: number;
}

interface CountRow {
  n: number;
}

interface RawP95Row {
  p95_seconds: number | null;
}

interface LogP95Row {
  current_p95_seconds: number | null;
  previous_p95_seconds: number | null;
}

interface AgentRow {
  org_id: string;
  bridge_id: string;
  model: string | null;
  calls: number;
  successes: number;
}

interface OrgRow {
  org_id: string;
  calls: number;
  successes: number;
}

async function totals(window: TimeWindow, now: Date): Promise<TotalsRow> {
  const rows = await query<TotalsRow>("timescale", totalsSql(tableFor(window, now)), [
    window.from,
    window.to,
  ]);
  return { calls: Number(rows[0]?.calls ?? 0), successes: Number(rows[0]?.successes ?? 0) };
}

function seconds(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toMs(value: number | null): number | null {
  return value === null ? null : Math.round(value * 1000);
}

/**
 * The p95 for the window and, when the same source can serve both, for the one
 * before it.
 *
 * `queryOrNull` is the plan §4.4 risk in code: a percentile over
 * `conversation_logs` may exceed the 5 s statement timeout, and when it does the
 * KPI is `null` and renders "—" while the rest of the page loads.
 */
async function p95Pair(
  windows: OverviewWindows,
  now: Date,
): Promise<{ current: number | null; previous: number | null }> {
  const currentSource = p95SourceFor(windows.current, now);
  const previousSource = p95SourceFor(windows.previous, now);

  if (currentSource === "conversation_logs" && previousSource === "conversation_logs") {
    const rows = await queryOrNull<LogP95Row>("postgres", LOG_P95_SQL, [
      windows.current.from,
      windows.current.to,
      windows.previous.from,
      windows.previous.to,
    ]);
    return {
      current: toMs(seconds(rows?.[0]?.current_p95_seconds)),
      previous: toMs(seconds(rows?.[0]?.previous_p95_seconds)),
    };
  }

  // `metrics_raw_data` can serve the current window but never the one before it
  // (1-day retention), so there is no like-for-like comparison to make.
  const rows = await queryOrNull<RawP95Row>("timescale", RAW_P95_SQL, [
    windows.current.from,
    windows.current.to,
  ]);
  return { current: toMs(seconds(rows?.[0]?.p95_seconds)), previous: null };
}

function rate(successes: number, calls: number): number | null {
  return calls > 0 ? (successes / calls) * 100 : null;
}

export async function loadOverviewKpis(
  range: OverviewRange,
  now: Date = new Date(),
): Promise<OverviewKpis> {
  const windows = windowsFor(range, now);

  const [current, previous, degraded, p95] = await Promise.all([
    totals(windows.current, now),
    totals(windows.previous, now),
    query<CountRow>("timescale", degradedAgentCountSql(tableFor(windows.current, now)), [
      windows.current.from,
      windows.current.to,
      DEGRADED_ERROR_RATE_PCT,
    ]),
    p95Pair(windows, now),
  ]);

  const currentRate = rate(current.successes, current.calls);
  const previousRate = rate(previous.successes, previous.calls);

  return {
    range,
    calls: current.calls,
    successRate: currentRate,
    failedCalls: current.calls - current.successes,
    p95LatencyMs: p95.current,
    deltas: {
      callsPct: previous.calls > 0 ? ((current.calls - previous.calls) / previous.calls) * 100 : null,
      successRatePoints:
        currentRate !== null && previousRate !== null ? currentRate - previousRate : null,
      p95LatencyMs: p95.current !== null && p95.previous !== null ? p95.current - p95.previous : null,
      agentsAboveErrorThreshold: Number(degraded[0]?.n ?? 0),
    },
  };
}

/** Mongo `_id` is an ObjectId; `daily_data.bridge_id` is its 24-hex string form. */
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

/**
 * Agent names for the bridges in the window, from Mongo `configurations`
 * (plan §5/01). Read-only, projected to the one field the design renders.
 *
 * Degrades like every other decoration in plan §7: a Mongo failure logs and
 * leaves the names `null`, and the mapper falls back to `agent <id>`.
 */
async function agentNames(bridgeIds: string[]): Promise<Map<string, string>> {
  const ids = bridgeIds.filter((id) => OBJECT_ID.test(id)).map((id) => new ObjectId(id));
  if (ids.length === 0) return new Map();

  try {
    const db = await mongoDb();
    const rows = await db
      .collection("configurations")
      .find({ _id: { $in: ids } }, { projection: { name: 1 }, maxTimeMS: MONGO_MAX_TIME_MS })
      .toArray();

    const byId = new Map<string, string>();
    for (const row of rows) {
      const name = typeof row.name === "string" ? row.name.trim() : "";
      if (name !== "") byId.set(String(row._id), name);
    }
    return byId;
  } catch (err) {
    console.error("[admin-api] agent name lookup failed", err);
    return new Map();
  }
}

export async function loadFailingAgents(
  range: OverviewRange,
  limit: number,
  now: Date = new Date(),
): Promise<FailingAgentRow[]> {
  const window = windowsFor(range, now).current;

  const rows = await query<AgentRow>("timescale", failingAgentsSql(tableFor(window, now)), [
    window.from,
    window.to,
    limit,
  ]);
  if (rows.length === 0) return [];

  const [names, orgNames] = await Promise.all([
    agentNames(rows.map((row) => row.bridge_id)),
    orgNamesOrEmpty(),
  ]);

  return rows.map((row) => {
    const calls = Number(row.calls);
    const failed = calls - Number(row.successes);
    return {
      bridgeId: row.bridge_id,
      name: names.get(row.bridge_id) ?? null,
      orgId: row.org_id,
      orgName: orgNames.get(row.org_id) ?? null,
      model: row.model || null,
      calls,
      failed,
      errorRate: calls > 0 ? (failed / calls) * 100 : 0,
    };
  });
}

export async function loadOrgSuccessRates(
  range: OverviewRange,
  limit: number,
  now: Date = new Date(),
): Promise<OrgSuccessRateRow[]> {
  const window = windowsFor(range, now).current;

  const rows = await query<OrgRow>("timescale", orgRatesSql(tableFor(window, now)), [
    window.from,
    window.to,
    limit,
  ]);
  if (rows.length === 0) return [];

  const orgNames = await orgNamesOrEmpty();

  return rows.map((row) => {
    const calls = Number(row.calls);
    return {
      orgId: row.org_id,
      orgName: orgNames.get(row.org_id) ?? null,
      calls,
      successRate: calls > 0 ? (Number(row.successes) / calls) * 100 : 0,
    };
  });
}

/** Exported for `scripts/verify-d1.mjs`, which re-runs them against hand totals. */
export const OVERVIEW_SQL = {
  totalsSql,
  degradedAgentCountSql,
  failingAgentsSql,
  orgRatesSql,
  RAW_P95_SQL,
  LOG_P95_SQL,
};
