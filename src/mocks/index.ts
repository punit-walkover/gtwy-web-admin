/**
 * The only place data comes from. Pages import from `@/mocks` and nowhere else.
 * Every accessor is a plain sync function returning a typed literal, so swapping
 * in a real client later is a one-file change.
 */

import { blockedRows } from "./workspaces";

export * from "./types";
export * from "./nav";

/**
 * `/` is live (D1), same treatment as `/usage`: the accessor keeps its name and
 * its `{ kpis, failingAgents, orgRates }` payload and moves to `@/lib/data`, so
 * the page's import specifier is unchanged (plan §1.3). `kpis` / `failingAgents`
 * / `orgRates` stay in `./overview` as the fixture `tests/overview.test.ts`
 * asserts the mappers against.
 */
export {
  getOverview,
  DEFAULT_OVERVIEW_RANGE,
  OVERVIEW_RANGES,
  OVERVIEW_RANGE_TITLE,
  type OverviewRange,
} from "@/lib/data";

/**
 * `/workspaces` is live (D2). The accessor moves to `@/lib/data` so the page's
 * import specifier is unchanged (plan §1.3); its payload gained `total`, `page`
 * and `pageSize` around the same `WorkspaceRow[]`, because the list is paginated
 * and the heading counts the whole filtered set. `workspaceRows` stays in
 * `./workspaces` as the fixture `tests/workspaces.test.ts` asserts against.
 */
export {
  getWorkspaceRows,
  DEFAULT_PAGE_SIZE,
  WORKSPACE_FILTERS,
  type WorkspaceFilter,
  type WorkspaceListPage,
} from "@/lib/data";

/**
 * `/workspaces/[orgId]` is live (D3). The four accessors move to `@/lib/data`
 * so the page's import specifier is unchanged (plan §1.3). Their payload types
 * changed only where plan §9 removed a column that has no data source:
 * `getWorkspace` answers `WorkspaceDetailView`, which is `Workspace` minus the
 * PAuth keys tab, minus Tools' Endpoint / Auth / Calls / Fail, and minus
 * Knowledge bases' Chunks / Used by. `workspaces` / `workspaceDetail` /
 * `wsEmbedRows` stay in `./workspaces` and `./embeds` as the fixtures
 * `tests/workspace-detail.test.ts` asserts the mappers against.
 */
export {
  getWorkspace,
  getWorkspaceDetail,
  getWorkspaceEmbedRows,
  getWorkspaceIds,
} from "@/lib/data";

export const getBlockedRows = () => blockedRows;

/**
 * `/embeds` and `/embeds/[embedId]` are live (D5). The four accessors move to
 * `@/lib/data` so the pages' import specifier is unchanged (plan §1.3).
 * `getEmbedRows` gained `total` / `page` / `pageSize` around the same
 * `EmbedRow[]` for the same reason `getWorkspaceRows` did — the list is
 * paginated and the heading counts the whole set. `embeds` / `embedRows` /
 * `embedDetail` stay in `./embeds` as the fixtures `tests/embeds.test.ts`
 * asserts the mappers against.
 */
export {
  getEmbedRows,
  getEmbed,
  getEmbedDetail,
  getEmbedIds,
  EMBED_PAGE_SIZE,
  type EmbedDetailPanel,
  type EmbedListPage,
  type EmbedListQuery,
} from "@/lib/data";

/**
 * `/usage` is live (D6). The accessor keeps its name and its payload type and
 * moves to `@/lib/data`, so the page's import specifier is unchanged (plan §1.3).
 * `usageServices` / `usageModels` stay in `./overview` as the mapper fixture
 * `tests/usage.test.ts` asserts against.
 */
export { getUsage, DEFAULT_USAGE_RANGE, USAGE_RANGES, type UsageRange } from "@/lib/data";

/**
 * `/billing/plans` is live (D7), same treatment as `/usage`: the three
 * accessors keep their names and their payload types and move to `@/lib/data`,
 * so the page's import specifier is unchanged (plan §1.3). `planCards` /
 * `planChoices` / `invoices` stay in `./plans` and `./invoices` as the fixtures
 * `tests/billing-plans.test.ts` asserts the mappers against.
 */
export { getPlans, getPlanChoices, getInvoices, DEFAULT_INVOICE_LIMIT } from "@/lib/data";

/**
 * `/billing/keys` is live (D8), same treatment as `/usage`: the accessor keeps
 * its name and its payload type and moves to `@/lib/data`, so the page's import
 * specifier is unchanged (plan §1.3). `platformKeys` / `missingKeys` stay in
 * `./keys` as the fixture `tests/platform-keys.test.ts` asserts against.
 */
export { getPlatformKeys } from "@/lib/data";

/**
 * `/access/admins` is live (D9), same treatment as `/usage` and `/billing/keys`
 * — the accessor moves to `@/lib/data` and the page's import specifier is
 * unchanged (plan §1.3). Its payload type is the one thing that did change:
 * `AdminAccessRow[]`, not `AdminRow[]`, because the board cut this page to
 * e-mail and last active. `admins` stays in `./admins` as the fixture
 * `tests/admins.test.ts` asserts against.
 */
export { getAdmins } from "@/lib/data";

/**
 * `/access/audit` is live (D10) — the accessor moves to `@/lib/data` and the
 * page's import specifier is unchanged (plan §1.3). Its payload type changed the
 * way `/workspaces`' did: `{ rows, total, page, pageSize }` around the same
 * `AuditEntry[]`, because the log is paginated at 25 and the heading counts the
 * whole set. `auditEntries` stays in `./audit` as the fixture
 * `tests/audit.test.ts` asserts the mapper's presentation rules against.
 */
export { getAuditEntries, AUDIT_PAGE_SIZE, type AuditPage } from "@/lib/data";
