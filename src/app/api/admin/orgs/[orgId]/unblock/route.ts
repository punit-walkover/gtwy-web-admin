import type { NextRequest } from "next/server";

import { assertOrgId } from "@/lib/api/body";
import { ok } from "@/lib/api/envelope";
import { orgNameOrNull } from "@/lib/api/orgName";
import { withAdmin, type AdminContext } from "@/lib/auth/withAdmin";
import { writeAudit } from "@/lib/audit/writeAudit";
import { unblockOrg } from "@/lib/clients/gtwy";
import { isOrgBlocked } from "@/lib/queries/blockedOrgs";

/**
 * `POST /api/admin/orgs/:orgId/unblock` → `DELETE {GTWY_API_BASE}/api/block_org/:org_id`.
 *
 * Proxied for the same reason as block: `blockedOrg.controller.js#unblockOrg`
 * removes the Mongo row **and** `sRem`s the org from the gateway's Redis set.
 * Only the second of those actually restores traffic.
 *
 * `POST` rather than `DELETE` on our side because the resource being changed is
 * the org's blocked state, not a `/blocked/:id` row — and the page's Unblock
 * button posts an action, it does not delete an address. The plan names this
 * route shape in §3.
 *
 * No body. `reason` is optional for this action (plan §3.1) and the design's
 * unblock confirmation does not collect one, so the audit row carries `null`.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ orgId: string }> };

export const POST = withAdmin<RouteCtx>(async (_req: NextRequest, ctx: AdminContext, routeCtx: RouteCtx) => {
  const orgId = assertOrgId((await routeCtx.params).orgId);

  const wasBlocked = await isOrgBlocked(orgId);

  await unblockOrg(orgId, ctx.jwt);

  const { written } = await writeAudit({
    admin_email: ctx.email,
    action: "unblock_org",
    target_type: "org",
    target_id: orgId,
    target_name: await orgNameOrNull(orgId),
    before: { blocked: wasBlocked },
    after: { blocked: false },
    reason: null,
    ip: ctx.ip,
  });

  return ok({ orgId, blocked: false, auditWritten: written });
});
