import "server-only";

import { collection, MONGO_MAX_TIME_MS } from "@/lib/db/mongo";

/**
 * Mongo `internal_orgs`, read-only (plan §5, item 11).
 *
 * **Why this is a direct read and not a proxy.** gtwy-node has its own
 * `GET /api/internal-orgs`, but `internalOrgs.controller.js#buildRow` decorates
 * every row with a Lago wallet, subscription and shadow-balance lookup — three
 * provider round-trips per org, for a credits dashboard we are not building.
 * The only question this console asks is *is this org on the list*, which the
 * collection answers on its own. The four **writes** still proxy, because those
 * carry side effects we cannot reproduce (plan §3).
 */

/** `mongoModel/InternalOrg.model.js`, with the `timestamps: true` pair. */
export interface InternalOrgDoc {
  org_id: string;
  /** msg91 company name, captured when the org was added. */
  name: string | null;
  /** E-mail of the internal user who added it. */
  added_by: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export const INTERNAL_ORGS_COLLECTION = "internal_orgs";

/**
 * Every internal org.
 *
 * Sorted `{ name: 1, org_id: 1 }` — the order `internalOrg.service.js#list`
 * already uses, so both consoles list the same orgs in the same order.
 */
export async function listInternalOrgs(): Promise<InternalOrgDoc[]> {
  const internal = await collection<InternalOrgDoc>(INTERNAL_ORGS_COLLECTION);
  return internal
    .find({}, { projection: { _id: 0, org_id: 1, name: 1, added_by: 1, createdAt: 1, updatedAt: 1 } })
    .sort({ name: 1, org_id: 1 })
    .maxTimeMS(MONGO_MAX_TIME_MS)
    .toArray();
}

/** Mirrors `internalOrg.service.js#getByOrg`. Fills the audit row's `before`. */
export async function isOrgInternal(orgId: string): Promise<boolean> {
  const internal = await collection<InternalOrgDoc>(INTERNAL_ORGS_COLLECTION);
  const hit = await internal.findOne(
    { org_id: String(orgId) },
    { projection: { _id: 1 }, maxTimeMS: MONGO_MAX_TIME_MS },
  );
  return hit !== null;
}
