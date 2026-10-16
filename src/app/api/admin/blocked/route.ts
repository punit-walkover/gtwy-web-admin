import type { NextRequest } from "next/server";

import { ok } from "@/lib/api/envelope";
import { adminLabelForUserId, orgNamesOrEmpty } from "@/lib/api/orgName";
import { withAdmin } from "@/lib/auth/withAdmin";
import type { RawBlockedOrg } from "@/lib/mappers/blocked";
import { listBlockedOrgs } from "@/lib/queries/blockedOrgs";

/**
 * `GET /api/admin/blocked` → Mongo `blocked_orgs`, plus the names msg91 supplies
 * (plan §5 page 04, §4.1).
 *
 * Mongo is the primary source and msg91 only decorates it: if msg91 is slow or
 * down the list still renders, with `name: null` (the page shows `org <id>`) and
 * `blockedBy` left as the raw user id. Plan §7's "partial" rule — a provider
 * outage must not blank a page.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withAdmin(async (_req: NextRequest) => {
  const docs = await listBlockedOrgs();

  // One cached msg91 company read for the whole list, and one user read per
  // distinct `blocked_by` — blocked orgs are a handful of rows, and the same
  // admin usually blocked several of them.
  const distinctBlockers = [...new Set(docs.map((d) => d.blocked_by).filter((id): id is string => Boolean(id)))];

  const [names, blockerEntries] = await Promise.all([
    orgNamesOrEmpty(),
    Promise.all(distinctBlockers.map(async (id) => [id, await adminLabelForUserId(id)] as const)),
  ]);
  const blockers = new Map(blockerEntries);

  const rows: RawBlockedOrg[] = docs.map((doc) => ({
    orgId: doc.org_id,
    name: names.get(doc.org_id) ?? null,
    reason: doc.reason ?? null,
    blockedBy: doc.blocked_by ? (blockers.get(doc.blocked_by) ?? doc.blocked_by) : null,
    blockedAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
  }));

  return ok(rows);
});
