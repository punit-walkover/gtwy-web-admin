import type { FailingAgent, Kpi, OrgRate } from "@/mocks/types";
import {
  DEGRADED_ERROR_RATE_PCT,
  type FailingAgentRow,
  type OrgSuccessRateRow,
  type OverviewKpis,
  type OverviewRange,
} from "@/lib/metrics/overview-contract";
import { ACCENT, EM_DASH, NEUTRAL_700, fmt, oneDecimal, orgLabel, seconds, thousands } from "./primitives";

/**
 * Raw Overview payloads → the exact strings `src/mocks/overview.ts` renders
 * (plan §1.3).
 *
 * Every rule below is re-derived from that frozen fixture by
 * `tests/overview.test.ts`, so a mapper that drifts from the design fails the
 * build rather than the eye.
 */

/**
 * The design's minus is U+2212 MINUS SIGN, not a hyphen — `"−0.3 pt"` and
 * `"−120 ms"` in the fixture are both U+2212, while the positive sign is a plain
 * ASCII `+`. Typing a hyphen here would be a one-pixel UI change.
 */
const MINUS = "−";

function signed(value: number, render: (magnitude: number) => string): string {
  return (value < 0 ? MINUS : "+") + render(Math.abs(value));
}

/**
 * The heading above the KPI strip names the window the numbers are for.
 *
 * The toggle is live now (plan §4.5 Q22), so this is data rather than copy: at
 * the page's default 24h it renders the design's own "Last 24 hours" unchanged,
 * and it only differs once the reader has asked for a different window.
 */
export const OVERVIEW_RANGE_TITLE: Record<OverviewRange, string> = {
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

/** `"vs prior 24h"` — the Calls delta names the window it is compared against. */
function priorLabel(range: OverviewRange): string {
  return "vs prior " + range;
}

/**
 * A delta's colour marks the *unhealthy* direction, never merely the negative
 * one. All four fixture KPIs agree: `+4.2%` calls is neutral, `−0.3 pt` success
 * is accented, `−120 ms` p95 is neutral because faster is better, and the
 * failed-calls line is accented because three agents are above the threshold.
 */
function tone(unhealthy: boolean): string {
  return unhealthy ? ACCENT : NEUTRAL_700;
}

export function mapKpis(raw: OverviewKpis): Kpi[] {
  const { callsPct, successRatePoints, p95LatencyMs, agentsAboveErrorThreshold } = raw.deltas;

  return [
    {
      label: "Calls",
      value: fmt(raw.calls),
      delta:
        callsPct === null
          ? EM_DASH
          : signed(callsPct, (n) => oneDecimal(n) + "%") + " " + priorLabel(raw.range),
      deltaColor: tone(callsPct !== null && callsPct < 0),
    },
    {
      label: "Success rate",
      // Two decimals here, unlike the one-decimal rates in the tables — the
      // fixture reads "93.26%", and a platform-wide rate moves in hundredths.
      value: raw.successRate === null ? EM_DASH : raw.successRate.toFixed(2) + "%",
      delta:
        successRatePoints === null
          ? EM_DASH
          : signed(successRatePoints, (n) => oneDecimal(n)) + " pt",
      deltaColor: tone(successRatePoints !== null && successRatePoints < 0),
    },
    {
      label: "Failed calls",
      value: fmt(raw.failedCalls),
      delta:
        (agentsAboveErrorThreshold === 1 ? "1 agent" : agentsAboveErrorThreshold + " agents") +
        " above " +
        DEGRADED_ERROR_RATE_PCT +
        "% error",
      deltaColor: tone(agentsAboveErrorThreshold > 0),
    },
    {
      label: "p95 latency",
      value: raw.p95LatencyMs === null ? EM_DASH : seconds(raw.p95LatencyMs),
      delta:
        p95LatencyMs === null ? EM_DASH : signed(p95LatencyMs, (n) => Math.round(n) + " ms"),
      // Slower is the unhealthy direction, so a positive delta is the accented one.
      deltaColor: tone(p95LatencyMs !== null && p95LatencyMs > 0),
    },
  ];
}

/**
 * Plan §4.1's `org <id>` fallback, applied to an agent.
 *
 * `configurations.name` defaults to the empty string and an agent can be deleted
 * between the metric row being written and this page being read, so the cell
 * needs something that still links somewhere useful.
 */
export function agentLabel(bridgeId: string, name: string | null | undefined): string {
  return name && name !== "" ? name : `agent ${bridgeId}`;
}

/**
 * The error-rate meter's fill.
 *
 * The fixture pins the scale exactly: 11.9% → 71.4, 11.2% → 67.19999999999999,
 * 13.6% → 81.6 — each is the *rounded* percentage times six, float artefacts and
 * all, so the bar saturates at a 16.7% error rate. Capped, because `BarMeter`
 * writes the value straight into a CSS width and 120% would overflow the track.
 */
function meterPct(ratePct: string): number {
  return Math.min(100, Number(ratePct) * 6);
}

export function mapFailingAgents(raw: FailingAgentRow[]): FailingAgent[] {
  return raw.map((row) => {
    const rate = oneDecimal(row.errorRate);
    return {
      name: agentLabel(row.bridgeId, row.name),
      ws: orgLabel(row.orgId, row.orgName),
      wsId: row.orgId,
      model: row.model ?? EM_DASH,
      calls: thousands(row.calls),
      failed: thousands(row.failed),
      rate: rate + "%",
      pct: meterPct(rate),
    };
  });
}

export function mapOrgRates(raw: OrgSuccessRateRow[]): OrgRate[] {
  return raw.map((row) => ({
    id: row.orgId,
    name: orgLabel(row.orgId, row.orgName),
    calls: fmt(row.calls),
    // `BarMeter` reads this back with `Number(o.success)` and renders it as
    // `${o.success}%`, so it stays a bare one-decimal number.
    success: oneDecimal(row.successRate),
  }));
}
