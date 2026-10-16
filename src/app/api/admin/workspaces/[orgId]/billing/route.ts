import type { NextRequest } from "next/server";

import { assertOrgId } from "@/lib/api/body";
import { ok } from "@/lib/api/envelope";
import { withAdmin, type AdminContext } from "@/lib/auth/withAdmin";
import { getWorkspaceBilling } from "@/lib/sources/workspaceDetail";

/**
 * `GET /api/admin/workspaces/:orgId/billing` — Lago wallet, subscription and
 * wallet transactions, plus Mongo `failed_billing_debits`.
 *
 * **GET only.** Plan §6 leaves Top up wallet, Change plan, Sync balance and
 * Replay debits visible-but-disabled, so this route has no write counterpart
 * and must not grow one — plan §1.2: our APIs write to `admin_audit_logs` and
 * nowhere else.
 *
 * **Lago unreachable is not an error here** (plan §7). Every Lago-sourced field
 * comes back `null` and renders as an em dash, the failed-debit count still
 * comes from Mongo, and the tab renders. `lagoUnavailable` on the payload is
 * what lets QA tell a real "—" from an outage "—".
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ orgId: string }> };

export const GET = withAdmin<RouteCtx>(
  async (_req: NextRequest, _ctx: AdminContext, routeCtx: RouteCtx) =>
    ok(await getWorkspaceBilling(assertOrgId((await routeCtx.params).orgId))),
);
