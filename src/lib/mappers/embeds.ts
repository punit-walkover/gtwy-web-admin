import type { Agent, Embed, EmbedFlag, EmbedKpi, EmbedRow, EndUser, ThemeMode } from "@/mocks/types";
import {
  agentHealth,
  EM_DASH,
  fmt,
  oneDecimal,
  orgLabel,
  relative,
  thousands,
  twoDecimal,
} from "./primitives";

/**
 * Raw embed payloads → the exact shapes `src/mocks/types.ts` declares
 * (plan §1.3). Every rule here was read off the frozen fixtures in
 * `src/mocks/embeds.ts` and is re-derived from them in `tests/embeds.test.ts`.
 *
 * The `Raw*` shapes are the wire contract — what `/api/admin/embeds*` answers
 * and what `@/lib/sources/embeds` produces. They live here, next to the mapper
 * that consumes them, so a client bundle can name the type without reaching
 * into a `server-only` module.
 */

/** One row of `GET /api/admin/embeds`. */
export interface RawEmbedRow {
  folderId: string;
  name: string;
  orgId: string;
  /** `null` when msg91 could not be reached — the row still renders (plan §7). */
  orgName: string | null;
  agents: number;
  endUsers: number;
  calls30d: number;
  folderUsage: number;
  folderLimit: number;
  resetPeriod: string;
  themeMode: string;
}

export interface RawEmbedList {
  rows: RawEmbedRow[];
  total: number;
  page: number;
  pageSize: number;
}

/** `GET /api/admin/embeds/:folderId` — the stored `FolderSchema.config`, resolved. */
export interface RawEmbedDetail {
  folderId: string;
  name: string;
  orgId: string;
  orgName: string | null;
  embedId: string;
  flagOrder: EmbedFlag[];
  flags: Record<EmbedFlag, boolean>;
  /**
   * False when the `folders` document carries no `config` object at all, so
   * every key below is a `FolderSchema` default rather than a stored value.
   * It is what drives the design's "No configuration for this embed" branch.
   */
  hasStoredConfig: boolean;
  slide: string;
  themeMode: string;
  configureGtwyRedirection: string;
  folderUsage: number;
  folderLimit: number;
  resetPeriod: string;
  resetStartDate: string | null;
  agents: number;
  endUsers: number;
  calls30d: number;
  errorRatePct: number;
  createdAt: string | null;
  updatedAt: string | null;
}

/** One row of `GET /api/admin/embeds/:folderId/agents`. */
export interface RawEmbedAgent {
  bridgeId: string;
  name: string;
  bridgeType: "chatbot" | "api";
  service: string;
  model: string;
  /** 1-based position of `published_version_id` inside `versions`, or `null`. */
  publishedVersionNumber: number | null;
  versionCount: number;
  calls: number;
  failed: number;
  errorRatePct: number;
  cost: number;
}

/** One row of `GET /api/admin/embeds/:folderId/end-users`. */
export interface RawEmbedEndUser {
  /** The identifier the design's "User" column renders. Never a personal name. */
  label: string;
  sessions: number;
  calls: number;
  lastSeenAt: string | null;
}

/**
 * `folder_usage` / `folder_limit` are dollar amounts on `FolderSchema`. The
 * design renders them ungrouped and without decimals — `"$247 / $4145"` — so a
 * whole number prints whole; a fractional usage, which real folders do carry
 * (`folder_usage: 0.0850475`), keeps two decimals rather than rounding to `$0`.
 */
export function dollars(n: number): string {
  return "$" + (Number.isInteger(n) ? String(n) : twoDecimal(n));
}

/** `"$247 / $4145 · monthly"` — usage, limit and `folder_limit_reset_period`. */
export function limitLabel(usage: number, limit: number, resetPeriod: string): string {
  return `${dollars(usage)} / ${dollars(limit)} · ${resetPeriod}`;
}

/**
 * `"v5 · published"`. `ConfigurationSchema` keeps an ordered `versions` array
 * and a `published_version_id`, and the published one is **not** necessarily the
 * last — real agents publish v1 and keep drafting — so the label is that id's
 * 1-based position in `versions`. With nothing published, the version count
 * alone is shown.
 */
export function versionLabel(publishedVersionNumber: number | null, versionCount: number): string {
  if (publishedVersionNumber) return `v${publishedVersionNumber} · published`;
  if (versionCount === 0) return EM_DASH;
  return `v${versionCount}`;
}

export function mapEmbedRow(raw: RawEmbedRow): EmbedRow {
  return {
    id: raw.folderId,
    name: raw.name,
    ws: orgLabel(raw.orgId, raw.orgName),
    wsId: raw.orgId,
    agents: raw.agents,
    users: thousands(raw.endUsers),
    calls: fmt(raw.calls30d),
    limit: limitLabel(raw.folderUsage, raw.folderLimit, raw.resetPeriod),
    theme: raw.themeMode as ThemeMode,
  };
}

export function mapEmbedAgent(raw: RawEmbedAgent): Agent {
  const health = agentHealth(raw.errorRatePct);
  return {
    id: raw.bridgeId,
    name: raw.name,
    type: raw.bridgeType,
    service: raw.service,
    model: raw.model,
    version: versionLabel(raw.publishedVersionNumber, raw.versionCount),
    calls: thousands(raw.calls),
    err: oneDecimal(raw.errorRatePct),
    errN: raw.errorRatePct,
    failed: raw.failed,
    cost: twoDecimal(raw.cost),
    status: health.status,
    statusTag: health.statusTag,
  };
}

export function mapEmbedEndUser(raw: RawEmbedEndUser, now?: Date): EndUser {
  return {
    name: raw.label,
    sessions: raw.sessions,
    calls: raw.calls,
    last: raw.lastSeenAt ? relative(raw.lastSeenAt, now) : EM_DASH,
  };
}

/** The four header KPIs, in the design's order. */
export function mapEmbedKpis(raw: RawEmbedDetail): EmbedKpi[] {
  return [
    { label: "Agents", value: raw.agents },
    { label: "End users", value: thousands(raw.endUsers) },
    { label: "Calls · 30d", value: fmt(raw.calls30d) },
    { label: "Error rate", value: oneDecimal(raw.errorRatePct) + "%" },
  ];
}

export function mapEmbed(
  raw: RawEmbedDetail,
  agents: RawEmbedAgent[],
  endUsers: RawEmbedEndUser[],
  now?: Date,
): Embed {
  return {
    id: raw.folderId,
    embedId: raw.embedId,
    name: raw.name,
    ws: orgLabel(raw.orgId, raw.orgName),
    wsId: raw.orgId,
    agentsN: raw.agents,
    agents: agents.map(mapEmbedAgent),
    users: raw.endUsers,
    calls: raw.calls30d,
    limit: limitLabel(raw.folderUsage, raw.folderLimit, raw.resetPeriod),
    theme: raw.themeMode as ThemeMode,
    slide: raw.slide,
    redirect: raw.configureGtwyRedirection,
    flags: raw.flags as Record<EmbedFlag, boolean>,
    endUsers: endUsers.map((u) => mapEmbedEndUser(u, now)),
  };
}

/**
 * The header KPIs and the config panel's key order — the fixture's own
 * `embedDetail[id]` shape, plus the one flag that drives the design's "No
 * configuration for this embed" branch.
 */
export function mapEmbedDetail(raw: RawEmbedDetail): EmbedDetailPanel {
  return {
    kpis: mapEmbedKpis(raw),
    flagOrder: raw.flagOrder as EmbedFlag[],
    hasStoredConfig: raw.hasStoredConfig,
  };
}

export interface EmbedDetailPanel {
  kpis: EmbedKpi[];
  flagOrder: EmbedFlag[];
  hasStoredConfig: boolean;
}
