import type { NextRequest } from "next/server";

import { assertOrgId } from "@/lib/api/body";
import { ok } from "@/lib/api/envelope";
import { withAdmin, type AdminContext } from "@/lib/auth/withAdmin";
import { listWorkspaceKnowledgeBases } from "@/lib/sources/workspaceDetail";

/**
 * `GET /api/admin/workspaces/:orgId/knowledge-bases` — Mongo `rag_collections`.
 *
 * **Chunks** is not here (plan §9 gap 4: it lives in Hippocampus, outside the
 * approved scope) and neither is **Used by** (gap 5: D3 confirmed on live data
 * that no agent configuration references a `collection_id`).
 *
 * Raw values only (plan §1.3). An org with nothing to show answers `[]` rather
 * than 404, so one empty tab never blanks the page (plan §5/03).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ orgId: string }> };

export const GET = withAdmin<RouteCtx>(
  async (_req: NextRequest, _ctx: AdminContext, routeCtx: RouteCtx) =>
    ok(await listWorkspaceKnowledgeBases(assertOrgId((await routeCtx.params).orgId))),
);
