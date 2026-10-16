import "server-only";

import { ApiError } from "@/lib/api/envelope";

/**
 * Request-body reading for the four live actions (plan §3).
 *
 * A malformed body is the caller's fault, so it is a `bad_request` and never a
 * 500. `withAdmin` turns the throw into the plan §1.4 envelope.
 */

export async function readJsonBody(req: Request): Promise<Record<string, unknown>> {
  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    throw new ApiError("bad_request", "Expected a JSON body.");
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ApiError("bad_request", "Expected a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

/**
 * A required non-empty string.
 *
 * `reason` on block is the one field the plan marks **required** (§3, §3.1) even
 * though gtwy-node's own `blockedOrg.validation.js` allows it to be null — the
 * Audit page has a Reason column and the block dialog collects one, so an
 * unexplained block is refused here rather than logged as a blank.
 */
export function requiredString(body: Record<string, unknown>, field: string): string {
  const value = body[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new ApiError("bad_request", `${field} is required.`);
  }
  return value.trim();
}

/** An optional string; absent, null and blank all collapse to `null`. */
export function optionalString(body: Record<string, unknown>, field: string): string | null {
  const value = body[field];
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

/**
 * An org id from a path segment or a body field.
 *
 * Matched to `internalOrgs.validation.js`'s own `orgId` rule — up to 64 chars of
 * `[A-Za-z0-9_-]` — so an id this console accepts is an id gtwy-node accepts,
 * and a path like `/api/admin/orgs/..%2Fetc/block` is refused before it reaches
 * a query or an upstream URL.
 */
const ORG_ID = /^[A-Za-z0-9_-]{1,64}$/;

export function assertOrgId(value: string | undefined | null): string {
  const orgId = String(value ?? "").trim();
  if (!ORG_ID.test(orgId)) throw new ApiError("bad_request", "org_id must be an org id.");
  return orgId;
}
