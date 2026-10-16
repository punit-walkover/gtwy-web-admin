import "server-only";

import type { NextRequest, NextResponse } from "next/server";

import { ApiError, fail } from "@/lib/api/envelope";
import { UpstreamError } from "@/lib/clients/http";
import { operatorVerdictError, verifyOperator } from "@/lib/auth/operatorGate";
import {
  SESSION_COOKIE,
  clearedSessionCookieOptions,
  isStale,
  openSession,
  sealSession,
  sessionCookieOptions,
} from "@/lib/auth/session";

/**
 * The single admin gate. Every route under `/api/admin/*` is wrapped in this and
 * no route implements its own check (plan §2.4) — with exactly one exception,
 * `POST /api/admin/session`, which is the route that *establishes* the session
 * and so cannot be behind it.
 *
 * The handler is only ever called with an `AdminContext`, and there is no code
 * path that reaches a handler without one. That is the property QA tests
 * directly.
 *
 * Order, per §14.2 and §3:
 *
 *   1. Signed session cookie, still inside its 15-minute revalidation window →
 *      trust it. gtwy-node already said "operator" when it was minted.
 *   2. Signed session cookie past that window, JWT still alive → **re-ask
 *      gtwy-node** with the JWT we hold. Operator → refresh the window. 401 or
 *      403 → clear the cookie and return it. This is also what closes most of
 *      the §2.3 revocation gap: gtwy-node consults its own Redis blacklist on
 *      every call, so a token revoked upstream stops working here within 15
 *      minutes without this console keeping a blacklist of its own.
 *   3. No cookie, a forged one, or one whose JWT has expired → 401.
 *
 * §2.1's `proxy_auth_token`-header path is **withdrawn** (§14.2). Nothing but
 * `POST /api/admin/session` may see that header, and nothing here compares an
 * e-mail against a local allowlist: gtwy-node decides who is an operator.
 */

export interface AdminContext {
  /**
   * Always lower-cased. gtwy-node's `InternalAuth` lower-cases before comparing
   * and so do we, and `admin_audit_logs.admin_email` is keyed on this value —
   * the Admin access page's "last active" groups by it. Storing whatever casing
   * gtwy-node happened to return would split one admin across two keys.
   */
  email: string;
  /**
   * The caller's **own** gtwy-node session JWT, read out of the httpOnly cookie
   * and forwarded on the §3 proxy writes as `Authorization: <jwt>`. It never
   * leaves the server in any other direction — not to a response body, not to a
   * log line (plan §14.2).
   */
  jwt: string;
  /** First hop of `x-forwarded-for`, for the audit row's `ip`. `null` when absent. */
  ip: string | null;
  /** Whether this request rode an unexpired session or re-asked gtwy-node. */
  source: "session_cookie" | "revalidated";
}

type Handler<C> = (req: NextRequest, ctx: AdminContext, routeCtx: C) => Promise<NextResponse> | NextResponse;

/** Plan §3.1: `ip` is the first hop of `x-forwarded-for`, `null` when absent. */
function readIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (!forwarded) return null;
  const first = forwarded.split(",")[0]?.trim();
  return first || null;
}

export function withAdmin<C = unknown>(handler: Handler<C>) {
  return async function guarded(req: NextRequest, routeCtx: C): Promise<NextResponse> {
    const ip = readIp(req);

    const session = openSession(req.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      // Absent, forged, unparseable, or carrying a JWT that is already past its
      // own `exp`. Clearing is harmless and stops a dead cookie being re-sent on
      // every subsequent request.
      const response = fail("unauthorized");
      response.cookies.set(SESSION_COOKIE, "", clearedSessionCookieOptions());
      return response;
    }

    let ctx: AdminContext = { email: session.email.toLowerCase(), jwt: session.jwt, ip, source: "session_cookie" };
    let refreshed: { value: string; maxAge: number } | null = null;

    if (isStale(session)) {
      let verdict;
      try {
        verdict = await verifyOperator(session.jwt);
      } catch (err) {
        // gtwy-node unreachable during revalidation. This is not "you are not an
        // operator" — it is "we cannot tell" — but it must still deny, and it
        // must not clear a session that may well still be good.
        if (err instanceof UpstreamError) {
          console.error("[admin-api] operator revalidation failed", err);
          return fail("upstream_unavailable");
        }
        throw err;
      }

      const denial = operatorVerdictError(verdict, session.email);
      if (denial) {
        const response = fail(denial.code, denial.safeMessage);
        // A 401 or 403 from the gate means this session is over (§3). A 503 —
        // the platform cannot answer — is not the operator's fault, so the
        // cookie survives and the next request tries again.
        if (denial.code === "unauthorized" || denial.code === "forbidden") {
          response.cookies.set(SESSION_COOKIE, "", clearedSessionCookieOptions());
        }
        return response;
      }

      const email = (verdict.email ?? session.email).toLowerCase();
      ctx = { email, jwt: session.jwt, ip, source: "revalidated" };

      const sealed = sealSession({ email, jwt: session.jwt });
      refreshed = { value: sealed.value, maxAge: sealed.maxAge };
    }

    let response: NextResponse;
    try {
      response = await handler(req, ctx, routeCtx);
    } catch (err) {
      response = toEnvelope(err);
    }

    if (refreshed) {
      response.cookies.set(SESSION_COOKIE, refreshed.value, sessionCookieOptions(refreshed.maxAge));
    }

    return response;
  };
}

/**
 * Any throw under a handler becomes the plan §1.4 envelope. Upstream detail is
 * logged here and never echoed — the rule `billing.controller.js#fail` follows.
 */
function toEnvelope(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    if (err.code === "internal" || err.code === "upstream_unavailable") {
      console.error("[admin-api] handler error", err);
    }
    return fail(err.code, err.safeMessage);
  }
  if (err instanceof UpstreamError) {
    console.error("[admin-api] upstream error", err);
    return fail("upstream_unavailable");
  }
  console.error("[admin-api] unhandled error", err);
  return fail("internal");
}
