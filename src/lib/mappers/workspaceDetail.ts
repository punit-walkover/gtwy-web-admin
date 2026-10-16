import type {
  Agent,
  ApiKey,
  DailyPoint,
  KnowledgeBaseRow,
  LedgerEntry,
  MemberRow,
  PlanCode,
  ToolRow,
  UsageBar,
  WorkspaceDetailView,
  WorkspaceKpi,
  WorkspaceTab,
} from "@/mocks/types";
import {
  agentHealth,
  compact1,
  EM_DASH,
  errColor,
  fmt,
  istDate,
  istDateTime,
  ledgerStyle,
  NEUTRAL_700,
  oneDecimal,
  orDash,
  orgLabel,
  orgStatusTag,
  planTag,
  relative,
  thousands,
  twoDecimal,
  usd,
} from "@/lib/mappers/primitives";
import type { RawEmbedRow } from "@/lib/mappers/embeds";

/**
 * `GET /api/admin/workspaces/:orgId` and its eight tab routes → the
 * `WorkspaceDetailView` the design renders (plan §5 "03 — Workspace detail").
 *
 * Plan §1.3 splits the two halves: the routes answer in **raw** values — counts,
 * ISO-8601 dates, enum codes, `null` for an absent one — and everything below
 * turns those into the exact strings `src/mocks/types.ts` declares. `"112.8k"`,
 * `"$160.64"` and `"tag-accent"` are produced here and nowhere else, using the
 * same primitives every other page's mapper uses.
 *
 * Nine payloads arrive; one object comes out, because the design's tab strip is
 * client-side and switching a tab must not refetch.
 */

// ------------------------------------------------------- the wire contract ---
//
// Declared here rather than beside the queries because both halves need them
// and `lib/sources/workspaceDetail.ts` carries `server-only`.

export interface RawWorkspaceHeader {
  orgId: string;
  /** `null` when msg91 could not supply a name; renders `org <id>` (§4.1). */
  name: string | null;
  ownerEmail: string | null;
  /** `null` when Lago is unreachable or the org has no active subscription. */
  plan: "PAID" | "FREE" | null;
  planCode: string | null;
  planName: string | null;
  planChangedAt: string | null;
  /** 30-day `daily_data` roll-up for this org. */
  calls: number;
  failed: number;
  errorRate: number;
  /** USD — plan §4.5 Q24 treats `daily_data.cost_sum` as dollars. */
  spend: number;
  /** `null` when Lago is unreachable or the org has no wallet. */
  walletCredits: number | null;
  walletUsd: number | null;
  /** No source today — see `WorkspaceDetailView.planCache`. Always `null`. */
  walletSyncedAt: string | null;
  /** Mongo `org_billings.lago_customer_id`; `null` renders "—" (Q34). */
  lagoCustomerId: string | null;
  status: "active" | "blocked";
  blocked: boolean;
  blockReason: string | null;
  /** msg91 user id resolved to an e-mail or name; the raw id when it cannot be. */
  blockedBy: string | null;
  blockedAt: string | null;
  createdAt: string | null;
  members: number | null;
  /** Mongo `internal_orgs` membership (plan §5 item 11). */
  internal: boolean;
  /** Row counts for the tab strip, one cheap count per collection. */
  counts: {
    agents: number;
    apikeys: number;
    knowledgeBases: number;
    tools: number;
    members: number | null;
    embeds: number;
  };
  /** Which optional upstream failed on this request (plan §7). */
  degraded: { orgNames: boolean; members: boolean; lago: boolean };
}

export interface RawWorkspaceAgent {
  bridgeId: string;
  name: string;
  bridgeType: "chatbot" | "api";
  service: string;
  model: string;
  /** `published_version_id`, or `null` when the agent has never been published. */
  publishedVersionId: string | null;
  /** 1-based index of the published version within `versions`, or `null`. */
  publishedVersionNumber: number | null;
  calls: number;
  failed: number;
  errorRate: number;
  cost: number;
}

export interface RawWorkspaceApiKey {
  name: string;
  service: string;
  /** Already masked server-side. The plaintext key never leaves the server. */
  masked: string;
  /** Derived from `folder_id` / `bridge_ids`; both empty → org-wide. */
  scope: string;
  usage: number;
  limit: number;
  resetPeriod: string;
  /** `_id.getTimestamp()` — this schema declares no `timestamps` (plan §5/03). */
  createdAt: string | null;
}

export interface RawWorkspaceKnowledgeBase {
  name: string;
  resources: number;
  embedding: string | null;
  updatedAt: string | null;
}

export interface RawWorkspaceTool {
  toolId: string;
  name: string;
  /** Agent names this tool is attached to, via `configurations.function_ids`. */
  attachedTo: string[];
}

export interface RawWorkspaceMember {
  userId: string;
  name: string | null;
  email: string | null;
  /** `role.name` on the raw msg91 row — plan §9 gap 6, closed on live data. */
  role: string | null;
  lastLoginAt: string | null;
  joinedAt: string | null;
}

export interface RawWorkspaceUsage {
  byService: Array<{ name: string; tokens: number; cost: number }>;
  byModel: Array<{ name: string; tokens: number; cost: number }>;
  daily: Array<{ date: string; ok: number; err: number }>;
}

export interface RawWorkspaceBilling {
  walletCredits: number | null;
  walletUsd: number | null;
  walletSyncedAt: string | null;
  subscription: { planCode: string | null; planName: string | null; changedAt: string | null } | null;
  ledger: Array<{
    date: string | null;
    event: "debit" | "topup" | "grant";
    detail: string;
    credits: number;
    balance: number | null;
  }>;
  /** Mongo `failed_billing_debits.countDocuments({ org_id })`. */
  failedDebits: number;
  /** True when Lago could not be reached or is not configured (plan §7). */
  lagoUnavailable: boolean;
}

/**
 * The Embeds tab is the Embeds list filtered to one org, so it answers in D5's
 * own `RawEmbedRow` and is mapped by D5's own `mapEmbedRow` — plan §5/03:
 * "the D5 agent/call joins, reused not re-written".
 */
export type RawWorkspaceEmbed = RawEmbedRow;

/** The nine payloads, as one bundle — what `getWorkspace` fetches. */
export interface RawWorkspaceBundle {
  header: RawWorkspaceHeader;
  agents: RawWorkspaceAgent[];
  apikeys: RawWorkspaceApiKey[];
  knowledgeBases: RawWorkspaceKnowledgeBase[];
  tools: RawWorkspaceTool[];
  members: RawWorkspaceMember[];
  usage: RawWorkspaceUsage;
  billing: RawWorkspaceBilling;
  embeds: RawWorkspaceEmbed[];
}

// ------------------------------------------------------------------ agents ---

export function mapAgent(raw: RawWorkspaceAgent): Agent {
  return {
    id: raw.bridgeId,
    name: raw.name,
    type: raw.bridgeType,
    service: raw.service,
    model: raw.model,
    version: versionLabel(raw),
    // `daily_data.record_count` is `double precision` holding whole calls.
    calls: thousands(raw.calls),
    err: oneDecimal(raw.errorRate),
    errN: raw.errorRate,
    failed: raw.failed,
    cost: twoDecimal(raw.cost),
    ...agentHealth(raw.errorRate),
  };
}

/**
 * `"v5 · published"` — the design's own Version cell.
 *
 * An agent with no `published_version_id` has never been published, and the
 * design has no second form for that, so it reads as an em dash rather than as
 * a version number the agent does not have.
 */
function versionLabel(raw: RawWorkspaceAgent): string {
  if (raw.publishedVersionNumber === null) return EM_DASH;
  return `v${raw.publishedVersionNumber} · published`;
}

// ---------------------------------------------------------------- api keys ---

export function mapApiKey(raw: RawWorkspaceApiKey): ApiKey {
  return {
    name: raw.name,
    service: raw.service,
    masked: raw.masked,
    scope: raw.scope,
    // The design's own cell, read off the fixture: `"$107 / ∞"` and
    // `"$668 / $2351"`. `apikey_usage` and `apikey_limit` are **spend**, not
    // call counts — `apikey.validation.js` types both as a 6-decimal number and
    // `apikey.controller.js` reads the counter as money — so the column carries
    // a currency symbol and whole dollars, and a stored limit of 0 is
    // gtwy-node's own "no cap", which the design draws as ∞.
    usage: `$${Math.round(raw.usage)} / ${raw.limit > 0 ? `$${Math.round(raw.limit)}` : "∞"}`,
    reset: raw.resetPeriod,
    created: raw.createdAt ? istDate(raw.createdAt) : EM_DASH,
  };
}

// -------------------------------------------------------- knowledge bases ----

export function mapKnowledgeBase(raw: RawWorkspaceKnowledgeBase): KnowledgeBaseRow {
  return {
    name: raw.name,
    resources: raw.resources,
    embedding: orDash(raw.embedding),
    // The design's Updated cell is relative — `"18d ago"` in the fixture — not
    // a date. A collection with no `updated_at` reads as an em dash rather than
    // as `relative`'s "never", which belongs to last-active columns.
    updated: raw.updatedAt ? relative(raw.updatedAt) : EM_DASH,
  };
}

// ------------------------------------------------------------------- tools ---

export function mapTool(raw: RawWorkspaceTool): ToolRow {
  const n = raw.attachedTo.length;
  return {
    name: raw.name,
    // The design's own form is a count, not a list: `"3 agents"` in the
    // fixture. An unattached tool reads as an em dash, the way every other
    // absent value on this page does.
    attached: n === 0 ? EM_DASH : n === 1 ? "1 agent" : `${n} agents`,
  };
}

// ----------------------------------------------------------------- members ---

export function mapMember(raw: RawWorkspaceMember): MemberRow {
  return {
    name: raw.name ?? `user ${raw.userId}`,
    role: orDash(raw.role),
    email: orDash(raw.email),
    lastActive: raw.lastLoginAt ? relative(raw.lastLoginAt) : "never",
    joined: raw.joinedAt ? istDate(raw.joinedAt) : EM_DASH,
  };
}

// ------------------------------------------------------------------- usage ---

/**
 * The design's bar rows are percentages of the largest row, not of the total —
 * the widest bar in each list is full width. A list whose rows are all zero
 * renders every bar at zero rather than dividing by it.
 */
function usageBars(rows: Array<{ name: string; tokens: number; cost: number }>): UsageBar[] {
  const peak = rows.reduce((m, r) => Math.max(m, r.tokens), 0);
  return rows.map((r) => ({
    name: r.name,
    pct: peak > 0 ? Math.round((r.tokens / peak) * 100) : 0,
    tokens: compact1(Math.round(r.tokens)),
    // `UsageRow` renders the `$` itself, so the value carries none — the
    // fixture's `"38.15"`, not `"$38.15"`.
    cost: twoDecimal(r.cost),
  }));
}

/**
 * The 30-day success/fail column chart.
 *
 * Both segment heights are percentages of the busiest day, so the tallest
 * column fills the 120px band and every other one is read against it — which
 * is what the stacked `errH` / `okH` pair in the design does.
 */
function dailyPoints(rows: Array<{ date: string; ok: number; err: number }>): DailyPoint[] {
  const peak = rows.reduce((m, r) => Math.max(m, r.ok + r.err), 0);
  return rows.map((r) => ({
    // `label` is the column's `title`, so it is the tooltip an operator reads.
    // The fixture's `"Day 1"` was all a prototype could say; the real date and
    // the day's own volume are what that tooltip is for. The element and its
    // attributes are unchanged — only the value is real now.
    label: `${istDate(r.date)} · ${thousands(r.ok + r.err)} calls`,
    okH: peak > 0 ? (r.ok / peak) * 100 : 0,
    errH: peak > 0 ? (r.err / peak) * 100 : 0,
  }));
}

// ----------------------------------------------------------------- billing ---

export function mapLedger(raw: RawWorkspaceBilling["ledger"]): LedgerEntry[] {
  return raw.map((l) => ({
    date: l.date ? istDateTime(l.date) : EM_DASH,
    event: l.event,
    detail: l.detail,
    // The design signs the column itself: a debit reads "-1,204".
    credits: `${l.credits < 0 ? "-" : l.event === "debit" ? "-" : "+"}${thousands(Math.abs(l.credits))}`,
    balance: l.balance === null ? EM_DASH : thousands(l.balance),
    ...ledgerStyle(l.event),
  }));
}

// -------------------------------------------------------------- the bundle ---

/** The five KPIs of the header strip, in the design's order. */
export function mapKpis(h: RawWorkspaceHeader): WorkspaceKpi[] {
  return [
    { label: "Calls · 30d", value: fmt(Math.round(h.calls)) },
    { label: "Error rate", value: `${oneDecimal(h.errorRate)}%` },
    { label: "Spend · 30d", value: usd(h.spend) },
    { label: "Wallet", value: h.walletCredits === null ? EM_DASH : `${thousands(h.walletCredits)} cr` },
    { label: "Members", value: h.members ?? EM_DASH },
  ];
}

/**
 * The tab strip.
 *
 * **PAuth keys is gone** — plan §9 gap 1, the one tab removed outright. Usage
 * and Billing carry no count in the design and still do not.
 */
export function mapTabs(h: RawWorkspaceHeader): WorkspaceTab[] {
  return [
    { label: "Agents", count: h.counts.agents },
    { label: "API keys", count: h.counts.apikeys },
    { label: "Knowledge bases", count: h.counts.knowledgeBases },
    { label: "Tools", count: h.counts.tools },
    { label: "Members", count: h.counts.members ?? EM_DASH },
    { label: "Usage", count: "" },
    { label: "Billing", count: "" },
    { label: "Embeds", count: h.counts.embeds },
  ];
}

export function mapWorkspaceDetail(raw: RawWorkspaceBundle): WorkspaceDetailView {
  const h = raw.header;
  const plan = h.plan ?? EM_DASH;

  return {
    id: h.orgId,
    name: orgLabel(h.orgId, h.name),
    owner: orDash(h.ownerEmail),
    plan,
    planTag: planTag(plan),
    planCode: (h.planCode ?? EM_DASH) as PlanCode,
    planName: orDash(h.planName),
    // No Redis (plan §2.3), so there is no cached plan to compare against and
    // no drift to report. Both read as the em dash the design already uses for
    // an absent value, rather than as an invented "in sync".
    planCache: EM_DASH,
    drift: EM_DASH,
    driftColor: NEUTRAL_700,
    planChanged: h.planChangedAt ? istDate(h.planChangedAt) : EM_DASH,

    agents: raw.agents.map(mapAgent),
    apikeys: raw.apikeys.map(mapApiKey),
    kbs: raw.knowledgeBases.map(mapKnowledgeBase),
    tools: raw.tools.map(mapTool),
    members: raw.members.map(mapMember),

    usageService: usageBars(raw.usage.byService),
    usageModel: usageBars(raw.usage.byModel),
    daily: dailyPoints(raw.usage.daily),

    calls: Math.round(h.calls),
    failed: Math.round(h.failed),
    errRate: h.errorRate,
    errColor: errColor(h.errorRate),
    spend: h.spend,

    wallet: Math.round(raw.billing.walletCredits ?? 0),
    walletUsd: raw.billing.walletUsd === null ? EM_DASH : twoDecimal(raw.billing.walletUsd),
    walletSynced: raw.billing.walletSyncedAt ? relative(raw.billing.walletSyncedAt) : EM_DASH,
    failedDebits: raw.billing.failedDebits,
    ledger: mapLedger(raw.billing.ledger),

    status: h.status,
    statusTag: orgStatusTag(h.status),
    blocked: h.blocked,
    blockReason: orDash(h.blockReason),
    blockedBy: orDash(h.blockedBy),
    blockedAt: h.blockedAt ? istDateTime(h.blockedAt) : EM_DASH,
    created: h.createdAt ? istDate(h.createdAt) : EM_DASH,
    lagoId: orDash(h.lagoCustomerId),
    internal: h.internal,
  };
}

/** The Embeds tab renders the design's `EmbedRow`, so D5's mapper is the mapper. */
export { mapEmbedRow as mapWorkspaceEmbedRow } from "@/lib/mappers/embeds";
