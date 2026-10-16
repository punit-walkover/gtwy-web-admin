import { ok } from "@/lib/api/envelope";
import { withAdmin } from "@/lib/auth/withAdmin";
import { listEmbedEndUsers } from "@/lib/sources/embeds";

type RouteCtx = { params: Promise<{ folderId: string }> };

/**
 * `GET /api/admin/embeds/:folderId/end-users` — plan §4.2.
 *
 * Sessions and calls come from `conversation_logs` grouped by agent owner, the
 * method `embedAnalytics.service.js` already uses. Only the identifier the
 * design renders leaves the server; no other personal field is returned.
 */
export const GET = withAdmin<RouteCtx>(async (_req, _ctx, routeCtx) => {
  const { folderId } = await routeCtx.params;
  return ok(await listEmbedEndUsers(folderId));
});

export const dynamic = "force-dynamic";
