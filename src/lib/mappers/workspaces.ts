import type { WorkspaceRow } from "@/mocks/types";
import {
  EM_DASH,
  errColor,
  fmt,
  oneDecimal,
  orgLabel,
  orgStatusTag,
  planTag,
  usd,
} from "@/lib/mappers/primitives";

/**
 * `GET /api/admin/workspaces` → the `WorkspaceRow[]` the design renders.
 *
 * Every rule here was read off the frozen fixtures in `src/mocks/workspaces.ts`
 * and is re-derived from them in `tests/workspaces.test.ts`:
 *
 *   callsFmt  48 700  → "48.7k"    `compact1`
 *   spendFmt  85.35   → "$85.35"   `usd`
 *   errRate   4.5531  → "4.6"      `oneDecimal`, accented from 5 % up
 *
 * The three `null`-tolerant branches are plan §7's degradation, not design copy:
 * a missing name renders `org <id>` (§4.1), and a missing plan or member count
 * renders an em dash. Only the affected cell changes; the row still renders.
 */

// ------------------------------------------------------- the wire contract ---
//
// Defined here rather than beside the queries because both halves need it and
// `lib/sources/workspaces.ts` carries `server-only`. Raw values only, plan §1.3.

export type WorkspaceFilter = "all" | "paid" | "free" | "blocked";

export const WORKSPACE_FILTERS: WorkspaceFilter[] = ["all", "paid", "free", "blocked"];

/** Plan §5 / Q48: 25 where the design does not specify. */
export const DEFAULT_PAGE_SIZE = 25;

export interface WorkspaceRowRaw {
  orgId: string;
  /** `null` when msg91 could not supply a name; renders `org <id>` (§4.1). */
  name: string | null;
  ownerEmail: string | null;
  /** `null` when Lago is unreachable — plan §7 degrades the cell, not the page. */
  plan: "PAID" | "FREE" | null;
  agents: number;
  /** `null` when this org's msg91 member lookup failed. */
  members: number | null;
  calls30d: number;
  /** USD — plan §4.5 Q24 treats `daily_data.cost_sum` as dollars. */
  spend30d: number;
  /** Percent, 0–100. */
  errorRate: number;
  status: "active" | "blocked";
}

export interface WorkspaceListRaw {
  rows: WorkspaceRowRaw[];
  total: number;
  page: number;
  pageSize: number;
  /**
   * Which optional upstream failed on this request (plan §7). The page does not
   * render it; it is what lets QA tell a real em dash from an outage em dash.
   */
  degraded: { orgNames: boolean; plan: boolean; members: boolean };
}

export interface WorkspaceListQuery {
  page?: number;
  pageSize?: number;
  filter?: WorkspaceFilter;
  q?: string;
}

/** The shape the page consumes — the design's rows plus the paging numbers. */
export interface WorkspaceListPage {
  rows: WorkspaceRow[];
  total: number;
  page: number;
  pageSize: number;
}

export function mapWorkspaceRow(raw: WorkspaceRowRaw): WorkspaceRow {
  const plan = raw.plan ?? EM_DASH;
  return {
    id: raw.orgId,
    name: orgLabel(raw.orgId, raw.name),
    owner: raw.ownerEmail ?? EM_DASH,
    plan,
    planTag: planTag(plan),
    agents: raw.agents,
    members: raw.members ?? EM_DASH,
    // `daily_data.record_count` is `double precision` holding whole calls; round
    // before formatting so a float artefact cannot render as "868.0000001".
    callsFmt: fmt(Math.round(raw.calls30d)),
    spendFmt: usd(raw.spend30d),
    errRate: oneDecimal(raw.errorRate),
    errColor: errColor(raw.errorRate),
    status: raw.status,
    statusTag: orgStatusTag(raw.status),
  };
}

export function mapWorkspaceList(raw: WorkspaceListRaw): WorkspaceListPage {
  return {
    rows: raw.rows.map(mapWorkspaceRow),
    total: raw.total,
    page: raw.page,
    pageSize: raw.pageSize,
  };
}
