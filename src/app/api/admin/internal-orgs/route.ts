import type { NextRequest } from "next/server";

import { assertOrgId, readJsonBody, optionalString } from "@/lib/api/body";
import { ok } from "@/lib/api/envelope";
import { orgNameOrNull, orgNamesOrEmpty } from "@/lib/api/orgName";
import { withAdmin, type AdminContext } from "@/lib/auth/withAdmin";
import { writeAudit } from "@/lib/audit/writeAudit";
import { addInternalOrg } from "@/lib/clients/gtwy";
import type { RawInternalOrg } from "@/lib/mappers/blocked";
import { isOrgInternal, listInternalOrgs } from "@/lib/queries/internalOrgs";

/**
 * `GET` and `POST /api/admin/internal-orgs` (plan §5 item 11, §3).
 *
 * No page in this console renders either one yet. The board placed the
 * add/remove control on the Workspace detail page, so its UI belongs to D3
 * (LAB-256) and these routes are the contract D3 consumes — `GET` read once for
 * membership, `POST` behind the confirmation dialog.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Mongo `internal_orgs` directly — see the note in `queries/internalOrgs.ts`. */
export const GET = withAdmin(async (_req: NextRequest) => {
  const docs = await listInternalOrgs();
  const names = await orgNamesOrEmpty();

  const rows: RawInternalOrg[] = docs.map((doc) => ({
    orgId: doc.org_id,
    // The row captured the name when the org was added; msg91 is the live
    // source and wins when it has one, so a renamed org does not read stale.
    name: names.get(doc.org_id) ?? doc.name ?? null,
    addedBy: doc.added_by ?? null,
    addedAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
  }));

  return ok(rows);
});

/**
 * `POST` → `POST {GTWY_API_BASE}/api/internal-orgs`, body `{ org_id }`.
 *
 * Proxied because `internalOrgs.controller.js#addInternalOrg` refuses two cases
 * we could not check ourselves without duplicating its rules: an org msg91 does
 * not know (404) and an org with no Lago wallet (400). Both messages are
 * operator copy written in that controller and are passed through verbatim.
 *
 * **The audit row is written only on 201.** The controller answers **200** with
 * `org … is already internal` when the org is already listed — a success, but a
 * no-op, and `admin_audit_logs` has no TTL, so a row asserting a change that did
 * not happen would be permanent noise. Recorded on LAB-257 and LAB-256.
 */
export const POST = withAdmin(async (req: NextRequest, ctx: AdminContext) => {
  const body = await readJsonBody(req);
  const orgId = assertOrgId((body.orgId ?? body.org_id) as string | undefined);
  // Optional for this action (plan §3.1). The design's confirmation collects no
  // reason, so this is normally null; it is accepted for a caller that has one.
  const reason = optionalString(body, "reason");

  const wasInternal = await isOrgInternal(orgId);

  const { status } = await addInternalOrg(orgId, ctx.jwt);
  const added = status === 201;

  const written = added
    ? (
        await writeAudit({
          admin_email: ctx.email,
          action: "add_internal_org",
          target_type: "org",
          target_id: orgId,
          target_name: await orgNameOrNull(orgId),
          before: { internal: wasInternal },
          after: { internal: true },
          reason,
          ip: ctx.ip,
        })
      ).written
    : false;

  return ok({ orgId, internal: true, added, auditWritten: written });
});
