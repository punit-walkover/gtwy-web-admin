"use client";

import { adminFetch } from "@/lib/data/client";

/**
 * The four live actions, from the browser (plan §3).
 *
 * Every one is a `POST`/`DELETE` to our own route, which proxies to gtwy-node
 * and writes the audit row. Nothing here talks to gtwy-node, Mongo or Redis
 * directly, and nothing here decides whether the caller is allowed to act —
 * `withAdmin` and gtwy-node's `InternalAuth` each answer that independently.
 *
 * A rejected action throws `AdminFetchError` carrying gtwy-node's own message
 * ("org 123 has no Lago wallet — provision it first"), which the calling dialog
 * shows. 401 and 403 are handled centrally in `client.ts`.
 */

export interface BlockResult {
  orgId: string;
  blocked: boolean;
  /** False when the action succeeded but its audit row could not be appended. */
  auditWritten: boolean;
}

/** `reason` is required — the server refuses a blank one (plan §3, §3.1). */
export function blockOrg(orgId: string, reason: string, signal?: AbortSignal): Promise<BlockResult> {
  return adminFetch<BlockResult>(`/api/admin/orgs/${encodeURIComponent(orgId)}/block`, {
    method: "POST",
    body: { reason },
    signal,
  });
}

export function unblockOrg(orgId: string, signal?: AbortSignal): Promise<BlockResult> {
  return adminFetch<BlockResult>(`/api/admin/orgs/${encodeURIComponent(orgId)}/unblock`, {
    method: "POST",
    signal,
  });
}

export interface InternalOrgResult {
  orgId: string;
  internal: boolean;
  /** Only on add: false when the org was already on the list, so nothing changed. */
  added?: boolean;
  auditWritten: boolean;
}

/**
 * Add an org to `internal_orgs`.
 *
 * The control this feeds lives on the Workspace detail page and belongs to D3
 * (plan §5 item 11, revision 3); the route and this binding ship here because
 * they share the proxy client and the audit writer with block/unblock.
 */
export function addInternalOrg(orgId: string, signal?: AbortSignal): Promise<InternalOrgResult> {
  return adminFetch<InternalOrgResult>("/api/admin/internal-orgs", {
    method: "POST",
    body: { orgId },
    signal,
  });
}

export function removeInternalOrg(orgId: string, signal?: AbortSignal): Promise<InternalOrgResult> {
  return adminFetch<InternalOrgResult>(`/api/admin/internal-orgs/${encodeURIComponent(orgId)}`, {
    method: "DELETE",
    signal,
  });
}
