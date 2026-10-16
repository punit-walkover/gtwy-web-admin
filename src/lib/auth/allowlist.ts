import { env } from "@/lib/env";

/**
 * `INTERNAL_ALLOWED_EMAILS`, normalised exactly as gtwy-node's
 * `middlewares/middleware.js` does it:
 *
 *   split(",") → trim → toLowerCase → filter(Boolean)
 *
 * gtwy-node builds the Set once at module load. We rebuild per call so the
 * allowlist can be changed without a redeploy; the list is a handful of entries,
 * so the cost is nil.
 */
export function allowedEmails(raw: string = env.internalAllowedEmails()): Set<string> {
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** gtwy-node's `InternalAuth` check: `req.profile.user.email.toLowerCase()` ∈ set. */
export function isAllowedEmail(email: string | null | undefined, raw?: string): boolean {
  if (!email) return false;
  return allowedEmails(raw).has(email.toLowerCase());
}

/** The allowlist as rows, for `GET /api/admin/admins` (plan §5, page 09). */
export function allowlistEntries(raw?: string): string[] {
  return [...allowedEmails(raw)];
}
