import "server-only";

import { MSG91_CACHE_TTL_MS } from "@/lib/env";
import { cached } from "@/lib/clients/cache";
import { getAllOrgs, type Msg91Org } from "@/lib/clients/msg91";
import { activePlanCodeByOrg, planSlugForCode } from "@/lib/clients/lago";
import { collection, MONGO_MAX_TIME_MS } from "@/lib/db/mongo";
import {
  DEFAULT_PAGE_SIZE,
  type WorkspaceListQuery,
  type WorkspaceListRaw,
  type WorkspacePlansRaw,
  type WorkspaceRowRaw,
} from "@/lib/mappers/workspaces";

/**
 * The Workspaces list (plan §5 "02", with §4.1 and §4.2).
 *
 * Three sources, each owning exactly the columns plan §5 assigns it:
 *
 *   universe, `name`, `ownerEmail`  msg91 `getCompanies`            §4.1
 *   `agents`                        Mongo `configurations`
 *   `plan`                          Lago active subscriptions
 *
 * 30-day traffic (Timescale `daily_data`), block status (`blocked_orgs`) and
 * member counts (msg91 `getDetails`, one call per org) are deliberately not
 * read here: they were the slowest parts of a cold request, blocked orgs have
 * their own page, and members are on the workspace's own page. The owner is the
 * company's registered e-mail from the `getCompanies` row we already hold.
 *
 * **Degradation is per-source, never per-page** (plan §7). Mongo is primary: if
 * it is unreachable the route fails and the page renders its error branch.
 * msg91 and Lago are not: a failure there costs the cells they
 * own — the name falls back to `org <id>` and the plan to `null` — and every
 * other column still renders. `degraded` on the response says which happened, so
 * QA can tell a real "—" from an outage "—".
 */

// ------------------------------------------------------------- the universe ---

/** Every org id that owns at least one agent — the Mongo half of the universe. */
async function orgIdsWithAgents(): Promise<string[]> {
  return cached("workspaces:config-org-ids", MSG91_CACHE_TTL_MS, async () => {
    const configurations = await collection("configurations");
    const ids = await configurations.distinct("org_id", {});
    return ids.filter((id): id is string => typeof id === "string" && id !== "");
  });
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

  // Lago takes 8–11 s cold, and only the paid / free filters need every org's
  // plan before a page can be cut. For "all" the rows go out without it and the
  // page asks `planForOrgs` for its visible rows; the fetch is still started
  // here so that request joins it in flight rather than starting cold.
  const plansPending = filter === "all";
  const lago = planCodes();
  const [directory, configOrgIds, plans] = await Promise.all([
    orgDirectory(),
    orgIdsWithAgents(),
    plansPending ? null : lago,
  ]);

  // The universe is msg91's company list (plan §4.1). Orgs that Mongo knows
  // about but msg91 does not are added rather than dropped — that is the same
  // union that keeps the page alive when msg91 is down.
  const orgIds = new Set<string>([...(directory?.keys() ?? []), ...configOrgIds]);

  interface Candidate {
    orgId: string;
    name: string | null;
    plan: "PAID" | "FREE" | null;
  }

  const candidates: Candidate[] = [];
  for (const orgId of orgIds) {
    candidates.push({
      orgId,
      name: directory?.get(orgId)?.name ?? null,
      plan: plans === null ? null : planFor(plans, orgId),
    });
  }

  const matched = candidates.filter((c) => {
    if (!matchesQuery(c.orgId, c.name, needle)) return false;
    if (filter === "paid") return c.plan === "PAID";
    if (filter === "free") return c.plan === "FREE";
    return true;
  });

  // By name, with the orgs msg91 has no company for last — an `org 11202` row
  // is the least useful thing to show first.
  matched.sort((a, b) => sortKey(a).localeCompare(sortKey(b), "en"));

  const total = matched.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(clampPage(options.page), lastPage);
  const slice = matched.slice((page - 1) * pageSize, page * pageSize);
  const pageOrgIds = slice.map((c) => c.orgId);

  const agents = await agentCounts(pageOrgIds);

  const rows: WorkspaceRowRaw[] = slice.map((c) => ({
    orgId: c.orgId,
    name: c.name,
    ownerEmail: directory?.get(c.orgId)?.email ?? null,
    plan: c.plan,
    agents: agents.get(c.orgId) ?? 0,
  }));

  return {
    rows,
    total,
    page,
    pageSize,
    plansPending,
    degraded: {
      orgNames: directory === null,
      plan: !plansPending && plans === null,
    },
  };
}

/**
 * Plan per org for the rows a page is showing — the deferred half of the "all"
 * list. Reads the same cached Lago listing, so it costs nothing once warm.
 */
export async function planForOrgs(orgIds: string[]): Promise<WorkspacePlansRaw> {
  const plans = await planCodes();
  if (plans === null) return { plans: {}, degraded: true };
  return { plans: Object.fromEntries(orgIds.map((id) => [id, planFor(plans, id)])), degraded: false };
}

/**
 * gtwy-node's `getOrgPlanSlug`: no active subscription, or a plan_code we did
 * not create, is DEFAULT_PLAN_SLUG — "free".
 */
function planFor(plans: Map<string, string>, orgId: string): "PAID" | "FREE" {
  return planSlugForCode(plans.get(orgId)) === "paid" ? "PAID" : "FREE";
}

/**
 * The list order: name, then org id, with unnamed orgs
 * pushed to the end. `￿` sorts above every character a company name can
 * start with.
 */
function sortKey(c: { name: string | null; orgId: string }): string {
  return `${c.name ?? "￿"}\u0000${c.orgId}`;
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
