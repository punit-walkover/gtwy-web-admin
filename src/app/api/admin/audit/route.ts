import type { NextRequest } from "next/server";

import { ApiError, ok, upstream } from "@/lib/api/envelope";
import { withAdmin } from "@/lib/auth/withAdmin";
import { AUDIT_MAX_PAGE_SIZE, readAudit, type AuditAction } from "@/lib/audit/writeAudit";
import {
  AUDIT_ACTIONS,
  AUDIT_PAGE_SIZE,
  isAuditAction,
  type RawAuditAction,
  type RawAuditEntry,
  type RawAuditPage,
} from "@/lib/mappers/audit";

/**
 * `GET /api/admin/audit?page&pageSize=25&action=&adminEmail=&orgId=`
 * → Mongo `admin_audit_logs`, **newest first** (plan §5, page 10).
 *
 * Raw values only, per plan §1.3: ISO-8601 for `createdAt`, the stored action
 * code, `null` for an absent `reason` or `ip`. `"2026-09-11 09:41"`, `"—"` and
 * `"tag-accent"` are `mappers/audit.ts`'s job.
 *
 * **Read-only, and there is nothing else here.** An audit log is append-only:
 * `admin_audit_logs` is written in exactly one place — `writeAudit()`, called by
 * the four proxied actions in plan §3 — and no update or delete path exists in
 * this codebase. This file exports `GET` and nothing else on purpose; adding a
 * `PATCH` or `DELETE` here would also fail `tests/no-writes.test.ts`.
 *
 * The sort runs on the `{ createdAt: -1 }` index `writeAudit` creates, so the
 * page's read stays an index scan as the collection grows.
 *
 * **Mongo failing is an error, not a degrade** — same reasoning as
 * `/api/admin/admins`: the collection is the page's only source, and there is
 * nothing honest to render without it. The page shows its error branch.
 *
 * The three filters exist because plan §5 names them; the page's filter bar
 * sets them, and its pager sets `page`.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * The writer's union and the mapper's must not drift: the route hands one to the
 * other. `mappers/audit.ts` cannot import from `writeAudit.ts` — that module is
 * `server-only` and the mapper runs in the browser — so the two are tied
 * together here, at the one place both are in scope. A mismatch is a compile
 * error, not a runtime surprise.
 */
type ActionsAgree = RawAuditAction extends AuditAction
  ? AuditAction extends RawAuditAction
    ? true
    : never
  : never;
const _actionsAgree: ActionsAgree = true;
void _actionsAgree;

export const GET = withAdmin(async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;

  const rawAction = params.get("action")?.trim() ?? "";
  if (rawAction !== "" && !isAuditAction(rawAction)) {
    throw new ApiError("bad_request", `action must be one of ${AUDIT_ACTIONS.join(", ")}.`);
  }

  const page = numberParam(params.get("page"), 1);
  const pageSize = numberParam(params.get("pageSize"), AUDIT_PAGE_SIZE);
  if (page < 1) throw new ApiError("bad_request", "page must be 1 or greater.");
  if (pageSize < 1) throw new ApiError("bad_request", "pageSize must be 1 or greater.");

  // `readAudit` lower-cases `adminEmail` before matching, because that is the
  // casing `withAdmin` stores it in — a filter typed in any casing finds the
  // same admin the Admin access page groups under.
  const adminEmail = params.get("adminEmail")?.trim() || undefined;
  const orgId = params.get("orgId")?.trim() || undefined;

  let result: Awaited<ReturnType<typeof readAudit>>;
  try {
    result = await readAudit({
      page,
      pageSize,
      action: rawAction === "" ? undefined : rawAction,
      adminEmail,
      orgId,
    });
  } catch (err) {
    throw upstream("admin_audit_logs", err);
  }

  const rows: RawAuditEntry[] = result.rows.map((doc) => ({
    createdAt: new Date(doc.createdAt).toISOString(),
    adminEmail: doc.admin_email,
    action: doc.action,
    orgId: doc.target_id,
    orgName: doc.target_name ?? null,
    reason: doc.reason ?? null,
    ip: doc.ip ?? null,
  }));

  // `readAudit` clamps `pageSize` to its own ceiling; the payload reports the
  // size that was actually used, not the one that was asked for.
  const payload: RawAuditPage = {
    rows,
    total: result.total,
    page,
    pageSize: Math.min(pageSize, AUDIT_MAX_PAGE_SIZE),
  };

  return ok(payload);
});

function numberParam(raw: string | null, fallback: number): number {
  if (raw === null || raw.trim() === "") return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n)) throw new ApiError("bad_request", "page and pageSize must be integers.");
  return n;
}
