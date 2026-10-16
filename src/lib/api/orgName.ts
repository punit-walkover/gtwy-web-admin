import "server-only";

import { getUserById, orgNameMap } from "@/lib/clients/msg91";

/**
 * msg91 lookups that must never fail the thing they decorate (plan §7,
 * "partial": a provider outage degrades a cell, it does not blank a page — and
 * it certainly does not fail an action that already succeeded).
 *
 * Both helpers below swallow and log. Their callers treat `null` as "msg91
 * could not say", which the design already renders as `org <id>` or an em dash.
 */

/** Org name for the audit row's `target_name` and the blocked list's Workspace column. */
export async function orgNameOrNull(orgId: string): Promise<string | null> {
  try {
    const names = await orgNameMap();
    return names.get(String(orgId)) ?? null;
  } catch (err) {
    console.error("[admin-api] org name lookup failed", { orgId }, err);
    return null;
  }
}

/** Org names for several ids in one cached msg91 read. */
export async function orgNamesOrEmpty(): Promise<Map<string, string | null>> {
  try {
    return await orgNameMap();
  } catch (err) {
    console.error("[admin-api] org name map lookup failed", err);
    return new Map();
  }
}

/**
 * `blocked_orgs.blocked_by` holds a msg91 **user id** (plan §3). The design's
 * "Blocked by" column shows a person, so the id is resolved here — e-mail first,
 * then name, and the raw id when msg91 has no answer.
 */
export async function adminLabelForUserId(userId: string | null): Promise<string | null> {
  if (!userId) return null;
  try {
    const user = await getUserById(userId);
    return user?.email || user?.name || userId;
  } catch (err) {
    console.error("[admin-api] blocked_by lookup failed", { userId }, err);
    return userId;
  }
}
