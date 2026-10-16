import type { NextRequest } from "next/server";

import { assertOrgId } from "@/lib/api/body";
import { ApiError, ok } from "@/lib/api/envelope";
import { withAdmin, type AdminContext } from "@/lib/auth/withAdmin";
import { getWorkspaceUsage, USAGE_RANGE_DAYS, type UsageRange } from "@/lib/sources/workspaceDetail";

/**
 * `GET /api/admin/workspaces/:orgId/usage?range=7d|30d|90d` — Timescale
 * `daily_data`, three grouped reads: by `service`, by `model`, and by day.
 *
 * The range toggle is a real filter (plan §4.5 Q22) and drives the two bar
 * lists. The daily series stays at 30 days whatever it says, because the design
 * labels that section "Daily calls · 30d".
 *
 * Every value is a bind parameter. gtwy-node's `metrics.utils.js#buildWhereClause`
 * interpolates straight into the string; plan §4.3 says we do not copy that.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RANGES = Object.keys(USAGE_RANGE_DAYS) as UsageRange[];

type RouteCtx = { params: Promise<{ orgId: string }> };

export const GET = withAdmin<RouteCtx>(
  async (req: NextRequest, _ctx: AdminContext, routeCtx: RouteCtx) => {
    const orgId = assertOrgId((await routeCtx.params).orgId);

    const raw = req.nextUrl.searchParams.get("range") ?? "30d";
    if (!RANGES.includes(raw as UsageRange)) {
      throw new ApiError("bad_request", `range must be one of ${RANGES.join(", ")}.`);
    }

    return ok(await getWorkspaceUsage(orgId, raw as UsageRange));
  },
);
