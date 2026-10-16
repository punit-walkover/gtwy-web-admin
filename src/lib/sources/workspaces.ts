import "server-only";

import { MSG91_CACHE_TTL_MS } from "@/lib/env";
import { cached } from "@/lib/clients/cache";
import { getAllOrgs, getProxyDetails, type Msg91Org } from "@/lib/clients/msg91";
import { activePlanCodeByOrg, planSlugForCode } from "@/lib/clients/lago";
import { collection, MONGO_MAX_TIME_MS } from "@/lib/db/mongo";
import { query } from "@/lib/db/sql";
import {
  DEFAULT_PAGE_SIZE,
  type WorkspaceListQuery,
  type WorkspaceListRaw,
  type WorkspaceRowRaw,
} from "@/lib/mappers/workspaces";

/**
 * The Workspaces list (plan §5 "02", with §4.1 and §4.2).
 *
 * Five sources, each owning exactly the columns plan §5 assigns it:
 *
 *   universe + `name`               msg91 `getCompanies`            §4.1
 *   `ownerEmail`, `members`         msg91 `getDetails`, page only   §4.2
 *   `agents`                        Mongo `configurations`
 *   `calls30d` `spend30d` `errorRate`  Timescale `daily_data`
 *   `status`                        Mongo `blocked_orgs`
 *   `plan`                          Lago active subscriptions
 *
 * **Degradation is per-source, never per-page** (plan §7). Mongo and Timescale
 * are primary: if either is unreachable the route fails and the page renders its
 * error branch. msg91 and Lago are not: a failure there costs the cells they
 * own — the name falls back to `org <id>` and the plan to `null` — and every
 * other column still renders. `degraded` on the response says which happened, so
 * QA can tell a real "—" from an outage "—".
 */

// ------------------------------------------------------------- the universe ---

interface Traffic {
  calls: number;
  success: number;
  cost: number;
}

/**
 * 30-day totals per org, the whole universe in one `daily_data` pass.
 *
 * Universe-wide rather than page-wide on purpose: the list is ordered by traffic,
 * and you cannot order a page by a number you only fetch for that page. It is one
 * grouped scan of a table with a one-year retention, measured at ~1.9 s cold, and
 * it is cached for the same 5 minutes plan §4.1 gives the msg91 list.
 */
const TRAFFIC_30D_SQL = `
  SELECT org_id,
         SUM(record_count)::float8  AS calls,
         SUM(success_count)::float8 AS success,
         SUM(cost_sum)::float8      AS cost
    FROM daily_data
   WHERE created_at >= NOW() - INTERVAL '30 days'
     AND org_id IS NOT NULL
   GROUP BY org_id`;

async function traffic30d(): Promise<Map<string, Traffic>> {
  return cached("workspaces:traffic-30d", MSG91_CACHE_TTL_MS, async () => {
    const rows = await query<{ org_id: string; calls: number; success: number; cost: number }>(
      "timescale",
      TRAFFIC_30D_SQL,
    );
    return new Map(
      rows.map((r) => [
        String(r.org_id),
        { calls: Number(r.calls) || 0, success: Number(r.success) || 0, cost: Number(r.cost) || 0 },
      ]),
    );
  });
}

/** Every org id that owns at least one agent — the Mongo half of the universe. */
async function orgIdsWithAgents(): Promise<string[]> {
  return cached("workspaces:config-org-ids", MSG91_CACHE_TTL_MS, async () => {
    const configurations = await collection("configurations");
    const ids = await configurations.distinct("org_id", {});
    return ids.filter((id): id is string => typeof id === "string" && id !== "");
  });
}

/** Org id → the blocked row, read fresh so a block or unblock shows immediately. */
async function blockedOrgIds(): Promise<Set<string>> {
  const blocked = await collection<{ org_id?: string }>("blocked_orgs");
  const rows = await blocked
    .find({}, { projection: { org_id: 1 }, maxTimeMS: MONGO_MAX_TIME_MS })
    .toArray();
  return new Set(rows.map((r) => String(r.org_id)).filter((id) => id !== "undefined"));
}

/** The msg91 company list, or `null` when msg91 is unreachable (plan §7). */
async function orgDirectory(): Promise<Map<string, Msg91Org> | null> {
  try {
    const orgs = await getAllOrgs();
    return new Map(orgs.map((o) => [o.id, o]));
  } catch (err) {
    console.error("[admin-api] msg91 org list unavailable; falling back to Mongo/Timescale", err);
    return null;
  }
}

/** Org id → Lago plan slug, or `null` when Lago is unreachable (plan §7). */
async function planCodes(): Promise<Map<string, string> | null> {
  try {
    return await activePlanCodeByOrg();
  } catch (err) {
    console.error("[admin-api] Lago subscriptions unavailable; plan degrades to null", err);
    return null;
  }
}

// -------------------------------------------------------------- page enrichment ---

/** Agent count per org, for the current page only. */
async function agentCounts(orgIds: string[]): Promise<Map<string, number>> {
  if (orgIds.length === 0) return new Map();
  const configurations = await collection<{ org_id?: string }>("configurations");
  const rows = await configurations
    .aggregate<{ _id: string; n: number }>(
      [{ $match: { org_id: { $in: orgIds } } }, { $group: { _id: "$org_id", n: { $sum: 1 } } }],
      { maxTimeMS: MONGO_MAX_TIME_MS },
    )
    .toArray();
  return new Map(rows.map((r) => [String(r._id), r.n]));
}

interface OrgPeople {
  members: number | null;
  ownerEmail: string | null;
  /** True only when a lookup we actually attempted failed — see `degraded`. */
  failed: boolean;
}

/** Nothing to ask msg91 about: not a company it knows. */
const NO_PEOPLE: OrgPeople = { members: null, ownerEmail: null, failed: false };

/**
 * Member count and owner e-mail for one org — `getProxyDetails`, §4.2.
 *
 * One page of 100 is enough for both answers: `totalEntityCount` is the member
 * count whatever the page size, and the owner is the member msg91 records as the
 * company's `created_by`. An org with more than 100 members whose creator is not
 * on the first page falls back to the company's own registered e-mail, which is
 * on the `getCompanies` row we already hold.
 *
 * **Only orgs msg91 actually lists are asked about.** The universe is a union
 * (below): `configurations` and `daily_data` carry org ids msg91 has no company
 * for — verified live, ids like `11202` answer
 * `422 {"company_id":["The selected company id is invalid."]}`. Those are not an
 * outage and must not be logged as one, so they are never requested; their
 * member and owner cells are simply unknown.
 *
 * Cached for 5 minutes per org, so paging back and forth does not re-fetch.
 */
async function orgPeople(orgId: string, org: Msg91Org | undefined): Promise<OrgPeople> {
  if (!org) return NO_PEOPLE;

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
    // The company row still carries a registered e-mail, so the owner column
    // survives even when the member list does not.
    return { members: null, ownerEmail: org.email ?? null, failed: true };
  }
}

/**
 * msg91 answers one org in ~200–900 ms. Ten at a time holds a cold page of 25
 * to roughly three round trips without opening 25 sockets at once; measured
 * live, it takes the cold page from 6.7 s to under 5 s and every later request
 * inside the 5-minute window to ~0.5 s.
 */
const MSG91_CONCURRENCY = 10;

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (let i = next++; i < items.length; i = next++) {
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

// ------------------------------------------------------------------- assembly ---

function matchesQuery(orgId: string, name: string | null, needle: string): boolean {
  if (needle === "") return true;
  if (orgId.toLowerCase().includes(needle)) return true;
  return (name ?? "").toLowerCase().includes(needle);
}

export async function listWorkspaces(options: WorkspaceListQuery = {}): Promise<WorkspaceListRaw> {
  const pageSize = clampPageSize(options.pageSize);
  const filter = options.filter ?? "all";
  const needle = (options.q ?? "").trim().toLowerCase();

  const [directory, traffic, configOrgIds, blocked, plans] = await Promise.all([
    orgDirectory(),
    traffic30d(),
    orgIdsWithAgents(),
    blockedOrgIds(),
    planCodes(),
  ]);

  // The universe is msg91's company list (plan §4.1). Orgs that Mongo or
  // Timescale know about but msg91 does not are added rather than dropped —
  // that is the same union that keeps the page alive when msg91 is down.
  const orgIds = new Set<string>([
    ...(directory?.keys() ?? []),
    ...configOrgIds,
    ...traffic.keys(),
    ...blocked,
  ]);

  interface Candidate {
    orgId: string;
    name: string | null;
    calls: number;
    success: number;
    cost: number;
    plan: "PAID" | "FREE" | null;
    status: "active" | "blocked";
  }

  const candidates: Candidate[] = [];
  for (const orgId of orgIds) {
    const t = traffic.get(orgId);
    candidates.push({
      orgId,
      name: directory?.get(orgId)?.name ?? null,
      calls: t?.calls ?? 0,
      success: t?.success ?? 0,
      cost: t?.cost ?? 0,
      // gtwy-node's `getOrgPlanSlug`: no active subscription, or a plan_code we
      // did not create, is DEFAULT_PLAN_SLUG — "free".
      plan: plans === null ? null : planSlugForCode(plans.get(orgId)) === "paid" ? "PAID" : "FREE",
      status: blocked.has(orgId) ? "blocked" : "active",
    });
  }

  const matched = candidates.filter((c) => {
    if (!matchesQuery(c.orgId, c.name, needle)) return false;
    if (filter === "blocked") return c.status === "blocked";
    if (filter === "paid") return c.plan === "PAID";
    if (filter === "free") return c.plan === "FREE";
    return true;
  });

  // Busiest first. The design specifies no order and shows no pager, so the
  // ordering has to put the orgs an operator is looking for on the first page.
  // Within equal traffic, named orgs come before the ones msg91 has no company
  // for — an `org 11202` row is the least useful thing to show first.
  matched.sort(
    (a, b) => b.calls - a.calls || sortKey(a).localeCompare(sortKey(b), "en"),
  );

  const total = matched.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(clampPage(options.page), lastPage);
  const slice = matched.slice((page - 1) * pageSize, page * pageSize);
  const pageOrgIds = slice.map((c) => c.orgId);

  const [agents, people] = await Promise.all([
    agentCounts(pageOrgIds),
    mapWithConcurrency(pageOrgIds, MSG91_CONCURRENCY, (orgId) =>
      orgPeople(orgId, directory?.get(orgId)),
    ),
  ]);

  const rows: WorkspaceRowRaw[] = slice.map((c, i) => ({
    orgId: c.orgId,
    name: c.name,
    ownerEmail: people[i].ownerEmail,
    plan: c.plan,
    agents: agents.get(c.orgId) ?? 0,
    members: people[i].members,
    calls30d: c.calls,
    spend30d: c.cost,
    errorRate: c.calls > 0 ? ((c.calls - c.success) / c.calls) * 100 : 0,
    status: c.status,
  }));

  return {
    rows,
    total,
    page,
    pageSize,
    degraded: {
      orgNames: directory === null,
      plan: plans === null,
      // Only a lookup that was attempted and failed. An org msg91 has no company
      // for was never asked about, and its blank member cell is a fact, not an
      // outage.
      members: people.some((p) => p.failed),
    },
  };
}

/**
 * The tiebreaker within equal traffic: name, then org id, with unnamed orgs
 * pushed to the end. `￿` sorts above every character a company name can
 * start with.
 */
function sortKey(c: { name: string | null; orgId: string }): string {
  return `${c.name ?? "￿"} ${c.orgId}`;
}

function clampPage(value: number | undefined): number {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function clampPageSize(value: number | undefined): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(n, 200);
}
