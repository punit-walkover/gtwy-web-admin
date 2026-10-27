/** Every shape the UI renders. Data lives only in `src/mocks`. */

export type Plan = "PAID" | "FREE";

/**
 * A `billing_plans.plan_code`.
 *
 * The three literals are the design prototype's own codes and are kept so the
 * frozen fixtures in `src/mocks/` still type. Production carries different ones
 * — `billingPlan.validation.js` restricts the field to gtwy-node's slugs and the
 * live collection holds `"free"` and `"paid"` — so the union stays open. Nothing
 * in the UI branches on the value; it is rendered as-is.
 */
export type PlanCode = "gtwy_free" | "gtwy_paid_v2" | "gtwy_paid_v1" | (string & {});
export type TagVariant = "tag-accent" | "tag-accent-2" | "tag-neutral" | "tag-outline";

export interface Agent {
  id: string;
  name: string;
  type: "chatbot" | "api";
  service: string;
  model: string;
  version: string;
  calls: string;
  err: string;
  errN: number;
  failed: number;
  cost: string;
  status: "healthy" | "degraded";
  statusTag: TagVariant;
}

export interface ApiKey {
  name: string;
  service: string;
  masked: string;
  scope: string;
  usage: string;
  reset: string;
  created: string;
}

export interface KnowledgeBase {
  name: string;
  resources: number;
  chunks: string;
  embedding: string;
  usedBy: string;
  updated: string;
}

export interface Tool {
  name: string;
  endpoint: string;
  auth: "Bearer" | "PAuth";
  attached: string;
  calls: string;
  fail: string;
}

export interface PauthKey {
  name: string;
  masked: string;
  by: string;
  lastUsed: string;
  status: "active" | "revoked";
  statusTag: TagVariant;
}

export interface Member {
  name: string;
  role: "admin" | "editor" | "viewer";
  email: string;
  lastActive: string;
  joined: string;
}

export interface UsageBar {
  name: string;
  pct: number;
  tokens: string;
  cost: string;
}

export interface UsageModelRow {
  name: string;
  service: string;
  calls: string;
  tokens: string;
  latency: string;
  success: string;
  color: string;
  cost: string;
}

export interface DailyPoint {
  label: string;
  okH: number;
  errH: number;
}

export interface LedgerEntry {
  date: string;
  event: "debit" | "topup" | "grant";
  tag: TagVariant;
  detail: string;
  credits: string;
  color: string;
  balance: string;
}

export interface Workspace {
  id: string;
  name: string;
  owner: string;
  plan: Plan;
  planTag: TagVariant;
  planCode: PlanCode;
  planName: string;
  planCache: string;
  drift: string;
  driftColor: string;
  planChanged: string;
  agents: Agent[];
  apikeys: ApiKey[];
  kbs: KnowledgeBase[];
  tools: Tool[];
  pauth: PauthKey[];
  members: Member[];
  usageService: UsageBar[];
  usageModel: UsageBar[];
  daily: DailyPoint[];
  calls: number;
  failed: number;
  errRate: number;
  errColor: string;
  spend: number;
  wallet: number;
  walletUsd: string;
  walletSynced: string;
  failedDebits: number;
  ledger: LedgerEntry[];
  status: "active" | "blocked";
  statusTag: TagVariant;
  blocked: boolean;
  blockReason: string;
  blockedBy: string;
  blockedAt: string;
  created: string;
  lagoId: string;
}

export interface WorkspaceRow {
  id: string;
  name: string;
  owner: string;
  /**
   * `"—"` only when Lago is unreachable. Plan §7: a provider outage degrades the
   * cells that provider owns, it does not blank the page — so the two columns
   * whose sole source is an optional upstream widen by exactly the em dash the
   * design already renders for an absent value elsewhere. `agents` comes from
   * Mongo, which is primary: if it is down the page renders its error branch
   * instead.
   *
   * `null` while the plan is still loading: the "all" list is sent before Lago
   * answers and the page fills this cell from a second request.
   */
  plan: Plan | "—" | null;
  planTag: TagVariant;
  agents: number;
}

export interface WorkspaceKpi {
  label: string;
  value: string | number;
}

export interface WorkspaceTab {
  label: string;
  count: number | string;
}

export interface BlockedRow {
  id: string;
  name: string;
  reason: string;
  by: string;
  at: string;
}

export type EmbedFlag =
  | "showHomeButton"
  | "showAgentTypeOnCreateAgent"
  | "showHistory"
  | "showConfigType"
  | "showAdvancedParameters"
  | "showCreateManuallyButton"
  | "showAdvancedConfigurations"
  | "showPreTool"
  | "defaultOpen"
  | "showFullScreenButton"
  | "showCloseButton"
  | "showHeader"
  | "addDefaultApiKeys"
  | "showResponseType"
  | "showVariables"
  | "showAgentName"
  | "showGuide"
  | "showPromptHelper"
  | "showReviewAgent"
  | "showMcp";

/**
 * `FolderSchema.config.themeMode`. The design's prototype only ever rendered
 * light and dark; the folder's own Select offers a third, `system`, and real
 * folders store it — so the union carries what the column can actually show.
 */
export type ThemeMode = "light" | "dark" | "system";

export interface EndUser {
  name: string;
  sessions: number;
  calls: number;
  last: string;
}

export interface Embed {
  id: string;
  embedId: string;
  name: string;
  ws: string;
  wsId: string;
  agentsN: number;
  agents: Agent[];
  users: number;
  calls: number;
  limit: string;
  theme: ThemeMode;
  slide: string;
  redirect: string;
  flags: Record<EmbedFlag, boolean>;
  endUsers: EndUser[];
}

export interface EmbedRow {
  id: string;
  name: string;
  ws: string;
  wsId: string;
  agents: number;
  users: string;
  limit: string;
  theme: ThemeMode;
}

export interface EmbedKpi {
  label: string;
  value: string | number;
}

export interface Kpi {
  label: string;
  value: string;
  delta: string;
  deltaColor: string;
}

export interface FailingAgent {
  name: string;
  ws: string;
  wsId: string;
  model: string;
  calls: string;
  failed: string;
  rate: string;
  pct: number;
}

export interface OrgRate {
  id: string;
  name: string;
  calls: string;
  success: string;
}

export interface PlanCard {
  plan_code: PlanCode;
  display_name: string;
  price: string;
  per: string;
  features: string[];
  statusTag: TagVariant;
  statusLabel: string;
  /**
   * Active subscriptions on this plan. A `string` only ever carries the em dash:
   * org count lives in Lago and nowhere else, so an unreachable Lago degrades
   * this cell rather than blanking the card (plan §7). A plan genuinely nobody
   * is on reports `0`.
   */
  orgs: number | string;
  mrr: string;
  credit_grant: number;
  status: 0 | 1;
  updated: string;
  updated_by: string;
  servicesSummary: string;
}

export interface Invoice {
  no: string;
  org: string;
  /**
   * The org the invoice belongs to — Lago's `customer.external_id`, which is the
   * gtwy org id. Nothing renders it; it is the row-click target.
   *
   * Optional because the frozen fixture in `src/mocks/invoices.ts` predates it:
   * the prototype had no org ids, so its rows resolved the *name* against the
   * workspace list instead. Live rows carry the id and navigate directly.
   */
  orgId?: string;
  period: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
  tag: TagVariant;
}

export interface PlatformKeyRow {
  service: string;
  masked: string;
  updated: string;
  by: string;
  calls: string;
  plans: string;
}

export interface AdminRow {
  name: string;
  email: string;
  role: "Super admin" | "Support" | "Billing" | "Engineer";
  loginAs: "Allowed" | "Read-only" | "Denied";
  lastActive: string;
  status: "Active" | "Invited";
  invited: boolean;
  statusTag: TagVariant;
  laColor: string;
}

/**
 * What the Admin access page actually renders (plan §5, page 09).
 *
 * This is the one page whose columns intentionally changed, on the board's
 * explicit instruction: **e-mail and last active only**. Name, Role, Login-as
 * and Status have no source — there is no admin record anywhere, only the
 * `INTERNAL_ALLOWED_EMAILS` string — so they are removed rather than invented.
 *
 * `AdminRow` above stays exactly as it was: it is the type of the frozen design
 * fixture in `src/mocks/admins.ts`, which the mapper tests still read.
 */
export interface AdminAccessRow {
  email: string;
  /** An IST timestamp, or "never". */
  lastActive: string;
}

export interface AuditEntry {
  time: string;
  admin: string;
  action: string;
  target: string;
  ws: string;
  reason: string;
  ip: string;
  tag: TagVariant;
}

export interface PlanChoice {
  plan_code: PlanCode;
  display_name: string;
  servicesSummary: string;
}

/* -------------------------------------------------------------------------- *
 * Workspace detail — what the page actually renders (plan §5, page 03)
 *
 * `Workspace`, `Tool`, `KnowledgeBase`, `Member` and `PauthKey` above stay
 * exactly as they were: they are the types of the frozen design fixture in
 * `src/mocks/workspaces.ts`, which the mapper tests still read. The three
 * interfaces below are the live shapes, and they differ from the fixture only
 * where plan §9 removed a column that has no data source. Everything else on
 * the page — every field, every tab, every KPI — is unchanged.
 * -------------------------------------------------------------------------- */

/**
 * `Tool` minus **Endpoint**, **Auth**, **Calls · 30d** and **Fail %**.
 *
 * Gap 2: `apicalls` stores `script_id`, a viaSocket flow id, and a `url` derived
 * from it (`https://flow.sokt.io/func/<script_id>`) — neither is the tool's own
 * endpoint, and the collection holds no auth mode at all. Gap 3: no per-tool
 * metrics exist in any plane.
 */
export interface ToolRow {
  name: string;
  attached: string;
}

/**
 * `KnowledgeBase` minus **Chunks** and **Used by**.
 *
 * Gap 4: chunk counts live in Hippocampus, outside the approved scope. Gap 5:
 * D3 checked on live data — no agent configuration references a
 * `rag_collections.collection_id` (`doc_ids` is empty on all 4 988
 * `configurations` and all 9 986 `configuration_versions`), so "Used by" would
 * read zero for every collection that exists.
 */
export interface KnowledgeBaseRow {
  name: string;
  resources: number;
  embedding: string;
  updated: string;
}

/**
 * `Member`, unchanged in shape — plan §9 gap 6 is **closed**, not applied.
 *
 * The gap assumed `getProxyDetails` returns only `id, name, email, meta`. The
 * raw msg91 row it normalises carries `role: { id, name }`, `last_login_at` and
 * `created_at` as well, confirmed live, so Role / Last active / Joined all keep
 * their source and their column. `role` widens from the design's three literals
 * because msg91's vocabulary is its own ("Admin", "Editor", …).
 */
export interface MemberRow {
  name: string;
  role: string;
  email: string;
  lastActive: string;
  joined: string;
}

/**
 * The workspace the detail page renders.
 *
 * `Workspace` above minus `pauth` — gap 1 removes that tab entirely: msg91
 * cAuth keys have no collection and gtwy-node only ever validates one
 * (`validateCauthKey`), it never lists them.
 */
export interface WorkspaceDetailView {
  id: string;
  name: string;
  owner: string;
  /** `"—"` when Lago is unreachable or has no subscription (plan §7). */
  plan: Plan | "—";
  planTag: TagVariant;
  planCode: PlanCode;
  planName: string;
  /**
   * `"—"` always. The Billing card's "Redis cache" and drift readings have no
   * source: plan §2.3 leaves this console without Redis, and §5/03's billing
   * contract carries no cache field. Reported as a gap rather than invented.
   */
  planCache: string;
  drift: string;
  driftColor: string;
  planChanged: string;
  agents: Agent[];
  apikeys: ApiKey[];
  kbs: KnowledgeBaseRow[];
  tools: ToolRow[];
  members: MemberRow[];
  usageService: UsageBar[];
  usageModel: UsageBar[];
  daily: DailyPoint[];
  calls: number;
  failed: number;
  errRate: number;
  errColor: string;
  spend: number;
  wallet: number;
  walletUsd: string;
  walletSynced: string;
  failedDebits: number;
  ledger: LedgerEntry[];
  status: "active" | "blocked";
  statusTag: TagVariant;
  blocked: boolean;
  blockReason: string;
  blockedBy: string;
  blockedAt: string;
  created: string;
  lagoId: string;
  /** Membership of Mongo `internal_orgs` (plan §5 item 11). */
  internal: boolean;
}
