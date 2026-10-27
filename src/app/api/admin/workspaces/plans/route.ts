import type { NextRequest } from "next/server";

import { ApiError, ok } from "@/lib/api/envelope";
import { withAdmin } from "@/lib/auth/withAdmin";
import { planForOrgs } from "@/lib/sources/workspaces";
import { MAX_PLAN_ORG_IDS } from "@/lib/mappers/workspaces";

/**
 * `GET /api/admin/workspaces/plans?orgIds=1,2,3` → `{ plans, degraded }`.
 *
 * The Plan column of the "all" workspaces list, asked for after the rows have
 * rendered. Lago is the slowest source on the list (8–11 s cold), so the list
 * no longer waits for it; this answers from the same 5-minute cache, which the
 * list request has usually already started filling.
 *
 * A static segment, so it wins over the sibling `[orgId]` route.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withAdmin(async (req: NextRequest) => {
  const raw = req.nextUrl.searchParams.get("orgIds") ?? "";
  const orgIds = [...new Set(raw.split(",").map((id) => id.trim()).filter((id) => id !== ""))];

  if (orgIds.length > MAX_PLAN_ORG_IDS) {
    throw new ApiError("bad_request", `orgIds may name at most ${MAX_PLAN_ORG_IDS} orgs.`);
  }

  return ok(await planForOrgs(orgIds));
});
