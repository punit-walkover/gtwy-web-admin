import { ok } from "@/lib/api/envelope";
import { withAdmin } from "@/lib/auth/withAdmin";
import { listEmbedAgents } from "@/lib/sources/embeds";

type RouteCtx = { params: Promise<{ folderId: string }> };

/**
 * `GET /api/admin/embeds/:folderId/agents` — Mongo `configurations` by
 * `folder_id` (the query `analytics.controller.js#getEmbedAnalytics` uses),
 * joined with `daily_data` per `bridge_id` for calls and error rate.
 */
export const GET = withAdmin<RouteCtx>(async (_req, _ctx, routeCtx) => {
  const { folderId } = await routeCtx.params;
  return ok(await listEmbedAgents(folderId));
});

export const dynamic = "force-dynamic";
