import type { NextRequest } from "next/server";

import { assertOrgId, readJsonBody, requiredString } from "@/lib/api/body";
import { ApiError, ok } from "@/lib/api/envelope";
import { orgNameOrNull } from "@/lib/api/orgName";
import { withAdmin, type AdminContext } from "@/lib/auth/withAdmin";
import { writeAudit } from "@/lib/audit/writeAudit";
import { blockOrg } from "@/lib/clients/gtwy";
import { isOrgBlocked } from "@/lib/queries/blockedOrgs";
import { orgExistsInDb } from "@/lib/queries/orgDirectory";

/**
 * `POST /api/admin/orgs/:orgId/block` — body `{ reason }`, required (plan §3).
 *
 * **Proxied, never written directly.** `blockedOrg.controller.js#blockOrg` does
 * two things: it upserts `blocked_orgs` *and* it adds the org to the Redis set
 * `AIMIDDLEWARE_${ENVIRONMENT}_${redis_keys.blocked_orgs_}`. The Redis set is
 * what the gateway actually consults, so a block written only to Mongo would
 * leave the org serving traffic. This console has no Redis, so gtwy-node has to
 * perform the block.
 *
 * The caller's own session JWT is read out of the httpOnly cookie and forwarded
 * as `Authorization: <jwt>`, so gtwy-node's `middleware` + `InternalAuth`
 * re-authorise independently: if it says 403, we say 403. We mint no token, sign
 * none, and spoof no identity (plan §14.2).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ orgId: string }> };

export const POST = withAdmin<RouteCtx>(async (req: NextRequest, ctx: AdminContext, routeCtx: RouteCtx) => {
  const orgId = assertOrgId((await routeCtx.params).orgId);
  const reason = requiredString(await readJsonBody(req), "reason");

  // Our own Mongo, not msg91's (cached, and not guaranteed to carry every org
  // right now). An id this console has never seen data for cannot be blocked,
  // and calling gtwy-node anyway would write an audit row for an org that never
  // existed.
  if (!(await orgExistsInDb(orgId))) {
    throw new ApiError("not_found", `Org ${orgId} not found.`);
  }

  // Read before acting, so the audit row's `before` states what was true rather
  // than what is usually true — `blockOrg` is an upsert, so re-blocking an org
  // that is already blocked succeeds, and `{ blocked: false }` would be a lie.
  const wasBlocked = await isOrgBlocked(orgId);

  // Throws on any non-2xx, which `withAdmin` renders as the §1.4 envelope with
  // gtwy-node's status preserved. Nothing below this line runs on failure, so a
  // failed action writes no audit row (plan §3).
  await blockOrg(orgId, reason, ctx.jwt);

  const { written } = await writeAudit({
    admin_email: ctx.email,
    action: "block_org",
    target_type: "org",
    target_id: orgId,
    target_name: await orgNameOrNull(orgId),
    before: { blocked: wasBlocked },
    after: { blocked: true, reason },
    reason,
    ip: ctx.ip,
  });

  return ok({ orgId, blocked: true, auditWritten: written });
});
