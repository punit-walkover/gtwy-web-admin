import type { NextRequest } from "next/server";

import { ok } from "@/lib/api/envelope";
import { withAdmin } from "@/lib/auth/withAdmin";
import { readLimit, readRange } from "@/lib/api/overviewParams";
import { loadOrgSuccessRates } from "@/lib/metrics/overview";

/**
 * `GET /api/admin/overview/org-rates?range=24h|7d|30d&limit=10`
 * (plan §5, "01 — Overview").
 *
 * → `[{ orgId, orgName, calls, successRate }]`, **worst first** — the design's
 *   own caption under the heading.
 *
 * Read-only, behind `withAdmin`, plan §1.4 envelope. `orgName` is `null` when
 * msg91 cannot answer, which the design renders as `org <id>` (plan §4.1, §7).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withAdmin(async (req: NextRequest) =>
  ok(await loadOrgSuccessRates(readRange(req), readLimit(req))),
);
