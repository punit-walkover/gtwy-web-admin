import type { NextRequest } from "next/server";

import { assertOrgId } from "@/lib/api/body";
import { ok } from "@/lib/api/envelope";
import { withAdmin, type AdminContext } from "@/lib/auth/withAdmin";
import { listWorkspaceEmbeds } from "@/lib/sources/workspaceDetail";

/**
 * `GET /api/admin/workspaces/:orgId/embeds` — Mongo `folders` where
 * `type: "embed"`, narrowed to this org.
 *
 * It calls D5's own `listEmbeds` with an org filter, so the agent and
 * `daily_data` joins are reused rather than written a second time (plan §5/03).
 *
 * Raw values only (plan §1.3). An org with nothing to show answers `[]` rather
 * than 404, so one empty tab never blanks the page (plan §5/03).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ orgId: string }> };

export const GET = withAdmin<RouteCtx>(
  async (_req: NextRequest, _ctx: AdminContext, routeCtx: RouteCtx) =>
    ok(await listWorkspaceEmbeds(assertOrgId((await routeCtx.params).orgId))),
);
