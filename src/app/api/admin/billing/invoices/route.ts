import type { NextRequest } from "next/server";

import { ApiError, ok } from "@/lib/api/envelope";
import { withAdmin } from "@/lib/auth/withAdmin";
import { lagoConfigured, listInvoices } from "@/lib/clients/lago";
import { orgNameMap } from "@/lib/clients/msg91";
import type { RawInvoice } from "@/lib/mappers/billing";

/**
 * `GET /api/admin/billing/invoices?limit=25` → the Recent invoices table
 * (plan §5, page 07).
 *
 * Invoices exist **only in Lago** — `lago.service.js:186 #listInvoices`. Called
 * without `external_customer_id` it answers platform-wide, which is what this
 * page wants; gtwy-node only ever asks per org because its own UI is per org.
 *
 * The filter and the ordering are `lagoBilling.service.js#listRecentInvoices`
 * verbatim: drop zero-amount, `voided` and `draft` invoices, keep Lago's own
 * newest-first order, take the first `limit`. Copying it rather than inventing
 * one keeps this table consistent with the invoices an org sees for itself.
 *
 * Org names come from the msg91 company list (plan §4.1). If msg91 cannot
 * answer, the rows still render as `org <id>` — §7's partial state, never a
 * blank table.
 *
 * Read-only.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Plan §4.5 Q48: 25 where the design does not specify. */
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

function readLimit(req: NextRequest): number {
  const raw = Number(req.nextUrl.searchParams.get("limit"));
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(raw), MAX_LIMIT);
}

/**
 * The start of the window an invoice bills for.
 *
 * Lago puts it on the fee, not the invoice: a subscription fee carries
 * `from_date` (older payloads) or `properties.from_datetime` (newer ones). The
 * list endpoint does not always expand `fees` — `listCreditPackInvoices` has to
 * re-fetch the full invoice for exactly that reason — so this returns `null`
 * when it is absent and the mapper falls back to the issuing date. An invoice
 * issued on the 1st for the previous month then reads one month late; that is
 * the known limit of the list payload, not a guess dressed up as data.
 */
function periodStart(invoice: Record<string, unknown>): string | null {
  const fees = Array.isArray(invoice.fees) ? (invoice.fees as Array<Record<string, unknown>>) : [];

  const starts = fees
    .map((fee) => {
      const properties = fee.properties as { from_datetime?: unknown } | undefined;
      return fee.from_date ?? properties?.from_datetime ?? null;
    })
    .filter((value): value is string => typeof value === "string" && value !== "")
    .sort();

  return starts[0] ?? null;
}

export const GET = withAdmin(async (req: NextRequest) => {
  const limit = readLimit(req);

  // No Lago, no answer. An empty array here would render an empty table, which
  // claims this environment has issued no invoices — a claim we cannot make when
  // the only place an invoice exists is unreachable. The section's error state is
  // the honest branch, and it is the one plan §7 asks for.
  if (!lagoConfigured()) throw new ApiError("upstream_unavailable");

  // Same over-fetch `listRecentInvoices` uses, because the filter below drops
  // rows and a page of exactly `limit` would come back short.
  const perPage = Math.min(Math.max(limit * 4, 40), MAX_LIMIT);
  const raw = await listInvoices({ perPage });

  const kept = raw
    .filter(
      (invoice) =>
        Number(invoice.total_amount_cents) > 0 && invoice.status !== "voided" && invoice.status !== "draft",
    )
    .slice(0, limit);

  // msg91 is an enrichment here, not the source of the table. Its failure costs
  // the name column and nothing else (plan §7).
  const names = await orgNameMap().catch((err) => {
    console.error("[admin-api] org names unavailable for the invoices table", err);
    return new Map<string, string | null>();
  });

  const invoices: RawInvoice[] = kept.map((invoice) => {
    const customer = invoice.customer as { external_id?: unknown } | undefined;
    const orgId = String(customer?.external_id ?? "");

    return {
      number: String(invoice.number ?? invoice.lago_id ?? ""),
      orgId,
      orgName: names.get(orgId) ?? null,
      periodStart: periodStart(invoice),
      issuingDate: typeof invoice.issuing_date === "string" ? invoice.issuing_date : null,
      totalAmountCents: Number(invoice.total_amount_cents) || 0,
      currency: typeof invoice.currency === "string" ? invoice.currency : null,
      paymentStatus: typeof invoice.payment_status === "string" ? invoice.payment_status : null,
    };
  });

  return ok(invoices);
});
