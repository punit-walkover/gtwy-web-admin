import "server-only";

import { ObjectId, type Filter } from "mongodb";

import { ApiError } from "@/lib/api/envelope";
import { orgNamesOrEmpty } from "@/lib/api/orgName";
import { mongoDb, MONGO_MAX_TIME_MS } from "@/lib/db/mongo";
import { queryOrNull } from "@/lib/db/sql";
import { listOrgUsers, type Msg91User } from "@/lib/clients/msg91";
import type {
  RawEmbedAgent,
  RawEmbedDetail,
  RawEmbedEndUser,
  RawEmbedList,
  RawEmbedRow,
} from "@/lib/mappers/embeds";
import type { EmbedFlag } from "@/mocks/types";

/**
 * Plan §5 “05 — Embeds”. Every read in this file traces to a gtwy-node source:
 *
 *   `folders` / `FolderSchema`            — mongoModel/GtwyEmbed.model.js
 *   `configurations` by `folder_id`       — analytics.controller.js#getEmbedAnalytics
 *   `daily_data` by `bridge_id`           — migrations/timescale/20240223084103-daily_data.cjs
 *   `conversation_logs` grouped by owner  — db_services/embedAnalytics.service.js
 *   org names                             — plan §4.1, msg91 `getCompanies`
 *
 * Read-only throughout: no write, no index, no schema change (plan §1.2, §6).
 * Everything returned here is **raw** — numbers, ISO-8601 dates, enum codes.
 * `src/lib/mappers/embeds.ts` turns it into the strings the design renders.
 */

// ------------------------------------------------------------------ shapes ---

/**
 * The 20 boolean keys of `FolderSchema`'s embed defaults, in schema order —
 * which is the order the design's config panel renders them in.
 */
export const EMBED_FLAG_ORDER: readonly EmbedFlag[] = [
  "showHomeButton",
  "showAgentTypeOnCreateAgent",
  "showHistory",
  "showConfigType",
  "showAdvancedParameters",
  "showCreateManuallyButton",
  "showAdvancedConfigurations",
  "showPreTool",
  "defaultOpen",
  "showFullScreenButton",
  "showCloseButton",
  "showHeader",
  "addDefaultApiKeys",
  "showResponseType",
  "showVariables",
  "showAgentName",
  "showGuide",
  "showPromptHelper",
  "showReviewAgent",
  "showMcp",
];

/**
 * `FolderSchema.pre("save")`'s embed defaults, restricted to the keys the design
 * renders. A folder written before a key existed simply has no value for it, and
 * gtwy-node resolves that the same way: `{ ...defaults, ...(this.config || {}) }`.
 */
const FLAG_DEFAULTS: Record<EmbedFlag, boolean> = {
  showHomeButton: true,
  showAgentTypeOnCreateAgent: false,
  showHistory: false,
  showConfigType: false,
  showAdvancedParameters: true,
  showCreateManuallyButton: true,
  showAdvancedConfigurations: true,
  showPreTool: true,
  defaultOpen: false,
  showFullScreenButton: true,
  showCloseButton: true,
  showHeader: true,
  addDefaultApiKeys: false,
  showResponseType: false,
  showVariables: false,
  showAgentName: false,
  showGuide: false,
  showPromptHelper: true,
  showReviewAgent: false,
  showMcp: false,
};

const SCALAR_DEFAULTS = {
  slide: "right",
  themeMode: "light",
  configureGtwyRedirection: "",
  embed_id: "",
} as const;

// ------------------------------------------------------------------ mongo ----

interface FolderDoc {
  _id: ObjectId;
  name?: string;
  org_id?: string;
  type?: string;
  config?: Record<string, unknown> | null;
  created_at?: Date | null;
  updated_at?: Date | null;
  folder_limit?: number;
  folder_usage?: number;
  folder_limit_reset_period?: string;
  folder_limit_start_date?: Date | null;
}

interface ConfigurationDoc {
  _id: ObjectId;
  name?: string;
  org_id?: string;
  user_id?: string;
  service?: string;
  bridgeType?: "chatbot" | "api";
  configuration?: { model?: string } | null;
  folder_id?: string | ObjectId | null;
  published_version_id?: string | null;
  versions?: Array<string | ObjectId> | null;
  deletedAt?: Date | null;
}

/** gtwy-node filters deleted agents in JS (`!a.deletedAt`); we do it in the query. */
const NOT_DELETED = { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] };

/**
 * `folder_id` is a `String` on `ConfigurationSchema` but the caller holds a
 * folder `_id`, so gtwy-node matches on both forms
 * (`analytics.controller.js` builds `folderIdVariants`). We do the same.
 */
function folderIdVariants(folderId: string): Array<string | ObjectId> {
  const variants: Array<string | ObjectId> = [folderId];
  if (ObjectId.isValid(folderId)) variants.push(new ObjectId(folderId));
  return variants;
}

async function folders() {
  const db = await mongoDb();
  return db.collection<FolderDoc>("folders");
}

async function configurations() {
  const db = await mongoDb();
  return db.collection<ConfigurationDoc>("configurations");
}

/** One embed folder, or `null` when the id is unknown or is not an embed. */
async function findEmbedFolder(folderId: string): Promise<FolderDoc | null> {
  if (!ObjectId.isValid(folderId)) return null;
  const col = await folders();
  const doc = await col.findOne(
    { _id: new ObjectId(folderId), type: "embed" } as Filter<FolderDoc>,
    { maxTimeMS: MONGO_MAX_TIME_MS },
  );
  return doc ?? null;
}

/** Per-folder agent count and distinct owner count, for a page of folders. */
async function agentCountsByFolder(
  folderIds: string[],
): Promise<Map<string, { agents: number; owners: number }>> {
  const out = new Map<string, { agents: number; owners: number }>();
  if (folderIds.length === 0) return out;

  const variants = folderIds.flatMap(folderIdVariants);
  const col = await configurations();
  const rows = await col
    .aggregate<{ _id: string | ObjectId; agents: number; owners: string[] }>(
      [
        { $match: { folder_id: { $in: variants }, ...NOT_DELETED } },
        { $group: { _id: "$folder_id", agents: { $sum: 1 }, owners: { $addToSet: "$user_id" } } },
      ],
      { maxTimeMS: MONGO_MAX_TIME_MS },
    )
    .toArray();

  for (const row of rows) {
    const key = String(row._id);
    const existing = out.get(key);
    const owners = row.owners.filter((o) => o !== null && o !== undefined && o !== "").length;
    if (existing) {
      existing.agents += row.agents;
      existing.owners += owners;
    } else {
      out.set(key, { agents: row.agents, owners });
    }
  }
  return out;
}

/** Every non-deleted agent in one embed folder, with its version ids. */
async function agentsInFolder(folderId: string): Promise<ConfigurationDoc[]> {
  const col = await configurations();
  return col
    .find(
      { folder_id: { $in: folderIdVariants(folderId) }, ...NOT_DELETED } as Filter<ConfigurationDoc>,
      {
        projection: {
          _id: 1,
          name: 1,
          org_id: 1,
          user_id: 1,
          service: 1,
          bridgeType: 1,
          "configuration.model": 1,
          published_version_id: 1,
          versions: 1,
        },
        maxTimeMS: MONGO_MAX_TIME_MS,
      },
    )
    .toArray();
}

// ------------------------------------------------------------- timescale ----

export const EMBED_WINDOW_DAYS = 30;

interface DailyRow {
  bridge_id: string;
  calls: string | number;
  success: string | number;
  cost: string | number;
}

/**
 * `daily_data` carries the parent `bridge_id` in its own column and the version
 * in `version_id`, so a per-agent roll-up keys on `bridge_id` alone — unlike
 * `conversation_logs`, where a versioned call is logged under the version id.
 *
 * Every value is a bind parameter (plan §4.3).
 */
async function dailyByBridge(bridgeIds: string[], days = EMBED_WINDOW_DAYS): Promise<Map<string, DailyRow>> {
  const out = new Map<string, DailyRow>();
  if (bridgeIds.length === 0) return out;

  const rows = await queryOrNull<DailyRow>(
    "timescale",
    `SELECT bridge_id,
            COALESCE(SUM(record_count), 0)  AS calls,
            COALESCE(SUM(success_count), 0) AS success,
            COALESCE(SUM(cost_sum), 0)      AS cost
       FROM daily_data
      WHERE bridge_id = ANY($1::text[])
        AND created_at >= NOW() - ($2 || ' days')::interval
      GROUP BY bridge_id`,
    [bridgeIds, String(days)],
  );

  for (const row of rows ?? []) out.set(String(row.bridge_id), row);
  return out;
}

// ---------------------------------------------------------------- postgres --

interface ConversationRow {
  bridge_id: string;
  calls: string | number;
  sessions: string | number;
  last_seen: Date | string | null;
}

/**
 * Sessions and calls per bridge, the method `embedAnalytics.service.js` uses:
 * `COUNT(*)` for calls, `COUNT(DISTINCT thread_id)` for sessions,
 * `MAX(created_at)` for last seen.
 *
 * Deliberately **not** filtered by `org_id`. `embedAnalytics.service.js` adds
 * that filter and then retries without it whenever the filtered count comes back
 * zero against a non-zero lifetime — a bridge id is a globally unique ObjectId,
 * so the filter buys nothing and the retry path is the one that actually holds.
 */
async function conversationsByBridge(
  bridgeIds: string[],
  days = EMBED_WINDOW_DAYS,
): Promise<Map<string, ConversationRow> | null> {
  if (bridgeIds.length === 0) return new Map();

  const rows = await queryOrNull<ConversationRow>(
    "postgres",
    `SELECT bridge_id,
            COUNT(*)::int                    AS calls,
            COUNT(DISTINCT thread_id)::int   AS sessions,
            MAX(created_at)                  AS last_seen
       FROM conversation_logs
      WHERE bridge_id = ANY($1::text[])
        AND created_at >= NOW() - ($2 || ' days')::interval
      GROUP BY bridge_id`,
    [bridgeIds, String(days)],
  );

  if (rows === null) return null;
  return new Map(rows.map((r) => [String(r.bridge_id), r]));
}

// ------------------------------------------------------------------ config ---

function readConfig(doc: FolderDoc) {
  const config = (doc.config ?? {}) as Record<string, unknown>;

  const flags = {} as Record<EmbedFlag, boolean>;
  for (const key of EMBED_FLAG_ORDER) {
    const stored = config[key];
    flags[key] = typeof stored === "boolean" ? stored : FLAG_DEFAULTS[key];
  }

  const scalar = (key: keyof typeof SCALAR_DEFAULTS): string => {
    const stored = config[key];
    return typeof stored === "string" && stored !== "" ? stored : SCALAR_DEFAULTS[key];
  };

  return {
    flags,
    /**
     * `FolderSchema.config` defaults to the string `"agent"`, and a folder made
     * before the embed defaults existed can carry no object at all. Either way
     * nothing below was actually stored, which is the design's "No
     * configuration for this embed" branch.
     */
    hasStoredConfig:
      doc.config !== null &&
      typeof doc.config === "object" &&
      Object.keys(doc.config as Record<string, unknown>).length > 0,
    slide: scalar("slide"),
    themeMode: scalar("themeMode"),
    // An empty redirection URL is meaningful — the design renders the field's
    // placeholder for it — so it is not defaulted away.
    configureGtwyRedirection: typeof config.configureGtwyRedirection === "string" ? config.configureGtwyRedirection : "",
    embedId: typeof config.embed_id === "string" ? config.embed_id : "",
  };
}

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

// ------------------------------------------------------------------- list ----

export const DEFAULT_PAGE_SIZE = 25;

/**
 * One org's embed folders, for the Workspace detail page's Embeds tab (D3).
 *
 * Plan §5/03 says that tab reuses "the D5 agent/call joins, reused not
 * re-written", so it is `listEmbeds` with the org filter applied and no paging
 * — the design's tab has no pager. The one-query-for-the-whole-set rule holds
 * exactly as it does for the list: one `configurations` read and one
 * `daily_data` read for every folder in the tab, never one per row.
 */
export async function listEmbedsForOrg(orgId: string): Promise<RawEmbedRow[]> {
  return (await listEmbeds({ page: 1, pageSize: MAX_ORG_EMBEDS, orgId })).rows;
}

/**
 * The tab has no pager, so it asks for everything. No org in this deployment
 * comes close; the ceiling exists so a bad `org_id` cannot scan the collection.
 */
const MAX_ORG_EMBEDS = 500;

/**
 * The header search on the Embeds page: embed name, folder id, org id, or the
 * workspace's msg91 name. Workspace names live in msg91, not Mongo, so they are
 * resolved to org ids first and matched with `$in`.
 */
async function searchClause(raw: string | undefined): Promise<Record<string, unknown>> {
  const q = (raw ?? "").trim();
  if (!q) return {};

  const pattern = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const or: Record<string, unknown>[] = [{ name: pattern }, { org_id: q }];
  if (ObjectId.isValid(q) && q.length === 24) or.push({ _id: new ObjectId(q) });

  const orgIds = [...(await orgNamesOrEmpty())]
    .filter(([, name]) => name && pattern.test(name))
    .map(([id]) => id);
  if (orgIds.length) or.push({ org_id: { $in: orgIds } });

  return { $or: or };
}

export async function listEmbeds(
  options: { page?: number; pageSize?: number; orgId?: string; q?: string } = {},
): Promise<RawEmbedList> {
  const pageSize = Math.min(Math.max(1, Math.trunc(options.pageSize || DEFAULT_PAGE_SIZE)), MAX_ORG_EMBEDS);
  const page = Math.max(1, Math.trunc(options.page || 1));

  const col = await folders();
  const filter = {
    type: "embed",
    ...(options.orgId ? { org_id: String(options.orgId) } : {}),
    ...(await searchClause(options.q)),
  } as Filter<FolderDoc>;

  const [total, docs] = await Promise.all([
    col.countDocuments(filter, { maxTimeMS: MONGO_MAX_TIME_MS }),
    col
      .find(filter, {
        projection: {
          _id: 1,
          name: 1,
          org_id: 1,
          created_at: 1,
          folder_limit: 1,
          folder_usage: 1,
          folder_limit_reset_period: 1,
          "config.themeMode": 1,
        },
        // `_id` breaks ties so a row cannot appear on two pages.
        sort: { created_at: -1, _id: -1 },
        skip: (page - 1) * pageSize,
        limit: pageSize,
        maxTimeMS: MONGO_MAX_TIME_MS,
      })
      .toArray(),
  ]);

  const folderIds = docs.map((d) => d._id.toString());

  // Bridge ids for the whole page, so `daily_data` is one query rather than one
  // per folder — the performance rule in plan §4.1.
  const agentCol = await configurations();
  const agentDocs = await agentCol
    .find(
      { folder_id: { $in: folderIds.flatMap(folderIdVariants) }, ...NOT_DELETED } as Filter<ConfigurationDoc>,
      { projection: { _id: 1, folder_id: 1 }, maxTimeMS: MONGO_MAX_TIME_MS },
    )
    .toArray();

  const bridgesByFolder = new Map<string, string[]>();
  for (const agent of agentDocs) {
    const key = String(agent.folder_id);
    const list = bridgesByFolder.get(key);
    if (list) list.push(agent._id.toString());
    else bridgesByFolder.set(key, [agent._id.toString()]);
  }

  const [counts, daily, names] = await Promise.all([
    agentCountsByFolder(folderIds),
    dailyByBridge(agentDocs.map((a) => a._id.toString())),
    orgNamesOrEmpty(),
  ]);

  const rows: RawEmbedRow[] = docs.map((doc) => {
    const folderId = doc._id.toString();
    const orgId = String(doc.org_id ?? "");
    const count = counts.get(folderId) ?? { agents: 0, owners: 0 };

    let calls30d = 0;
    for (const bridgeId of bridgesByFolder.get(folderId) ?? []) {
      calls30d += num(daily.get(bridgeId)?.calls);
    }

    return {
      folderId,
      name: doc.name ?? "",
      orgId,
      orgName: names.get(orgId) ?? null,
      agents: count.agents,
      endUsers: count.owners,
      calls30d,
      folderUsage: num(doc.folder_usage),
      folderLimit: num(doc.folder_limit),
      resetPeriod: doc.folder_limit_reset_period ?? "monthly",
      themeMode:
        typeof doc.config?.themeMode === "string" && doc.config.themeMode !== ""
          ? doc.config.themeMode
          : SCALAR_DEFAULTS.themeMode,
    };
  });

  return { rows, total, page, pageSize };
}

// ----------------------------------------------------------------- detail ----

export async function getEmbedDetail(folderId: string): Promise<RawEmbedDetail> {
  const doc = await findEmbedFolder(folderId);
  if (!doc) throw new ApiError("not_found", "Embed folder not found.");

  const orgId = String(doc.org_id ?? "");
  const config = readConfig(doc);

  const agents = await agentsInFolder(folderId);
  const bridgeIds = agents.map((a) => a._id.toString());

  const [daily, names] = await Promise.all([dailyByBridge(bridgeIds), orgNamesOrEmpty()]);

  let calls = 0;
  let success = 0;
  for (const bridgeId of bridgeIds) {
    const row = daily.get(bridgeId);
    calls += num(row?.calls);
    success += num(row?.success);
  }

  const owners = new Set(agents.map((a) => a.user_id).filter((u): u is string => !!u));

  return {
    folderId: doc._id.toString(),
    name: doc.name ?? "",
    orgId,
    orgName: names.get(orgId) ?? null,
    embedId: config.embedId,
    flagOrder: [...EMBED_FLAG_ORDER],
    flags: config.flags,
    hasStoredConfig: config.hasStoredConfig,
    slide: config.slide,
    themeMode: config.themeMode,
    configureGtwyRedirection: config.configureGtwyRedirection,
    folderUsage: num(doc.folder_usage),
    folderLimit: num(doc.folder_limit),
    resetPeriod: doc.folder_limit_reset_period ?? "monthly",
    resetStartDate: iso(doc.folder_limit_start_date),
    agents: agents.length,
    endUsers: owners.size,
    calls30d: calls,
    errorRatePct: errorRate(calls, success),
    createdAt: iso(doc.created_at),
    updatedAt: iso(doc.updated_at),
  };
}

// ----------------------------------------------------------------- agents ----

export async function listEmbedAgents(folderId: string): Promise<RawEmbedAgent[]> {
  const doc = await findEmbedFolder(folderId);
  if (!doc) throw new ApiError("not_found", "Embed folder not found.");

  const agents = await agentsInFolder(folderId);
  const daily = await dailyByBridge(agents.map((a) => a._id.toString()));

  return agents
    .map((agent) => {
      const bridgeId = agent._id.toString();
      const row = daily.get(bridgeId);
      const calls = num(row?.calls);
      const success = num(row?.success);
      const versions = (Array.isArray(agent.versions) ? agent.versions : []).filter(Boolean).map(String);
      const published = agent.published_version_id ? String(agent.published_version_id) : null;
      const publishedIndex = published ? versions.indexOf(published) : -1;

      return {
        bridgeId,
        name: agent.name || "Untitled",
        bridgeType: agent.bridgeType === "api" ? ("api" as const) : ("chatbot" as const),
        service: agent.service || "",
        model: agent.configuration?.model || "",
        publishedVersionNumber: publishedIndex >= 0 ? publishedIndex + 1 : null,
        versionCount: versions.length,
        calls,
        failed: Math.max(0, Math.round(calls - success)),
        errorRatePct: errorRate(calls, success),
        cost: num(row?.cost),
      };
    })
    .sort((a, b) => b.calls - a.calls || a.name.localeCompare(b.name));
}

// -------------------------------------------------------------- end users ----

/** The design's "Top end users" table shows five rows; so does gtwy-node's own
 * `USERS_DEFAULT_PAGE_SIZE` in `embedAnalytics.service.js`. */
export const END_USER_LIMIT = 5;

/**
 * Plan §4.2. An embed end user is an msg91 Cuser created by
 * `proxy.utils.js#createOrGetUser`: `meta.type === "embed"` and e-mail
 * `{org_id}_{folder_id}_{user_id}@gtwy.ai`. Their activity is the activity of
 * the agents they own, which is how `embedAnalytics.service.js` groups it.
 *
 * The trailing segment of that address is the **embedding application's own**
 * user id (`checkToken.user_id`), not the msg91 id the agent is owned by — so
 * the test is the `{org_id}_{folder_id}_` prefix, not an equality. Confirmed
 * against live data: msg91 id `169201` carries
 * `60133_699c5c35ce8d8511dd76e1d7_279417@gtwy.ai`.
 *
 * **Only the identifier the design renders leaves the server.** An owner who is
 * a real org member rather than an embed Cuser is reported as `user <id>`: the
 * design's column needs an identifier, not a person's name or address.
 */
function endUserLabel(userId: string, user: Msg91User | undefined, orgId: string, folderId: string): string {
  if (!user) return `user ${userId}`;
  const email = (user.email ?? "").toLowerCase();
  if (email === "") return `user ${userId}`;

  const isEmbedAddress =
    email.startsWith(`${orgId}_${folderId}_`.toLowerCase()) && email.endsWith("@gtwy.ai");
  const isEmbedMeta = (user.meta as { type?: unknown } | null)?.type === "embed";

  return isEmbedAddress || isEmbedMeta ? user.email! : `user ${userId}`;
}

export async function listEmbedEndUsers(folderId: string): Promise<RawEmbedEndUser[]> {
  const doc = await findEmbedFolder(folderId);
  if (!doc) throw new ApiError("not_found", "Embed folder not found.");

  const orgId = String(doc.org_id ?? "");
  const agents = await agentsInFolder(folderId);
  if (agents.length === 0) return [];

  // A versioned call is logged in `conversation_logs` under its version id, so
  // the query asks for parent and version ids and folds versions back onto the
  // parent — `embedAnalytics.service.js`'s `idToParent` map.
  const parentOf = new Map<string, string>();
  const ownerOf = new Map<string, string>();
  for (const agent of agents) {
    const parent = agent._id.toString();
    parentOf.set(parent, parent);
    ownerOf.set(parent, agent.user_id ? String(agent.user_id) : "");
    for (const version of agent.versions ?? []) {
      if (version) parentOf.set(String(version), parent);
    }
    if (agent.published_version_id) parentOf.set(String(agent.published_version_id), parent);
  }

  const [logs, users] = await Promise.all([
    conversationsByBridge([...parentOf.keys()]),
    listOrgUsers(orgId).catch((err) => {
      console.error("[admin-api] embeds: msg91 user lookup failed, degrading to user <id>", err);
      return [] as Msg91User[];
    }),
  ]);

  // `conversation_logs` is large and we may not add an index (plan §4.4). A
  // timed-out roll-up degrades to an empty table rather than a failed page.
  if (logs === null) return [];

  const byId = new Map(users.map((u) => [u.id, u]));
  const perOwner = new Map<string, { sessions: number; calls: number; lastSeenAt: string | null }>();

  for (const [loggedId, row] of logs) {
    const parent = parentOf.get(loggedId);
    if (!parent) continue;
    const owner = ownerOf.get(parent);
    if (!owner) continue;

    const entry = perOwner.get(owner) ?? { sessions: 0, calls: 0, lastSeenAt: null };
    entry.calls += num(row.calls);
    entry.sessions += num(row.sessions);
    const last = iso(row.last_seen);
    if (last && (!entry.lastSeenAt || last > entry.lastSeenAt)) entry.lastSeenAt = last;
    perOwner.set(owner, entry);
  }

  return [...perOwner.entries()]
    .map(([userId, stats]) => ({
      label: endUserLabel(userId, byId.get(userId), orgId, folderId),
      sessions: stats.sessions,
      calls: stats.calls,
      lastSeenAt: stats.lastSeenAt,
    }))
    .sort((a, b) => b.calls - a.calls || (b.lastSeenAt ?? "").localeCompare(a.lastSeenAt ?? ""))
    .slice(0, END_USER_LIMIT);
}

/** `generateStaticParams` is gone; this backs the list page's row links only. */
export async function listEmbedIds(limit = 1000): Promise<string[]> {
  const col = await folders();
  const docs = await col
    .find({ type: "embed" } as Filter<FolderDoc>, {
      projection: { _id: 1 },
      sort: { created_at: -1, _id: -1 },
      limit,
      maxTimeMS: MONGO_MAX_TIME_MS,
    })
    .toArray();
  return docs.map((d) => d._id.toString());
}
