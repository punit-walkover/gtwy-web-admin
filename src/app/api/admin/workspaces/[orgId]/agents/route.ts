import type { NextRequest } from "next/server";

import { assertOrgId } from "@/lib/api/body";
import { ok } from "@/lib/api/envelope";
import { withAdmin, type AdminContext } from "@/lib/auth/withAdmin";
import { listWorkspaceAgents } from "@/lib/sources/workspaceDetail";

/**
 * `GET /api/admin/workspaces/:orgId/agents` — Mongo `configurations` joined
 * with Timescale `daily_data` (plan §5 "03").
 *
 * The `daily_data` half is **one** grouped query for the whole agent set, keyed
 * on this org's own `org_id` column — never one query per row (plan §5/03
 * revision 4 item 3). Every value in it is a bind parameter (§4.3).
 *
 * Raw values only (plan §1.3). An org with nothing to show answers `[]` rather
 * than 404, so one empty tab never blanks the page (plan §5/03).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ orgId: string }> };

export const GET = withAdmin<RouteCtx>(
  async (_req: NextRequest, _ctx: AdminContext, routeCtx: RouteCtx) =>
    ok(await listWorkspaceAgents(assertOrgId((await routeCtx.params).orgId))),
);
