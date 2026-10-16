import "server-only";

import crypto from "node:crypto";

import { env, SESSION_TTL_SECONDS } from "@/lib/env";

/**
 * The plan §2.2 session, as amended at §14.2: a signed, httpOnly, SameSite=Lax,
 * Secure cookie holding `{ email, jwt, exp }`.
 *
 * `jwt` is gtwy-node's own session token, obtained in `POST /api/admin/session`
 * by trading the msg91 handoff token on `/api/user/localToken`. It lives here
 * and **nowhere else** — never in `localStorage`, never in `sessionStorage`,
 * never in a non-httpOnly cookie, never in a URL, never in a log line. That is
 * the one deliberate departure from GTWY-admin (§14.2 CTO default), and it is
 * what makes the four live actions safe: the JWT is read server-side and
 * forwarded to gtwy-node as `Authorization: <jwt>`, so `middleware` +
 * `InternalAuth` re-authorise **the caller's own token** on every write. This
 * console never mints a token and never asserts an identity gtwy-node has not
 * itself checked.
 *
 * Signed, not encrypted — but the payload now carries a live credential, so the
 * cookie's own `httpOnly` is what keeps it out of JavaScript and the signature
 * is what keeps a forged one out of a handler. HMAC-SHA256 over the exact bytes
 * that were signed, compared in constant time.
 *
 * **Two clocks, deliberately.** `exp` is the *revalidation* deadline — the JWT's
 * own `exp` capped at §2.2's 15-minute TTL. The cookie's `Max-Age` is the JWT's
 * full lifetime. Past `exp` the session is **stale, not gone**: `withAdmin`
 * still has the JWT and re-runs the operator probe against gtwy-node, whose
 * answer — including its Redis token blacklist, which closes most of the §2.3
 * revocation gap — decides whether the session continues. A 401 or 403 there
 * clears the cookie.
 */

export const SESSION_COOKIE = "gtwy_admin_session";

/** Ceiling on the cookie's own lifetime, however long-lived the JWT claims to be. */
const MAX_COOKIE_AGE_SECONDS = 30 * 24 * 60 * 60;

export interface AdminSession {
  email: string;
  /** gtwy-node's session JWT. Server-side only, always. */
  jwt: string;
  /** Unix seconds. When the operator verdict must be re-checked upstream. */
  exp: number;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function sign(payload: string, secret: string): string {
  return b64url(crypto.createHmac("sha256", secret).update(payload).digest());
}

/**
 * The `exp` claim off a JWT, in unix seconds, or `null` when the token carries
 * none or cannot be read.
 *
 * Decoded, never verified — we hold no `SecretKey` and have no business
 * verifying gtwy-node's own signature. The claim is used for two things only:
 * sizing our cookie, and refusing to spend a token we can already see is dead.
 * gtwy-node remains the authority on whether the token is good.
 */
export function jwtExpiry(token: string): number | null {
  const segment = token.split(".")[1];
  if (!segment) return null;
  try {
    const claims = JSON.parse(Buffer.from(segment, "base64url").toString("utf8")) as { exp?: unknown };
    return typeof claims?.exp === "number" && Number.isFinite(claims.exp) ? claims.exp : null;
  } catch {
    return null;
  }
}

export interface SealedSession {
  /** `<base64url(json)>.<base64url(hmac)>` */
  value: string;
  /** The revalidation deadline written into the payload. */
  expiresAt: number;
  /** `Max-Age` for the cookie — the JWT's whole life, so a stale session can still re-probe. */
  maxAge: number;
}

export function sealSession(
  session: { email: string; jwt: string; exp?: number },
  secret: string = env.adminSessionSecret(),
  now: number = Math.floor(Date.now() / 1000),
): SealedSession {
  const tokenExpiry = jwtExpiry(session.jwt);

  // §14.2: "`exp` is the JWT's own `exp`, capped at §2.2's 15-minute TTL."
  const ttlDeadline = now + SESSION_TTL_SECONDS;
  const exp = session.exp ?? (tokenExpiry === null ? ttlDeadline : Math.min(tokenExpiry, ttlDeadline));

  // The cookie outlives the revalidation deadline on purpose — without it the
  // browser would drop the JWT at `exp` and the "re-run step 2 against the
  // still-valid JWT" path in §3 could never happen.
  const cookieDeadline = tokenExpiry === null ? exp : Math.max(exp, tokenExpiry);
  const maxAge = Math.max(0, Math.min(cookieDeadline - now, MAX_COOKIE_AGE_SECONDS));

  const payload = b64url(Buffer.from(JSON.stringify({ email: session.email, jwt: session.jwt, exp })));
  return { value: `${payload}.${sign(payload, secret)}`, expiresAt: exp, maxAge };
}

/**
 * `null` for anything that is not a session this server signed and whose JWT is
 * still within its own lifetime. A session **past `exp` but inside the JWT's
 * life still opens** — it is stale, and `isStale` is how a caller finds out.
 */
export function openSession(
  value: string | undefined | null,
  secret: string = env.adminSessionSecret(),
  now: number = Math.floor(Date.now() / 1000),
): AdminSession | null {
  if (!value) return null;

  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;

  const payload = value.slice(0, dot);
  const provided = value.slice(dot + 1);
  const expected = sign(payload, secret);

  // Length check first: `timingSafeEqual` throws on a length mismatch, and the
  // length of an HMAC is not a secret.
  if (provided.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  const session = parsed as Partial<AdminSession>;
  if (typeof session?.email !== "string" || !session.email) return null;
  if (typeof session?.jwt !== "string" || !session.jwt) return null;
  if (typeof session?.exp !== "number") return null;

  // A token we can already see is dead is not worth a round trip to prove it.
  const tokenExpiry = jwtExpiry(session.jwt);
  if (tokenExpiry !== null && tokenExpiry <= now) return null;

  return { email: session.email, jwt: session.jwt, exp: session.exp };
}

/** Past the revalidation deadline: the JWT is still usable, the verdict is not. */
export function isStale(session: AdminSession, now: number = Math.floor(Date.now() / 1000)): boolean {
  return session.exp <= now;
}

/** The `Set-Cookie` attributes for the session, in one place. */
export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    // Next sets Secure automatically on HTTPS deployments; forcing it in dev
    // would stop the cookie being stored over plain http://localhost.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Expire the cookie, everywhere it is cleared, with one set of attributes. */
export function clearedSessionCookieOptions() {
  return sessionCookieOptions(0);
}
