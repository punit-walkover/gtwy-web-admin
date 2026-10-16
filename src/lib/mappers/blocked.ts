import type { BlockedRow } from "@/mocks/types";

import { istDateTime, orDash, orgLabel } from "./primitives";

/**
 * `GET /api/admin/blocked` → the design's `BlockedRow` (plan §1.3).
 *
 * The route emits raw values — ids, a nullable reason, an ISO-8601 timestamp —
 * and this is the only place they become the strings `src/mocks/types.ts`
 * declares. `tests/blocked.test.ts` re-derives every rule below from the frozen
 * `src/mocks/workspaces.ts` fixture.
 */

/** What the route returns, one row per `blocked_orgs` document. */
export interface RawBlockedOrg {
  orgId: string;
  /** msg91 company name, or `null` when msg91 could not supply one (plan §4.1). */
  name: string | null;
  reason: string | null;
  /**
   * `blocked_orgs.blocked_by` resolved through msg91 to an e-mail or name.
   * Falls back to the raw user id, which is what the column shows when msg91 is
   * down or the user no longer exists — plan §3, and §7's "partial" rule.
   */
  blockedBy: string | null;
  /** ISO-8601. `null` for a row written before the model carried timestamps. */
  blockedAt: string | null;
}

export function mapBlockedRow(raw: RawBlockedOrg): BlockedRow {
  return {
    id: raw.orgId,
    // The fixture carries a real company name; §4.1 says an org msg91 cannot
    // name renders as `org <id>`, which is also what the second line shows.
    name: orgLabel(raw.orgId, raw.name),
    reason: orDash(raw.reason),
    by: orDash(raw.blockedBy),
    // `istDateTime` returns "" for a null date; the design renders an em dash
    // for an absent value, never an empty cell.
    at: raw.blockedAt ? istDateTime(raw.blockedAt) : orDash(null),
  };
}

export function mapBlockedRows(raw: RawBlockedOrg[]): BlockedRow[] {
  return raw.map(mapBlockedRow);
}

/**
 * `GET /api/admin/internal-orgs`. No page renders this today — the control it
 * feeds lives on the Workspace detail page and belongs to D3 (plan §5 item 11,
 * revision 3) — so there is no design type to map to and the raw shape is the
 * contract D3 consumes.
 */
export interface RawInternalOrg {
  orgId: string;
  name: string | null;
  addedBy: string | null;
  /** ISO-8601. */
  addedAt: string | null;
}
