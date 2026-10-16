import type { NextRequest } from "next/server";

import { ok } from "@/lib/api/envelope";
import { withAdmin } from "@/lib/auth/withAdmin";
import { readLimit, readRange } from "@/lib/api/overviewParams";
import { loadFailingAgents } from "@/lib/metrics/overview";

/**
 * `GET /api/admin/overview/failing-agents?range=24h|7d|30d&limit=10`
 * (plan §5, "01 — Overview").
 *
 * → `[{ bridgeId, name, orgId, orgName, model, calls, failed, errorRate }]`,
 *   worst by failed calls first.
 *
 * Read-only, behind `withAdmin`, plan §1.4 envelope. `name` and `orgName` are
 * decorations from Mongo and msg91 and may be `null` — plan §7's "partial" rule:
 * a provider being down degrades a cell to `agent <id>` / `org <id>`, it never
 * fails the page.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withAdmin(async (req: NextRequest) =>
  ok(await loadFailingAgents(readRange(req), readLimit(req))),
);
