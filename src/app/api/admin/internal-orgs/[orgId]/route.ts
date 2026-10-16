import type { NextRequest } from "next/server";

import { assertOrgId } from "@/lib/api/body";
import { ok } from "@/lib/api/envelope";
import { orgNameOrNull } from "@/lib/api/orgName";
import { withAdmin, type AdminContext } from "@/lib/auth/withAdmin";
import { writeAudit } from "@/lib/audit/writeAudit";
import { removeInternalOrg } from "@/lib/clients/gtwy";
import { isOrgInternal } from "@/lib/queries/internalOrgs";

/**
 * `DELETE /api/admin/internal-orgs/:orgId` →
 * `DELETE {GTWY_API_BASE}/api/internal-orgs/:org_id` (plan §3).
 *
 * `internalOrgs.controller.js#removeInternalOrg` answers **404**
 * `org … is not in the internal list` when there was nothing to remove. That is
 * a failure, so the proxy throws and no audit row is written — the same rule
 * that keeps a rejected block out of the log.
 *
 * Removing an org from the list changes nothing about its plan, wallet or
 * billing (`InternalOrg.model.js`); it only stops the credits dashboard being
 * able to top it up.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ orgId: string }> };

export const DELETE = withAdmin<RouteCtx>(async (_req: NextRequest, ctx: AdminContext, routeCtx: RouteCtx) => {
  const orgId = assertOrgId((await routeCtx.params).orgId);

  const wasInternal = await isOrgInternal(orgId);

  await removeInternalOrg(orgId, ctx.jwt);

  const { written } = await writeAudit({
    admin_email: ctx.email,
    action: "remove_internal_org",
    target_type: "org",
    target_id: orgId,
    target_name: await orgNameOrNull(orgId),
    before: { internal: wasInternal },
    after: { internal: false },
    reason: null,
    ip: ctx.ip,
  });

  return ok({ orgId, internal: false, auditWritten: written });
});
