import { ok } from "@/lib/api/envelope";
import { withAdmin } from "@/lib/auth/withAdmin";
import { getEmbedDetail } from "@/lib/sources/embeds";

type RouteCtx = { params: Promise<{ folderId: string }> };

/**
 * `GET /api/admin/embeds/:folderId` — the stored `FolderSchema.config` (every
 * flag, `slide`, `themeMode`, `configureGtwyRedirection`, `embed_id`) plus
 * `folder_limit` / `folder_usage` / reset period, and the four header KPIs.
 */
export const GET = withAdmin<RouteCtx>(async (_req, _ctx, routeCtx) => {
  const { folderId } = await routeCtx.params;
  return ok(await getEmbedDetail(folderId));
});

export const dynamic = "force-dynamic";
