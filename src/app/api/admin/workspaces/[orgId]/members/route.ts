import type { NextRequest } from "next/server";

import { assertOrgId } from "@/lib/api/body";
import { ok } from "@/lib/api/envelope";
import { withAdmin, type AdminContext } from "@/lib/auth/withAdmin";
import { listWorkspaceMembers } from "@/lib/sources/workspaceDetail";

/**
 * `GET /api/admin/workspaces/:orgId/members` — msg91 `getProxyDetails`, plan §4.2.
 *
 * Plan §9 gap 6 is **closed rather than applied**: the raw msg91 row carries
 * `role`, `last_login_at` and `created_at`, confirmed live, so Role, Last
 * active and Joined all keep their source. Only the fields the design renders
 * leave the server.
 *
 * Raw values only (plan §1.3). An org with nothing to show answers `[]` rather
 * than 404, so one empty tab never blanks the page (plan §5/03).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ orgId: string }> };

export const GET = withAdmin<RouteCtx>(
  async (_req: NextRequest, _ctx: AdminContext, routeCtx: RouteCtx) =>
    ok(await listWorkspaceMembers(assertOrgId((await routeCtx.params).orgId))),
);
