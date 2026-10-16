import type { NextRequest } from "next/server";

import { assertOrgId } from "@/lib/api/body";
import { ok } from "@/lib/api/envelope";
import { withAdmin, type AdminContext } from "@/lib/auth/withAdmin";
import { listWorkspaceApiKeys } from "@/lib/sources/workspaceDetail";

/**
 * `GET /api/admin/workspaces/:orgId/apikeys` — Mongo `apikeycredentials`.
 *
 * The key is masked server-side with gtwy-node's own `Helper.maskApiKey`
 * over `Helper.decrypt`. **The plaintext key never appears in this response**:
 * an absent `Secret_IV` / `Encreaption_key`, or a decrypt that fails, degrades
 * to a fixed placeholder mask and logs once — never a 500 and never plaintext.
 *
 * Raw values only (plan §1.3). An org with nothing to show answers `[]` rather
 * than 404, so one empty tab never blanks the page (plan §5/03).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ orgId: string }> };

export const GET = withAdmin<RouteCtx>(
  async (_req: NextRequest, _ctx: AdminContext, routeCtx: RouteCtx) =>
    ok(await listWorkspaceApiKeys(assertOrgId((await routeCtx.params).orgId))),
);
