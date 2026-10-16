"use client";

import type { ApiEnvelope, ApiErrorCode } from "@/lib/api/envelope";

/**
 * The one fetch every page goes through.
 *
 * `401 → /login` and `403 → not-on-allowlist` are handled here, once, centrally
 * (plan §7). No page repeats them; a page only ever sees "it worked" or a thrown
 * `AdminFetchError`, which its existing `PageStateBoundary` error branch renders.
 */

export class AdminFetchError extends Error {
  readonly code: ApiErrorCode | "network";

  constructor(code: ApiErrorCode | "network", message: string) {
    super(message);
    this.name = "AdminFetchError";
    this.code = code;
  }
}

/**
 * Set by the admin layout so a 403 can render the not-on-allowlist state in
 * place, rather than this module reaching into React from outside it.
 */
let onForbidden: (() => void) | null = null;

export function setForbiddenHandler(handler: (() => void) | null): void {
  onForbidden = handler;
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  // `/login` is where a 401 is *resolved*, so bouncing it back to itself would
  // turn a failed sign-in into a loop. It handles its own errors.
  if (window.location.pathname === "/login") return;
  // A full navigation, not `router.push` — the session cookie has just been
  // cleared server-side and nothing in the cached tree is still valid.
  window.location.assign("/login");
}

export interface AdminFetchOptions {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export async function adminFetch<T>(path: string, options: AdminFetchOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options;

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
      signal,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new AdminFetchError("network", "Could not reach the server.");
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new AdminFetchError("internal", "The server returned an unreadable response.");
  }

  if (envelope.success) return envelope.data;

  const { code, message } = envelope.error;

  if (code === "unauthorized") {
    redirectToLogin();
    throw new AdminFetchError(code, message);
  }

  if (code === "forbidden") {
    onForbidden?.();
    throw new AdminFetchError(code, message);
  }

  throw new AdminFetchError(code, message);
}

export interface AdminMe {
  email: string;
  isAdmin: boolean;
  /**
   * Whether the request rode an unexpired session or re-asked gtwy-node
   * (plan §14.2). Never a token — the JWT stays in the httpOnly cookie.
   */
  authSource: "session_cookie" | "revalidated";
}

/**
 * The refusal this console was given, carried across the one navigation from
 * `/login` to `/unauthorized`.
 *
 * `sessionStorage` rather than a query parameter so the sentence and the address
 * do not end up in history or in a copied link. It is a *message*, never a
 * credential — the JWT is in an httpOnly cookie and is not readable here.
 */
export const DENIAL_KEY = "gtwy_admin_denial";

export interface AdminDenial {
  message: string;
  email: string;
}

export function rememberDenial(denial: AdminDenial): void {
  try {
    window.sessionStorage.setItem(DENIAL_KEY, JSON.stringify(denial));
  } catch {
    // Storage can be unavailable. `/unauthorized` has a fallback sentence.
  }
}

export function recallDenial(): AdminDenial | null {
  try {
    const raw = window.sessionStorage.getItem(DENIAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdminDenial>;
    return typeof parsed?.message === "string" ? { message: parsed.message, email: parsed.email ?? "" } : null;
  } catch {
    return null;
  }
}

/** `POST /api/admin/session` — trade the msg91 handoff token for a session. */
export function createSession(proxyAuthToken: string, signal?: AbortSignal): Promise<{ email: string }> {
  return adminFetch<{ email: string }>("/api/admin/session", {
    method: "POST",
    body: { proxyAuthToken },
    signal,
  });
}

/** `DELETE /api/admin/session` — sign out. */
export function destroySession(): Promise<{ ok: true }> {
  return adminFetch<{ ok: true }>("/api/admin/session", { method: "DELETE" });
}

export function getMe(signal?: AbortSignal): Promise<AdminMe> {
  return adminFetch<AdminMe>("/api/admin/me", { signal });
}
