import type { NextRequest } from "next/server";

import { ApiError, ok } from "@/lib/api/envelope";
import { withAdmin } from "@/lib/auth/withAdmin";
import { listWorkspaces } from "@/lib/sources/workspaces";
import {
  DEFAULT_PAGE_SIZE,
  WORKSPACE_FILTERS,
  type WorkspaceFilter,
} from "@/lib/mappers/workspaces";

/**
 * `GET /api/admin/workspaces?page&pageSize=25&filter=all|paid|free|blocked&q=`
 * → `{ rows, total, page, pageSize, degraded }` (plan §5 "02 — Workspaces list").
 *
 * Raw values only, per plan §1.3: numbers, enum codes, `null` for an absent
 * value. `"48.7k"`, `"$85.35"` and `"tag-accent"` are the mapper's job, not this
 * route's.
 *
 * `q` matches **org id and org name only** — plan §4.5 Q20 and §9 gap 11. Search
 * by member e-mail would need a user fetch per org and is out of scope for v1.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withAdmin(async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;

  const rawFilter = params.get("filter") ?? "all";
  if (!WORKSPACE_FILTERS.includes(rawFilter as WorkspaceFilter)) {
    throw new ApiError("bad_request", `filter must be one of ${WORKSPACE_FILTERS.join(", ")}.`);
  }

  const data = await listWorkspaces({
    page: numberParam(params.get("page"), 1),
    pageSize: numberParam(params.get("pageSize"), DEFAULT_PAGE_SIZE),
    filter: rawFilter as WorkspaceFilter,
    q: params.get("q") ?? "",
  });

  return ok(data);
});

function numberParam(raw: string | null, fallback: number): number {
  if (raw === null || raw.trim() === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new ApiError("bad_request", "page and pageSize must be numbers.");
  return n;
}
