import type { NextRequest } from "next/server";

import { ok } from "@/lib/api/envelope";
import { withAdmin } from "@/lib/auth/withAdmin";
import { readRange } from "@/lib/api/overviewParams";
import { loadOverviewKpis } from "@/lib/metrics/overview";

/**
 * `GET /api/admin/overview/kpis?range=24h|7d|30d` (plan §5, "01 — Overview").
 *
 * → `{ range, calls, successRate, failedCalls, p95LatencyMs,
 *      deltas: { callsPct, successRatePoints, p95LatencyMs, agentsAboveErrorThreshold } }`
 *
 * Read-only. Behind `withAdmin` like every other `/api/admin/*` route (plan
 * §2.4) and answering in the plan §1.4 envelope, which `ok()` and the wrapper's
 * own error funnel produce — this file never builds a response by hand.
 *
 * `successRate` and `p95LatencyMs` are `null` rather than 0 when they cannot be
 * computed: 0% success and 0 ms latency are both real readings and would lie.
 * The design renders a `null` as "—" (plan §4.4, §7).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withAdmin(async (req: NextRequest) => ok(await loadOverviewKpis(readRange(req))));
