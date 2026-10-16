import "server-only";

import { ObjectId, type Filter } from "mongodb";

import { ApiError } from "@/lib/api/envelope";
import { adminLabelForUserId } from "@/lib/api/orgName";
import { cached } from "@/lib/clients/cache";
import { maskStoredKey } from "@/lib/crypto/platformKey";
import {
  creditsToUsd,
  getSubscription,
  getWallet,
  lagoConfigured,
  listWalletTransactions,
  planSlugForCode,
} from "@/lib/clients/lago";
import { getAllOrgs, getProxyDetails, listOrgUsers, type Msg91Org } from "@/lib/clients/msg91";
import { collection, MONGO_MAX_TIME_MS } from "@/lib/db/mongo";
import { query } from "@/lib/db/sql";
import { MSG91_CACHE_TTL_MS } from "@/lib/env";
import { isOrgInternal } from "@/lib/queries/internalOrgs";
import { listEmbedsForOrg } from "@/lib/sources/embeds";
import type { BlockedOrgDoc } from "@/lib/queries/blockedOrgs";
import type {
  RawWorkspaceAgent,
  RawWorkspaceApiKey,
  RawWorkspaceBilling,
  RawWorkspaceEmbed,
  RawWorkspaceHeader,
  RawWorkspaceKnowledgeBase,
  RawWorkspaceMember,
  RawWorkspaceTool,
  RawWorkspaceUsage,
} from "@/lib/mappers/workspaceDetail";

/**
 * Plan §5 "03 — Workspace detail". Every read below traces to a gtwy-node file:
 *
 *   `configurations`          — mongoModel/Configuration.model.js
 *   `apikeycredentials`       — mongoModel/Api.model.js:77 (derived name)
 *   `apicalls`                — mongoModel/ApiCall.model.js:65 (derived name)
 *   `configuration_versions`  — mongoModel/BridgeVersion.model.js (derived name)
 *   `rag_collections`         — mongoModel/RagCollection.model.js:61
 *   `org_billings`            — mongoModel/OrgBilling.model.js:81
 *   `failed_billing_debits`   — mongoModel/FailedBillingDebit.model.js:15
 *   `blocked_orgs`            — mongoModel/BlockedOrg.model.js:11
 *   `internal_orgs`           — mongoModel/InternalOrg.model.js:16
 *   `folders`                 — mongoModel/GtwyEmbed.model.js:95 (derived name)
 *   attached-to join          — db_services/apiCall.service.js#getAgentsAndVersionsByFunctionIds
 *   members                   — services/proxy.service.js#getProxyDetails (plan §4.2)
 *   wallet / subscription     — services/lago.service.js
 *   masking                   — services/utils/helper.utils.js:5-34, via lib/crypto/platformKey
 *
 * All nine derived and declared names were confirmed against a live
 * `db.listCollections()` before a single query was written, as plan §5/03
 * requires.
 *
 * Read-only throughout: no write, no index, no schema change (plan §1.2, §12).
 * Everything returned is **raw**; `lib/mappers/workspaceDetail.ts` turns it into
 * the strings the design renders.
 *
 * **No per-row joins** (plan §5/03, revision 4 item 3). Every `daily_data` read
 * here is one grouped query for the whole set, and every value in it is a bind
 * parameter — gtwy-node's `metrics.utils.js#buildWhereClause` interpolates and
 * we deliberately do not (plan §4.3).
 */

const WINDOW_DAYS = 30;

// ------------------------------------------------------------------ shapes ---

interface ConfigurationDoc {
  _id: ObjectId;
  name?: string;
  org_id?: string;
  service?: string;
  bridgeType?: "chatbot" | "api";
  configuration?: { model?: string } | null;
  published_version_id?: string | null;
  versions?: Array<string | ObjectId> | null;
  function_ids?: Array<string | ObjectId> | null;
  deletedAt?: Date | null;
}

interface ApikeyCredentialDoc {
  _id: ObjectId;
  org_id?: string;
  name?: string;
  service?: string;
  apikey?: string;
  folder_id?: string | null;
  bridge_ids?: string[] | null;
  apikey_limit?: number;
  apikey_usage?: number;
  /** The window `apikey_usage` belongs to — `"2026-09"` / `"2026-W35"` / a date. */
  apikey_usage_period?: string | null;
  apikey_limit_reset_period?: string;
}

interface RagCollectionDoc {
  _id: ObjectId;
  org_id?: string;
  name?: string;
  resource_ids?: unknown[] | null;
  settings?: { denseModel?: string } | null;
  updated_at?: Date | null;
}

interface ApiCallDoc {
  _id: ObjectId;
  org_id?: string;
  title?: string;
}

interface VersionDoc {
  _id: ObjectId;
  org_id?: string;
  parent_id?: string | ObjectId | null;
  function_ids?: Array<string | ObjectId> | null;
}

interface OrgBillingDoc {
  org_id?: string;
  lago_customer_id?: string | null;
  last_plan_change_at?: Date | string | null;
  created_at?: Date | string | null;
}

/** gtwy-node filters deleted agents in JS (`!a.deletedAt`); we do it in the query. */
const NOT_DELETED = { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] };

// ------------------------------------------------------------- primitives ----

function iso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function errorRate(calls: number, success: number): number {
  if (calls <= 0) return 0;
  return ((calls - success) / calls) * 100;
}

// ------------------------------------------------------------- timescale ----

interface OrgTotals {
  calls: number;
  success: number;
  cost: number;
}

const ZERO: OrgTotals = { calls: 0, success: 0, cost: 0 };

/** The org's own 30-day roll-up — the five KPIs and the header's error rate. */
async function orgTotals(orgId: string, days = WINDOW_DAYS): Promise<OrgTotals> {
  const rows = await query<{ calls: string; success: string; cost: string }>(
    "timescale",
    `SELECT COALESCE(SUM(record_count), 0)  AS calls,
            COALESCE(SUM(success_count), 0) AS success,
            COALESCE(SUM(cost_sum), 0)      AS cost
       FROM daily_data
      WHERE org_id = $1
        AND created_at >= NOW() - ($2 || ' days')::interval`,
    [String(orgId), String(days)],
  );
  const row = rows[0];
  if (!row) return ZERO;
  return { calls: num(row.calls), success: num(row.success), cost: num(row.cost) };
}

interface BridgeTotals extends OrgTotals {
  bridge_id: string;
}

/**
 * Per-agent totals for the whole org in **one** grouped query.
 *
 * Grouped by `org_id` rather than by a `bridge_id = ANY(...)` list because the
 * agent set is exactly this org's: `daily_data` carries `org_id` in its own
 * column, so the join needs no id list at all and cannot grow with the agent
 * count. Plan §5/03 revision 4 item 3 forbids the per-row shape; this is one
 * query whatever the org's size.
 */
async function agentTotals(orgId: string, days = WINDOW_DAYS): Promise<Map<string, OrgTotals>> {
  const rows = await query<BridgeTotals & Record<string, unknown>>(
    "timescale",
    `SELECT bridge_id,
            COALESCE(SUM(record_count), 0)  AS calls,
            COALESCE(SUM(success_count), 0) AS success,
            COALESCE(SUM(cost_sum), 0)      AS cost
       FROM daily_data
      WHERE org_id = $1
        AND bridge_id IS NOT NULL
        AND created_at >= NOW() - ($2 || ' days')::interval
      GROUP BY bridge_id`,
    [String(orgId), String(days)],
  );
  return new Map(
    rows.map((r) => [String(r.bridge_id), { calls: num(r.calls), success: num(r.success), cost: num(r.cost) }]),
  );
}

// ------------------------------------------------------------------ mongo ----

async function configurations() {
  return collection<ConfigurationDoc>("configurations");
}

/**
 * The org universe check behind the header's 404.
 *
 * "Unknown" is the same union D2's list is built from (plan §4.1): msg91's
 * company list, plus the org ids Mongo and Timescale carry that msg91 has no
 * company for. An org that answers on any one of them is a real workspace and
 * gets its page; an org that answers on none of them is `404 not_found`.
 */
async function orgDirectory(): Promise<Map<string, Msg91Org> | null> {
  try {
    const orgs = await getAllOrgs();
    return new Map(orgs.map((o) => [o.id, o]));
  } catch (err) {
    console.error("[admin-api] msg91 org list unavailable; workspace header degrades", err);
    return null;
  }
}

/** Every org id that owns at least one agent — cached with D2's own entry. */
async function orgIdsWithAgents(): Promise<Set<string>> {
  const ids = await cached("workspaces:config-org-ids", MSG91_CACHE_TTL_MS, async () => {
    const col = await configurations();
    const distinct = await col.distinct("org_id", {});
    return distinct.filter((id): id is string => typeof id === "string" && id !== "");
  });
  return new Set(ids);
}

// ------------------------------------------------------------------ header ---

export async function getWorkspaceHeader(orgId: string): Promise<RawWorkspaceHeader> {
  const id = String(orgId);

  const [directory, totals, blockedDoc, internal, billingDoc] = await Promise.all([
    orgDirectory(),
    orgTotals(id),
    findBlocked(id),
    isOrgInternal(id),
    findOrgBilling(id),
  ]);

  const org = directory?.get(id);

  // An org msg91 does not list is still real if Mongo or Timescale carry it, or
  // if it is blocked — the same union D2's universe is built from.
  if (!org) {
    const known =
      totals.calls > 0 ||
      blockedDoc !== null ||
      internal ||
      billingDoc !== null ||
      (await orgIdsWithAgents()).has(id);
    if (!known) throw new ApiError("not_found", "Workspace not found.");
  }

  const [counts, people, lago, blockedBy] = await Promise.all([
    tabCounts(id),
    orgPeople(id, org),
    lagoHeader(id),
    adminLabelForUserId(blockedDoc?.blocked_by ?? null),
  ]);

  const blocked = blockedDoc !== null;

  return {
    orgId: id,
    name: org?.name ?? null,
    ownerEmail: people.ownerEmail,
    plan: lago.plan,
    planCode: lago.planCode,
    planName: lago.planName,
    // Lago's subscription carries no "changed at"; `org_billings` records the
    // last plan change in its own column, written by gtwy-node's billing flow.
    planChangedAt: iso(billingDoc?.last_plan_change_at ?? null),
    calls: totals.calls,
    failed: Math.max(0, totals.calls - totals.success),
    errorRate: errorRate(totals.calls, totals.success),
    spend: totals.cost,
    walletCredits: lago.walletCredits,
    walletUsd: lago.walletUsd,
    // No source: there is no Redis shadow balance in this console (plan §2.3)
    // and Lago reports no sync time. Reported as a gap, not invented.
    walletSyncedAt: null,
    lagoCustomerId: billingDoc?.lago_customer_id ?? null,
    status: blocked ? "blocked" : "active",
    blocked,
    blockReason: blockedDoc?.reason ?? null,
    blockedBy,
    blockedAt: iso(blockedDoc?.createdAt ?? null),
    createdAt: org?.createdAt ?? iso(billingDoc?.created_at ?? null),
    members: people.members,
    internal,
    counts: { ...counts, members: people.members },
    degraded: { orgNames: directory === null, members: people.failed, lago: lago.unavailable },
  };
}

async function findBlocked(orgId: string): Promise<BlockedOrgDoc | null> {
  const col = await collection<BlockedOrgDoc>("blocked_orgs");
  return col.findOne(
    { org_id: orgId },
    {
      projection: { _id: 0, org_id: 1, reason: 1, blocked_by: 1, createdAt: 1 },
      maxTimeMS: MONGO_MAX_TIME_MS,
    },
  );
}

async function findOrgBilling(orgId: string): Promise<OrgBillingDoc | null> {
  const col = await collection<OrgBillingDoc>("org_billings");
  return col.findOne(
    { org_id: orgId },
    {
      projection: { _id: 0, org_id: 1, lago_customer_id: 1, last_plan_change_at: 1, created_at: 1 },
      maxTimeMS: MONGO_MAX_TIME_MS,
    },
  );
}

/** Row counts for the tab strip — one cheap count per collection, in parallel. */
async function tabCounts(orgId: string) {
  const [agents, apikeys, knowledgeBases, tools, embeds] = await Promise.all([
    (await configurations()).countDocuments(
      { org_id: orgId, ...NOT_DELETED } as Filter<ConfigurationDoc>,
      { maxTimeMS: MONGO_MAX_TIME_MS },
    ),
    (await collection("apikeycredentials")).countDocuments({ org_id: orgId }, { maxTimeMS: MONGO_MAX_TIME_MS }),
    (await collection("rag_collections")).countDocuments({ org_id: orgId }, { maxTimeMS: MONGO_MAX_TIME_MS }),
    (await collection("apicalls")).countDocuments({ org_id: orgId }, { maxTimeMS: MONGO_MAX_TIME_MS }),
    (await collection("folders")).countDocuments(
      { org_id: orgId, type: "embed" },
      { maxTimeMS: MONGO_MAX_TIME_MS },
    ),
  ]);
  return { agents, apikeys, knowledgeBases, tools, embeds };
}

interface OrgPeople {
  members: number | null;
  ownerEmail: string | null;
  failed: boolean;
}

/**
 * Member count and owner e-mail — `getProxyDetails`, plan §4.2, exactly as the
 * Workspaces list resolves them. Orgs msg91 has no company for are never asked
 * about: verified live, ids like `11202` answer `422`, which is a fact about
 * the org and not an outage.
 */
async function orgPeople(orgId: string, org: Msg91Org | undefined): Promise<OrgPeople> {
  if (!org) return { members: null, ownerEmail: null, failed: false };
  try {
    return await cached(`workspaces:people:${orgId}`, MSG91_CACHE_TTL_MS, async () => {
      const { rows, total } = await getProxyDetails({ company_id: orgId, pageNo: 1, itemsPerPage: 100 });
      const creator = org.createdBy ? rows.find((u) => u.id === org.createdBy) : undefined;
      return {
        members: total || rows.length,
        ownerEmail: creator?.email ?? org.email ?? rows[0]?.email ?? null,
        failed: false,
      };
    });
  } catch (err) {
    console.error(`[admin-api] msg91 member lookup failed for org ${orgId}`, err);
    return { members: null, ownerEmail: org.email ?? null, failed: true };
  }
}

interface LagoHeader {
  plan: "PAID" | "FREE" | null;
  planCode: string | null;
  planName: string | null;
  walletCredits: number | null;
  walletUsd: number | null;
  unavailable: boolean;
}

const LAGO_DOWN: LagoHeader = {
  plan: null,
  planCode: null,
  planName: null,
  walletCredits: null,
  walletUsd: null,
  unavailable: true,
};

/**
 * The Lago half of the header (plan §7): unreachable, unconfigured, or simply
 * having no customer for this org all degrade to `null`, which the mapper
 * renders as an em dash. **The page still renders.** It never throws.
 */
async function lagoHeader(orgId: string): Promise<LagoHeader> {
  if (!lagoConfigured()) return LAGO_DOWN;
  try {
    const [wallet, subscription] = await Promise.all([getWallet(orgId), getSubscription(orgId)]);
    const slug = planSlugForCode(subscription?.plan_code);
    return {
      // gtwy-node's `getOrgPlanSlug`: no active subscription, or a plan_code we
      // did not create, is DEFAULT_PLAN_SLUG — "free".
      plan: subscription === null ? "FREE" : slug === "paid" ? "PAID" : "FREE",
      planCode: subscription?.plan_code ?? null,
      planName: planNameFor(slug, subscription?.plan_code ?? null),
      walletCredits: wallet === null ? null : wallet.credits_balance,
      walletUsd: wallet === null ? null : creditsToUsd(wallet.credits_balance),
      unavailable: false,
    };
  } catch (err) {
    console.error(`[admin-api] Lago unavailable for org ${orgId}; billing cells degrade to null`, err);
    return LAGO_DOWN;
  }
}

/** Lago exposes no display name on a subscription, so the slug is the name. */
function planNameFor(slug: "free" | "paid" | null, planCode: string | null): string | null {
  if (slug === "paid") return "Paid";
  if (slug === "free") return "Free";
  return planCode;
}

// ------------------------------------------------------------------ agents ---

export async function listWorkspaceAgents(orgId: string): Promise<RawWorkspaceAgent[]> {
  const col = await configurations();
  const docs = await col
    .find({ org_id: String(orgId), ...NOT_DELETED } as Filter<ConfigurationDoc>, {
      projection: {
        _id: 1,
        name: 1,
        bridgeType: 1,
        service: 1,
        "configuration.model": 1,
        published_version_id: 1,
        versions: 1,
      },
      maxTimeMS: MONGO_MAX_TIME_MS,
    })
    .toArray();

  // One grouped `daily_data` read for the whole set, never one per row.
  const totals = await agentTotals(String(orgId));

  return docs
    .map((doc) => {
      const bridgeId = doc._id.toString();
      const t = totals.get(bridgeId) ?? ZERO;
      const versions = (Array.isArray(doc.versions) ? doc.versions : []).filter(Boolean).map(String);
      const published = doc.published_version_id ? String(doc.published_version_id) : null;
      const publishedIndex = published ? versions.indexOf(published) : -1;

      return {
        bridgeId,
        name: doc.name || "Untitled",
        bridgeType: doc.bridgeType === "api" ? ("api" as const) : ("chatbot" as const),
        service: doc.service || "",
        model: doc.configuration?.model || "",
        publishedVersionId: published,
        publishedVersionNumber: publishedIndex >= 0 ? publishedIndex + 1 : null,
        calls: t.calls,
        failed: Math.max(0, Math.round(t.calls - t.success)),
        errorRate: errorRate(t.calls, t.success),
        cost: t.cost,
      };
    })
    .sort((a, b) => b.calls - a.calls || a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------- api keys ---

/**
 * The *Scope* label (plan §14.4 decision 2).
 *
 * `apikeycredentials` stores no scope. It stores `folder_id` and `bridge_ids`,
 * and gtwy-node's own resolution order is folder first, then explicit bridges,
 * then nothing — which is every agent in the org. The design's own vocabulary
 * for that is `"all agents"` and `"2 agents"`, read off the fixture.
 *
 * Measured on live data the label does vary — 93 of 864 keys carry a folder,
 * and org 59402 shows both `all agents` and `folder 69844b…` — so the column
 * carries information and stays rather than being logged as a gap.
 */
function scopeLabel(doc: ApikeyCredentialDoc): string {
  const folderId = typeof doc.folder_id === "string" ? doc.folder_id.trim() : "";
  if (folderId !== "") return `folder ${folderId}`;
  const bridges = Array.isArray(doc.bridge_ids) ? doc.bridge_ids.filter(Boolean) : [];
  if (bridges.length === 1) return "1 agent";
  if (bridges.length > 1) return `${bridges.length} agents`;
  return "all agents";
}

/**
 * gtwy-node's period strings, `services/utils/periodKey.utils.js`, reproduced
 * exactly — every value read in **UTC**, which is what defines "the 1st" and
 * "Monday" there and here.
 */
function periodKey(resetPeriod: string, now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const period = ["daily", "weekly", "monthly"].includes(String(resetPeriod).toLowerCase().trim())
    ? String(resetPeriod).toLowerCase().trim()
    : "monthly";

  if (period === "daily") {
    return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
  }
  if (period === "weekly") {
    // ISO weeks belong to the year containing their Thursday.
    const thursday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    thursday.setUTCDate(thursday.getUTCDate() - ((thursday.getUTCDay() + 6) % 7) + 3);
    const isoYear = thursday.getUTCFullYear();
    const firstThursday = new Date(Date.UTC(isoYear, 0, 4));
    firstThursday.setUTCDate(firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7) + 3);
    const week = 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
    return `${isoYear}-W${pad(week)}`;
  }
  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}`;
}

export async function listWorkspaceApiKeys(orgId: string): Promise<RawWorkspaceApiKey[]> {
  const col = await collection<ApikeyCredentialDoc>("apikeycredentials");
  const docs = await col
    .find({ org_id: String(orgId) }, { maxTimeMS: MONGO_MAX_TIME_MS })
    .toArray();

  const now = new Date();

  return docs
    .map((doc) => {
      const resetPeriod = doc.apikey_limit_reset_period || "monthly";
      return {
        name: doc.name || "",
        service: doc.service || "",
        // `maskStoredKey` decrypts with gtwy-node's own `Secret_IV` /
        // `Encreaption_key` and masks with `Helper.maskApiKey`. It never throws
        // and never returns plaintext: an absent secret or a failed decrypt
        // degrades to a fixed placeholder and logs once.
        masked: maskStoredKey(doc.apikey),
        scope: scopeLabel(doc),
        // `apikey.controller.js#listApikeys` reads the live counter out of
        // Redis and falls back to the document copy **only when it belongs to
        // the window being shown**: a value left over from a finished window is
        // zero, not current spend. We have no Redis (plan §2.3), so the
        // fallback is the whole rule here — and applying it is the difference
        // between reporting this month's spend and reporting a stale month's.
        usage: doc.apikey_usage_period === periodKey(resetPeriod, now) ? num(doc.apikey_usage) : 0,
        limit: num(doc.apikey_limit),
        resetPeriod,
        // This schema declares no `timestamps` — there is no `created_at` and
        // no `createdAt`. The ObjectId's own timestamp is exact and is the only
        // source there is (plan §5/03).
        createdAt: doc._id.getTimestamp().toISOString(),
      };
    })
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

// -------------------------------------------------------- knowledge bases ----

export async function listWorkspaceKnowledgeBases(orgId: string): Promise<RawWorkspaceKnowledgeBase[]> {
  const col = await collection<RagCollectionDoc>("rag_collections");
  const docs = await col
    .find(
      { org_id: String(orgId) },
      {
        projection: { _id: 1, name: 1, resource_ids: 1, "settings.denseModel": 1, updated_at: 1 },
        maxTimeMS: MONGO_MAX_TIME_MS,
      },
    )
    .toArray();

  return docs
    .map((doc) => ({
      name: doc.name || "",
      resources: Array.isArray(doc.resource_ids) ? doc.resource_ids.length : 0,
      embedding: doc.settings?.denseModel ?? null,
      updatedAt: iso(doc.updated_at),
    }))
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "") || a.name.localeCompare(b.name));
}

// ------------------------------------------------------------------- tools ---

/**
 * Tool → the agents it is attached to.
 *
 * `apiCall.service.js#getAgentsAndVersionsByFunctionIds` is the join: read
 * `function_ids` off this org's `configurations`, then off its
 * `configuration_versions`, folding a version back onto its `parent_id`. Both
 * halves are one query, not one per tool.
 *
 * **On live data both halves come back empty** — `function_ids` is a present
 * but empty array on every one of the 4 647 configurations that declare it, and
 * on every one of the 9 986 versions. The join is built exactly as gtwy-node
 * specifies it and simply has nothing to report yet; the column reads as an em
 * dash. Reported as a finding rather than replaced by a field with no
 * gtwy-node trace.
 */
async function attachedAgentNames(orgId: string): Promise<Map<string, string[]>> {
  const [cfgCol, verCol] = await Promise.all([
    configurations(),
    collection<VersionDoc>("configuration_versions"),
  ]);

  const [configs, versions] = await Promise.all([
    cfgCol
      .find(
        { org_id: String(orgId), function_ids: { $exists: true, $ne: [] } } as Filter<ConfigurationDoc>,
        { projection: { _id: 1, name: 1, function_ids: 1 }, maxTimeMS: MONGO_MAX_TIME_MS },
      )
      .toArray(),
    verCol
      .find(
        { org_id: String(orgId), function_ids: { $exists: true, $ne: [] } } as Filter<VersionDoc>,
        { projection: { _id: 1, parent_id: 1, function_ids: 1 }, maxTimeMS: MONGO_MAX_TIME_MS },
      )
      .toArray(),
  ]);

  // Parent names for the versions that reference a tool, in one read.
  const parentIds = [...new Set(versions.map((v) => String(v.parent_id ?? "")).filter(Boolean))];
  const parentObjectIds = parentIds.filter((p) => ObjectId.isValid(p)).map((p) => new ObjectId(p));
  const parents = parentObjectIds.length
    ? await cfgCol
        .find({ _id: { $in: parentObjectIds } } as Filter<ConfigurationDoc>, {
          projection: { _id: 1, name: 1 },
          maxTimeMS: MONGO_MAX_TIME_MS,
        })
        .toArray()
    : [];
  const nameOfParent = new Map(parents.map((p) => [p._id.toString(), p.name || "Untitled"]));
  for (const c of configs) nameOfParent.set(c._id.toString(), c.name || "Untitled");

  const byTool = new Map<string, Set<string>>();
  const attach = (toolId: string, agentName: string) => {
    const set = byTool.get(toolId) ?? new Set<string>();
    set.add(agentName);
    byTool.set(toolId, set);
  };

  for (const config of configs) {
    for (const fid of config.function_ids ?? []) {
      if (fid) attach(String(fid), config.name || "Untitled");
    }
  }
  for (const version of versions) {
    const parent = version.parent_id ? String(version.parent_id) : null;
    if (!parent) continue;
    for (const fid of version.function_ids ?? []) {
      if (fid) attach(String(fid), nameOfParent.get(parent) ?? `agent ${parent}`);
    }
  }

  return new Map([...byTool].map(([toolId, names]) => [toolId, [...names].sort()]));
}

export async function listWorkspaceTools(orgId: string): Promise<RawWorkspaceTool[]> {
  const col = await collection<ApiCallDoc>("apicalls");
  const [docs, attached] = await Promise.all([
    col
      .find({ org_id: String(orgId) }, { projection: { _id: 1, title: 1 }, maxTimeMS: MONGO_MAX_TIME_MS })
      .toArray(),
    attachedAgentNames(String(orgId)),
  ]);

  return docs
    .map((doc) => {
      const toolId = doc._id.toString();
      return { toolId, name: doc.title || "", attachedTo: attached.get(toolId) ?? [] };
    })
    .sort((a, b) => b.attachedTo.length - a.attachedTo.length || a.name.localeCompare(b.name));
}

// ----------------------------------------------------------------- members ---

/**
 * Plan §4.2 — `getProxyDetails`, paginated the way
 * `analytics.controller.js#loadOrgUserMap` does it (100 a page, stop on
 * `totalEntityCount`).
 *
 * **Plan §9 gap 6 is closed, not applied.** The gap assumed the payload carries
 * only `id, name, email, meta`. Confirmed live against
 * `GET /api/{PUBLIC_REFERENCEID}/getDetails`, the raw row also carries
 * `role: { id, name }`, `last_login_at` and `created_at` — so Role, Last active
 * and Joined all keep their source and their column.
 *
 * Only the four fields the design renders leave the server. `mobile`,
 * `profile_picture_url`, `client_id` and the rest of the msg91 row do not.
 */
export async function listWorkspaceMembers(orgId: string): Promise<RawWorkspaceMember[]> {
  let users;
  try {
    users = await listOrgUsers(String(orgId));
  } catch (err) {
    // An org msg91 has no company for answers 422. That is a fact about the
    // org, not an outage, and an empty tab must not blank the page (plan §5/03:
    // tab routes return an empty array rather than 404).
    console.error(`[admin-api] msg91 member list unavailable for org ${orgId}`, err);
    return [];
  }

  return users
    .map((u) => ({
      userId: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      lastLoginAt: u.lastLoginAt,
      joinedAt: u.createdAt,
    }))
    .sort((a, b) => (b.lastLoginAt ?? "").localeCompare(a.lastLoginAt ?? "") || (a.name ?? "").localeCompare(b.name ?? ""));
}

// ------------------------------------------------------------------- usage ---

export type UsageRange = "7d" | "30d" | "90d";

export const USAGE_RANGE_DAYS: Record<UsageRange, number> = { "7d": 7, "30d": 30, "90d": 90 };

/**
 * Three grouped reads — by `service`, by `model`, and by day.
 *
 * The daily series is fixed at 30 days whatever the range toggle says: the
 * design labels that section "Daily calls · 30d" and the two bar lists are the
 * only thing the toggle drives.
 */
export async function getWorkspaceUsage(orgId: string, range: UsageRange = "30d"): Promise<RawWorkspaceUsage> {
  const days = String(USAGE_RANGE_DAYS[range]);
  const id = String(orgId);

  const [byService, byModel, daily] = await Promise.all([
    query<{ name: string; tokens: string; cost: string }>(
      "timescale",
      `SELECT service AS name,
              COALESCE(SUM(total_token_count), 0) AS tokens,
              COALESCE(SUM(cost_sum), 0)          AS cost
         FROM daily_data
        WHERE org_id = $1
          AND service IS NOT NULL
          AND created_at >= NOW() - ($2 || ' days')::interval
        GROUP BY service
        ORDER BY tokens DESC`,
      [id, days],
    ),
    query<{ name: string; tokens: string; cost: string }>(
      "timescale",
      `SELECT model AS name,
              COALESCE(SUM(total_token_count), 0) AS tokens,
              COALESCE(SUM(cost_sum), 0)          AS cost
         FROM daily_data
        WHERE org_id = $1
          AND model IS NOT NULL
          AND created_at >= NOW() - ($2 || ' days')::interval
        GROUP BY model
        ORDER BY tokens DESC`,
      [id, days],
    ),
    query<{ date: Date | string; ok: string; err: string }>(
      "timescale",
      // `daily_data` is already bucketed a day at a time in
      // `Asia/Kolkata` (plan §4.5 Q26), so the day key is `created_at` itself.
      `SELECT created_at AS date,
              COALESCE(SUM(success_count), 0)                       AS ok,
              COALESCE(SUM(record_count) - SUM(success_count), 0)   AS err
         FROM daily_data
        WHERE org_id = $1
          AND created_at >= NOW() - ($2 || ' days')::interval
        GROUP BY created_at
        ORDER BY created_at ASC`,
      [id, String(WINDOW_DAYS)],
    ),
  ]);

  return {
    byService: byService.map((r) => ({ name: r.name, tokens: num(r.tokens), cost: num(r.cost) })),
    byModel: byModel.map((r) => ({ name: r.name, tokens: num(r.tokens), cost: num(r.cost) })),
    daily: daily.map((r) => ({
      date: iso(r.date) ?? "",
      ok: num(r.ok),
      err: Math.max(0, num(r.err)),
    })),
  };
}

// ----------------------------------------------------------------- billing ---

/**
 * Lago wallet + subscription + ledger, and the Mongo failed-debit count.
 *
 * **GET only.** Plan §6 leaves Top up, Change plan, Sync balance and Replay
 * debits visible-but-disabled, so nothing here writes and nothing here needs
 * to. Plan §7: Lago unreachable → every Lago-sourced cell is `null`, the
 * failed-debit count still comes from Mongo, and the tab renders.
 */
export async function getWorkspaceBilling(orgId: string): Promise<RawWorkspaceBilling> {
  const id = String(orgId);

  const failedDebits = await (
    await collection("failed_billing_debits")
  ).countDocuments({ org_id: id }, { maxTimeMS: MONGO_MAX_TIME_MS });

  if (!lagoConfigured()) {
    return {
      walletCredits: null,
      walletUsd: null,
      walletSyncedAt: null,
      subscription: null,
      ledger: [],
      failedDebits,
      lagoUnavailable: true,
    };
  }

  try {
    const [wallet, subscription] = await Promise.all([getWallet(id), getSubscription(id)]);
    const ledger = await walletLedger(id);

    return {
      walletCredits: wallet === null ? null : wallet.credits_balance,
      walletUsd: wallet === null ? null : creditsToUsd(wallet.credits_balance),
      walletSyncedAt: null,
      subscription:
        subscription === null
          ? null
          : {
              planCode: subscription.plan_code,
              planName: planNameFor(planSlugForCode(subscription.plan_code), subscription.plan_code),
              changedAt: subscription.current_period_start,
            },
      ledger,
      failedDebits,
      lagoUnavailable: false,
    };
  } catch (err) {
    console.error(`[admin-api] Lago unavailable for org ${id}; billing tab degrades to em dashes`, err);
    return {
      walletCredits: null,
      walletUsd: null,
      walletSyncedAt: null,
      subscription: null,
      ledger: [],
      failedDebits,
      lagoUnavailable: true,
    };
  }
}

/** Plan §4.5 Q48 — 25 rows where the design does not specify. */
const LEDGER_LIMIT = 25;

/**
 * `listWalletTransactions` keys on the **Lago wallet id**, which the `/wallets`
 * listing carries and our `getWallet` summary does not, so the id is read here
 * rather than threaded through a shape that exists to sum balances.
 */
async function walletLedger(orgId: string): Promise<RawWorkspaceBilling["ledger"]> {
  const walletId = await firstWalletId(orgId);
  if (!walletId) return [];

  const transactions = await listWalletTransactions(walletId, { perPage: LEDGER_LIMIT });

  return transactions.map((t) => {
    const inbound = t.direction === "inbound";
    return {
      date: t.settled_at ?? t.created_at,
      // Lago's own vocabulary mapped onto the design's three tags: money out is
      // a debit; money in is a top-up when a human put it there (`source:
      // "manual"`, which is what `lago.service.js#topUpWallet` writes) and a
      // grant when the platform did.
      event: (!inbound ? "debit" : t.source === "manual" ? "topup" : "grant") as
        | "debit"
        | "topup"
        | "grant",
      // gtwy-node tags its own writes with `reason` / `by` / `source`
      // (`lago.service.js`), so the most specific thing it recorded is what the
      // Detail column shows; failing that, Lago's own source, then its status.
      detail: t.metadata.reason || t.metadata.source || t.source || t.status || "",
      credits: t.credits,
      // Lago reports no running balance on a transaction. The design's Balance
      // column therefore reads as an em dash rather than as a number we would
      // have to reconstruct by replaying a page of the ledger.
      balance: null,
    };
  });
}

async function firstWalletId(orgId: string): Promise<string | null> {
  const wallet = await getWallet(orgId);
  // Oldest first, which is the wallet the balance and the ledger both describe
  // when an org has more than one.
  return wallet?.lago_ids[0] ?? null;
}

// ------------------------------------------------------------------ embeds ---

/**
 * The Embeds tab — plan §5/03: "`folders` where `type:'embed'`, `org_id`, plus
 * the D5 agent/call joins, reused not re-written". `listEmbeds` is D5's own
 * list function; this narrows it to one org.
 */
export async function listWorkspaceEmbeds(orgId: string): Promise<RawWorkspaceEmbed[]> {
  return listEmbedsForOrg(String(orgId));
}
