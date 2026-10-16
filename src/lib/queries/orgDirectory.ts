import "server-only";

import { collection, MONGO_MAX_TIME_MS } from "@/lib/db/mongo";
import { isOrgBlocked } from "@/lib/queries/blockedOrgs";

/**
 * "Is this org id real?" answered from our own Mongo, not msg91's org list.
 *
 * msg91's `getallOrgs` is cached for 5 minutes (plan §4.1) and is a snapshot of
 * *msg91's* company table — an org this console has data for (it owns agents,
 * has a billing row, has made API calls, or is already blocked) is real
 * regardless of whether that cache happens to carry it right now. A hit on any
 * of these collections is enough; a miss on all of them means this id has never
 * touched the platform.
 */
async function hasDocWithOrgId(collectionName: string, orgId: string): Promise<boolean> {
  const col = await collection(collectionName);
  const hit = await col.findOne({ org_id: orgId }, { projection: { _id: 1 }, maxTimeMS: MONGO_MAX_TIME_MS });
  return hit !== null;
}

export async function orgExistsInDb(orgId: string): Promise<boolean> {
  const id = String(orgId);

  const [configured, billed, called, blocked] = await Promise.all([
    hasDocWithOrgId("configurations", id),
    hasDocWithOrgId("org_billings", id),
    hasDocWithOrgId("apicalls", id),
    isOrgBlocked(id),
  ]);

  return configured || billed || called || blocked;
}
