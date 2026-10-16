import type { NextRequest } from "next/server";

import { assertOrgId } from "@/lib/api/body";
import { ok } from "@/lib/api/envelope";
import { withAdmin, type AdminContext } from "@/lib/auth/withAdmin";
import { getWorkspaceHeader } from "@/lib/sources/workspaceDetail";

/**
 * `GET /api/admin/workspaces/:orgId` → the header, the five KPIs and the tab
 * counts (plan §5 "03 — Workspace detail").
 *
 * Raw values only, per plan §1.3: counts, ISO-8601 dates, enum codes, `null`
 * for an absent value. `"112.8k"`, `"$160.64"` and `"tag-accent"` are the
 * mapper's job, not this route's.
 *
 * `:orgId` is the msg91 company id — a **string**, never cast to `ObjectId`. An
 * org no plane has ever heard of is `404 not_found`; the eight tab routes
 * answer with an empty array instead, so one empty tab never blanks the page.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ orgId: string }> };

export const GET = withAdmin<RouteCtx>(
  async (_req: NextRequest, _ctx: AdminContext, routeCtx: RouteCtx) =>
    ok(await getWorkspaceHeader(assertOrgId((await routeCtx.params).orgId))),
);
