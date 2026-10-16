import type { NextRequest } from "next/server";

import { ok } from "@/lib/api/envelope";
import { withAdmin } from "@/lib/auth/withAdmin";
import { DEFAULT_PAGE_SIZE, listEmbeds } from "@/lib/sources/embeds";

/**
 * `GET /api/admin/embeds?page&pageSize=25` — plan §5 “05 — Embeds”.
 *
 * Mongo `folders {type:"embed"}`, joined for the current page only with agent
 * counts, `daily_data` calls and msg91 org names (plan §4.1).
 */
export const GET = withAdmin(async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page") ?? 1);
  const pageSize = Number(params.get("pageSize") ?? DEFAULT_PAGE_SIZE);

  return ok(await listEmbeds({ page, pageSize }));
});

export const dynamic = "force-dynamic";
