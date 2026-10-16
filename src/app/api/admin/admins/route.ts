import type { NextRequest } from "next/server";

import { ok, upstream } from "@/lib/api/envelope";
import { withAdmin } from "@/lib/auth/withAdmin";
import { allowlistEntries } from "@/lib/auth/allowlist";
import { lastActiveByEmail } from "@/lib/audit/writeAudit";
import type { RawAdminAccessRow } from "@/lib/mappers/admins";

/**
 * `GET /api/admin/admins` → the Admin access page (plan §5, page 09).
 *
 * One row per `INTERNAL_ALLOWED_EMAILS` entry: `{ email, lastActiveAt }`.
 *
 * **The allow-list is the row set.** There is no admin collection and no invite
 * record anywhere — an admin exists here because the deployment's environment
 * says so. `allowlistEntries()` is the same `split(",") → trim → toLowerCase →
 * filter(Boolean)` normalisation `withAdmin` authorises with, read through the
 * same module, so the page cannot drift from the gate: every e-mail listed here
 * can sign in, and every e-mail that can sign in is listed here. Duplicates and
 * casing variants collapse the way the gate collapses them, and the order is the
 * order the variable is written in.
 *
 * `lastActiveAt` is the newest `admin_audit_logs.createdAt` for that e-mail, or
 * `null` (plan §9, gap 10). The mapper turns `null` into "never".
 *
 * **Mongo failing is an error, not a degrade.** Plan §7's partial rule covers an
 * *upstream provider* (msg91 / Lago) falling over while the primary source
 * answers. Here the audit collection is the primary source for the column; if it
 * cannot be read, the honest answer is "unknown", and reporting "never" for an
 * admin who has in fact acted would be a lie the page has no way to walk back.
 * So the route fails and the page shows its error branch.
 *
 * Read-only. Nothing here writes.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withAdmin(async (_req: NextRequest) => {
  const emails = allowlistEntries();

  // An empty allow-list is a real state, not a failure: nobody can sign in. The
  // page renders its empty branch and says so. No point querying Mongo for it.
  if (emails.length === 0) return ok<RawAdminAccessRow[]>([]);

  let lastActive: Map<string, Date>;
  try {
    lastActive = await lastActiveByEmail();
  } catch (err) {
    throw upstream("admin_audit_logs", err);
  }

  const rows: RawAdminAccessRow[] = emails.map((email) => {
    // `lastActiveByEmail` keys on the lower-cased `admin_email` the audit writer
    // stores, which is the same normalised form `allowlistEntries` yields — so
    // one admin is never split across two keys by casing.
    const at = lastActive.get(email);
    return { email, lastActiveAt: at ? new Date(at).toISOString() : null };
  });

  return ok(rows);
});
