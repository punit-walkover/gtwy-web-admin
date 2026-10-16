import "server-only";

import { collection, MONGO_MAX_TIME_MS } from "@/lib/db/mongo";

/**
 * Mongo `blocked_orgs`, read-only (plan §5, page 04).
 *
 * The collection is gtwy-node's, declared in `mongoModel/BlockedOrg.model.js`
 * and written only by `blockedOrg.controller.js`. We read it and never write it
 * — the block and unblock actions proxy to gtwy-node, because the Mongo row is
 * only half of what a block is: the other half is the Redis set the gateway
 * actually consults (plan §3).
 */

/** `mongoModel/BlockedOrg.model.js`, with the `timestamps: true` pair. */
export interface BlockedOrgDoc {
  org_id: string;
  reason: string | null;
  /**
   * msg91 **user id**, exactly as `blockedOrg.controller.js#blockOrg` writes it
   * (`req.profile?.user?.id`). Plan §3 is explicit that this field keeps its
   * meaning; the admin's e-mail goes in `admin_audit_logs` instead, and the
   * "Blocked by" column resolves this id through msg91 at read time.
   */
  blocked_by: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export const BLOCKED_ORGS_COLLECTION = "blocked_orgs";

/**
 * Every blocked org, newest first.
 *
 * gtwy-node's own `blockedOrgService.getAll()` applies no sort; the design's
 * table reads as a recency list, so the order is applied here rather than left
 * to Mongo's natural order. `createdAt` exists on every row the current model
 * writes (`timestamps: true`).
 */
export async function listBlockedOrgs(): Promise<BlockedOrgDoc[]> {
  const blocked = await collection<BlockedOrgDoc>(BLOCKED_ORGS_COLLECTION);
  return blocked
    .find({}, { projection: { _id: 0, org_id: 1, reason: 1, blocked_by: 1, createdAt: 1, updatedAt: 1 } })
    .sort({ createdAt: -1 })
    .maxTimeMS(MONGO_MAX_TIME_MS)
    .toArray();
}

/**
 * Whether one org is blocked right now.
 *
 * Mirrors `blockedOrgService.isBlocked`. Used to fill the audit row's `before`
 * with what was actually true rather than with an assumption (plan §3.1).
 */
export async function isOrgBlocked(orgId: string): Promise<boolean> {
  const blocked = await collection<BlockedOrgDoc>(BLOCKED_ORGS_COLLECTION);
  const hit = await blocked.findOne(
    { org_id: String(orgId) },
    { projection: { _id: 1 }, maxTimeMS: MONGO_MAX_TIME_MS },
  );
  return hit !== null;
}
