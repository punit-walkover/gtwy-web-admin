import type { NextRequest } from "next/server";

import { assertOrgId } from "@/lib/api/body";
import { ok } from "@/lib/api/envelope";
import { withAdmin, type AdminContext } from "@/lib/auth/withAdmin";
import { listWorkspaceTools } from "@/lib/sources/workspaceDetail";

/**
 * `GET /api/admin/workspaces/:orgId/tools` — Mongo `apicalls`, with attached-to
 * resolved the way `apiCall.service.js#getAgentsAndVersionsByFunctionIds` does.
 *
 * **Endpoint** and **Auth type** are not here (plan §9 gap 2) and neither are
 * **Calls · 30d** and **Fail %** (gap 3) — none of the four has a source.
 *
 * Raw values only (plan §1.3). An org with nothing to show answers `[]` rather
 * than 404, so one empty tab never blanks the page (plan §5/03).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ orgId: string }> };

export const GET = withAdmin<RouteCtx>(
  async (_req: NextRequest, _ctx: AdminContext, routeCtx: RouteCtx) =>
    ok(await listWorkspaceTools(assertOrgId((await routeCtx.params).orgId))),
);
