import type { NextRequest } from "next/server";

import { ApiError, ok } from "@/lib/api/envelope";
import { withAdmin } from "@/lib/auth/withAdmin";
import { loadPlatformUsage } from "@/lib/metrics/usage";
import {
  DEFAULT_USAGE_RANGE,
  USAGE_RANGES,
  isUsageRange,
} from "@/lib/metrics/usage-contract";

/**
 * `GET /api/admin/usage?range=7d|30d|90d` (plan §5, "06 — Usage").
 *
 * → `{ range, services: [{ name, calls, tokens, cost }],
 *              models:   [{ name, service, calls, tokens, p50LatencyMs, successRate, cost }] }`
 *
 * Read-only. Behind `withAdmin` like every other `/api/admin/*` route (plan
 * §2.4) and answering in the plan §1.4 envelope, which `ok()` and the wrapper's
 * own error funnel produce — this file never builds a response by hand.
 *
 * An unrecognised `range` is `400 bad_request` rather than a silent fallback:
 * the toggle is live now (plan §4.5 Q22), so a window the caller did not ask for
 * would be a wrong answer dressed as a right one.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withAdmin(async (req: NextRequest) => {
  const raw = req.nextUrl.searchParams.get("range");
  if (raw !== null && !isUsageRange(raw)) {
    throw new ApiError("bad_request", `range must be one of ${USAGE_RANGES.join(", ")}.`);
  }

  return ok(await loadPlatformUsage(raw ?? DEFAULT_USAGE_RANGE));
});
