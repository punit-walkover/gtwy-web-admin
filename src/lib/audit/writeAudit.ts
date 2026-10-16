import "server-only";

import { mongoDb } from "@/lib/db/mongo";
import { env } from "@/lib/env";

/**
 * `admin_audit_logs` — the only collection we create, and the only write in this
 * codebase (plan §1.2, §3.1).
 *
 * Append-only by construction: this module exports `writeAudit` and
 * `readAudit`. There is no update path and no delete path, here or anywhere
 * else — `tests/no-writes.test.ts` fails the build if another module gains one.
 *
 * Called **only after gtwy-node returns success** on one of the four proxied
 * actions, per plan §3. A failed action leaves no row.
 */

export const AUDIT_COLLECTION = "admin_audit_logs";

export type AuditAction = "block_org" | "unblock_org" | "add_internal_org" | "remove_internal_org";

/** Plan §3.1, exactly. */
export interface AuditRow {
  admin_email: string;
  action: AuditAction;
  target_type: "org";
  target_id: string;
  /** Org name at the time of the action, or `null`. */
  target_name: string | null;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  environment: string;
  createdAt: Date;
  /** Required for `block_org`, optional for the other three. */
  reason: string | null;
  /** First hop of `x-forwarded-for`, `null` when absent — rendered as "—". */
  ip: string | null;
}

export type AuditInput = Omit<AuditRow, "environment" | "createdAt"> & {
  createdAt?: Date;
};

let indexReady: Promise<void> | null = null;

/**
 * Creates `{ createdAt: -1 }` — the audit page's sort — once per process.
 * **No TTL**: an audit log is kept (plan §3.1). This is a new collection, so no
 * existing index is touched; `createIndex` on an index that already exists is a
 * no-op, which is what makes it safe to call on the write path.
 */
async function ensureIndex(): Promise<void> {
  indexReady ??= (async () => {
    const db = await mongoDb();
    await db.collection(AUDIT_COLLECTION).createIndex({ createdAt: -1 }, { name: "createdAt_-1" });
  })().catch((err) => {
    // A failed index build must not permanently poison the write path.
    indexReady = null;
    throw err;
  });
  return indexReady;
}

/**
 * Append one audit row.
 *
 * The caller has already performed the action successfully, so a failure here
 * must not be turned into a failed action — it is logged and swallowed, and the
 * function reports whether the row landed. Losing an audit row is bad; telling
 * an admin their block failed when the org is in fact blocked is worse.
 */
export async function writeAudit(input: AuditInput): Promise<{ written: boolean }> {
  const row: AuditRow = {
    admin_email: input.admin_email,
    action: input.action,
    target_type: input.target_type,
    target_id: input.target_id,
    target_name: input.target_name,
    before: input.before,
    after: input.after,
    environment: env.environment(),
    createdAt: input.createdAt ?? new Date(),
    reason: input.reason,
    ip: input.ip,
  };

  try {
    await ensureIndex();
    const db = await mongoDb();
    await db.collection<AuditRow>(AUDIT_COLLECTION).insertOne(row);
    return { written: true };
  } catch (err) {
    console.error("[admin-api] audit write failed", { action: row.action, target_id: row.target_id }, err);
    return { written: false };
  }
}

export interface AuditQuery {
  page?: number;
  pageSize?: number;
  action?: AuditAction;
  adminEmail?: string;
  orgId?: string;
}

/**
 * The ceiling `readAudit` clamps `pageSize` to, so one caller cannot ask for the
 * whole collection in a single read. `GET /api/admin/audit` reports the clamped
 * value back, which is why this is exported rather than inlined.
 */
export const AUDIT_MAX_PAGE_SIZE = 200;

/** Newest first — the shape `GET /api/admin/audit` (plan §5, page 10) needs. */
export async function readAudit(q: AuditQuery = {}): Promise<{ rows: AuditRow[]; total: number }> {
  const page = Math.max(1, q.page ?? 1);
  const pageSize = Math.min(AUDIT_MAX_PAGE_SIZE, Math.max(1, q.pageSize ?? 25));

  const filter: Record<string, unknown> = {};
  if (q.action) filter.action = q.action;
  if (q.adminEmail) filter.admin_email = q.adminEmail.toLowerCase();
  if (q.orgId) filter.target_id = q.orgId;

  const db = await mongoDb();
  const collection = db.collection<AuditRow>(AUDIT_COLLECTION);

  const [rows, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .maxTimeMS(5_000)
      .toArray(),
    collection.countDocuments(filter, { maxTimeMS: 5_000 }),
  ]);

  return { rows: rows as AuditRow[], total };
}

/**
 * Newest audit row per admin e-mail — `lastActiveAt` on the Admin access page
 * (plan §9, Q44). `null` for an admin who has taken no action here.
 */
export async function lastActiveByEmail(): Promise<Map<string, Date>> {
  const db = await mongoDb();
  const rows = await db
    .collection<AuditRow>(AUDIT_COLLECTION)
    .aggregate<{ _id: string; last: Date }>(
      [{ $group: { _id: "$admin_email", last: { $max: "$createdAt" } } }],
      { maxTimeMS: 5_000 },
    )
    .toArray();
  return new Map(rows.map((r) => [String(r._id).toLowerCase(), r.last]));
}
