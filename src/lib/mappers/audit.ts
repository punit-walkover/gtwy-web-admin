import type { AuditEntry, TagVariant } from "@/mocks/types";

import { istDateTime, orDash } from "./primitives";

/**
 * Audit log (plan §5, page 10).
 *
 * `GET /api/admin/audit` answers raw `admin_audit_logs` fields — the plan §3.1
 * document, with `createdAt` as ISO-8601 — and this is the only place they
 * become the strings `src/mocks/types.ts` declares.
 *
 * Nothing here is derived from the fixture's *rows*, because the fixture
 * predates the collection: `src/mocks/audit.ts` was seeded from the design
 * prototype and carries actions (`login-as`, `end session`, `plan change`,
 * `wallet top-up`, `plan edit`) that this console cannot produce. Only four
 * actions are ever written, and only by the four proxied writes in plan §3.
 *
 * What the fixture *does* pin is the presentation, and the rules below are taken
 * from its one row that is a real action of ours — the `block org` row:
 *
 *     action "block org" · target "org 91502" · ws "Tandem Labs"
 *     reason "Credential stuffing…" · ip "10.4.1.22" · tag "tag-accent"
 *
 * `tests/audit.test.ts` re-derives each rule from that row.
 */

/** The four actions plan §3.1 allows. Same union the writer stores. */
export type RawAuditAction =
  | "block_org"
  | "unblock_org"
  | "add_internal_org"
  | "remove_internal_org";

export const AUDIT_ACTIONS: readonly RawAuditAction[] = [
  "block_org",
  "unblock_org",
  "add_internal_org",
  "remove_internal_org",
] as const;

export function isAuditAction(value: string): value is RawAuditAction {
  return (AUDIT_ACTIONS as readonly string[]).includes(value);
}

/**
 * The Action column's label.
 *
 * The fixture renders the stored code `block_org` as `"block org"` — lower case,
 * spaces for underscores — so the other three follow the same rule rather than
 * inventing title case for them.
 */
export const AUDIT_ACTION_LABEL: Record<RawAuditAction, string> = {
  block_org: "block org",
  unblock_org: "unblock org",
  add_internal_org: "add internal org",
  remove_internal_org: "remove internal org",
};

/**
 * The Action column's tag.
 *
 * `block_org` is `tag-accent` in the fixture, which agrees with the design's own
 * rule everywhere else it renders an org's status — `orgStatusTag` accents
 * *blocked* and leaves *active* neutral. Accent therefore marks the action that
 * takes an org out of service; the three that do not are neutral.
 *
 * The fixture bounds only `block_org`; the other three are that rule applied,
 * and are the one presentation choice on this page the design does not witness
 * directly.
 */
export function auditActionTag(action: RawAuditAction): TagVariant {
  return action === "block_org" ? "tag-accent" : "tag-neutral";
}

/** Exactly what `GET /api/admin/audit` returns, one entry per document. */
export interface RawAuditEntry {
  /** ISO-8601 — `admin_audit_logs.createdAt`. */
  createdAt: string;
  /** `admin_email`, lower-cased by the writer. */
  adminEmail: string;
  action: RawAuditAction;
  /** `target_id`. Always an org id; `target_type` is `"org"` for all four. */
  orgId: string;
  /** `target_name` — the org's name when the action ran, or `null`. */
  orgName: string | null;
  /** Top-level `reason`. `null` for an action that collected none. */
  reason: string | null;
  /** Top-level `ip` — first hop of `x-forwarded-for`, or `null`. */
  ip: string | null;
}

/** The page payload: the newest `pageSize` entries, plus the whole set's size. */
export interface RawAuditPage {
  rows: RawAuditEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditPage {
  rows: AuditEntry[];
  total: number;
  page: number;
  pageSize: number;
}

/** Plan §5 page 10 / §4.5 Q48 — 25 rows, the page size the design does not state. */
export const AUDIT_PAGE_SIZE = 25;

/**
 * `istDateTime` raises on an Invalid Date. `createdAt` is written as a Mongo
 * `Date` and read back as ISO-8601, so it is always parseable — but a single
 * malformed row must not take the whole page down, so it degrades to an em dash
 * the way every other absent value on this page does.
 */
function auditTime(createdAt: string): string {
  const at = new Date(createdAt);
  if (!Number.isFinite(at.getTime())) return orDash(null);
  return istDateTime(at);
}

export function mapAuditEntry(raw: RawAuditEntry): AuditEntry {
  return {
    time: auditTime(raw.createdAt),
    admin: raw.adminEmail,
    action: AUDIT_ACTION_LABEL[raw.action],
    // The fixture's Target for a block is `org 91502` — the id, never the name.
    // The name is the Workspace column's job, so the two columns stay distinct
    // even for an org msg91 could not name when the action ran.
    target: `org ${raw.orgId}`,
    ws: orDash(raw.orgName),
    reason: orDash(raw.reason),
    ip: orDash(raw.ip),
    tag: auditActionTag(raw.action),
  };
}

export function mapAuditEntries(raw: RawAuditEntry[]): AuditEntry[] {
  return raw.map(mapAuditEntry);
}

export function mapAuditPage(raw: RawAuditPage): AuditPage {
  return { ...raw, rows: mapAuditEntries(raw.rows) };
}
