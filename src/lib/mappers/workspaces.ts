import type { WorkspaceRow } from "@/mocks/types";
import { EM_DASH, orgLabel, planTag } from "@/lib/mappers/primitives";

/**
 * `GET /api/admin/workspaces` → the `WorkspaceRow[]` the design renders.
 *
 * The three `null`-tolerant branches are plan §7's degradation, not design copy:
 * a missing name renders `org <id>` (§4.1), and a missing plan or member count
 * renders an em dash. Only the affected cell changes; the row still renders.
 */

// ------------------------------------------------------- the wire contract ---
//
// Defined here rather than beside the queries because both halves need it and
// `lib/sources/workspaces.ts` carries `server-only`. Raw values only, plan §1.3.

export type WorkspaceFilter = "all" | "paid" | "free";

export const WORKSPACE_FILTERS: WorkspaceFilter[] = ["all", "paid", "free"];

/** Plan §5 / Q48: 25 where the design does not specify. */
export const DEFAULT_PAGE_SIZE = 25;

export interface WorkspaceRowRaw {
  orgId: string;
  /** `null` when msg91 could not supply a name; renders `org <id>` (§4.1). */
  name: string | null;
  ownerEmail: string | null;
  /**
   * `null` when Lago is unreachable — plan §7 degrades the cell, not the page —
   * or, when the list's `plansPending` is set, not fetched yet.
   */
  plan: "PAID" | "FREE" | null;
  agents: number;
}

export interface WorkspaceListRaw {
  rows: WorkspaceRowRaw[];
  total: number;
  page: number;
  pageSize: number;
  /**
   * True when the rows were sent without waiting for Lago (the "all" filter).
   * Every `plan` is then `null`, and the page fills the column from
   * `GET /api/admin/workspaces/plans`.
   */
  plansPending: boolean;
  /**
   * Which optional upstream failed on this request (plan §7). The page does not
   * render it; it is what lets QA tell a real em dash from an outage em dash.
   */
  degraded: { orgNames: boolean; plan: boolean };
}

/** `GET /api/admin/workspaces/plans?orgIds=` — org id → plan, for the rows on screen. */
export interface WorkspacePlansRaw {
  plans: Record<string, "PAID" | "FREE">;
  /** Lago was unreachable; `plans` is empty and the cells render an em dash. */
  degraded: boolean;
}

/** The most org ids one plans request may ask about — a page is at most 200. */
export const MAX_PLAN_ORG_IDS = 200;

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

export function mapWorkspaceRow(raw: WorkspaceRowRaw, plansPending = false): WorkspaceRow {
  const plan = raw.plan ?? (plansPending ? null : EM_DASH);
  return {
    id: raw.orgId,
    name: orgLabel(raw.orgId, raw.name),
    owner: raw.ownerEmail ?? EM_DASH,
    plan,
    planTag: planTag(plan ?? EM_DASH),
    agents: raw.agents,
  };
}

export type ResolvedPlans = Record<string, NonNullable<WorkspaceRow["plan"]>>;

/**
 * One plans answer → a cell value for every org it was asked about. An org it
 * does not name — Lago degraded, or the request failed — resolves to an em dash
 * rather than loading forever.
 */
export function resolveWorkspacePlans(orgIds: string[], raw: WorkspacePlansRaw | null): ResolvedPlans {
  return Object.fromEntries(orgIds.map((id) => [id, raw?.plans[id] ?? EM_DASH]));
}

/** Fills the deferred plan cells that have resolved; the rest stay loading. */
export function applyWorkspacePlans(rows: WorkspaceRow[], resolved: ResolvedPlans): WorkspaceRow[] {
  return rows.map((row) => {
    const plan = row.plan === null ? resolved[row.id] : undefined;
    return plan === undefined ? row : { ...row, plan, planTag: planTag(plan) };
  });
}

export function mapWorkspaceList(raw: WorkspaceListRaw): WorkspaceListPage {
  return {
    rows: raw.rows.map((row) => mapWorkspaceRow(row, raw.plansPending)),
    total: raw.total,
    page: raw.page,
    pageSize: raw.pageSize,
  };
}
