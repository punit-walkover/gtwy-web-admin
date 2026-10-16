"use client";

import { useRouter } from "next/navigation";
import {
  getPlans,
  getInvoices,
  DEFAULT_INVOICE_LIMIT,
  type Invoice,
  type PlanCard,
} from "@/mocks";
import { useRemoteData } from "@/hooks/useRemoteData";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Table, TableWrap } from "@/components/ui/table";
import { CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/data/section-heading";
import {
  PageStateBoundary,
  TableShimmer,
  EmptyState,
  ErrorState,
  Shimmer,
} from "@/components/states";

/** What the three non-`ready` branches render against, so the page still types. */
const NO_PLANS: PlanCard[] = [];
const NO_INVOICES: Invoice[] = [];

export default function PlansPage() {
  const router = useRouter();

  // Two loads, not one, because the two halves of this page have different
  // sources and must fail apart (plan §7). The catalogue is Mongo and drives the
  // page's own boundary; invoices are Lago-only and drive the section boundary
  // below, so an unreachable Lago costs the table and leaves the cards standing.
  const catalogue = useRemoteData((signal) => getPlans(signal), [], {
    placeholder: NO_PLANS,
    isEmpty: (rows) => rows.length === 0,
  });
  const plans = catalogue.data ?? NO_PLANS;

  const recent = useRemoteData((signal) => getInvoices(DEFAULT_INVOICE_LIMIT, signal), [], {
    placeholder: NO_INVOICES,
  });
  const invoices = recent.data ?? NO_INVOICES;

  return (
    <>
      <SectionHeading
        kicker="billing_plans"
        title="Billing plans"
        actions={<Button variant="primary">New plan</Button>}
      />
      <p
        style={{
          fontSize: 13,
          color: "var(--color-neutral-700)",
          maxWidth: 640,
          margin: "-12px 0 0",
        }}
      >
        Plan catalogue synced to Lago; changes apply on the next billing cycle.
        gtwy-ai reads this collection live. Moving an org between plans happens
        from the workspace&#39;s Billing tab.
      </p>

      <PageStateBoundary
        state={catalogue.state}
        loading={
          <>
            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="card"
                  style={{ gap: 0, padding: 16, border: "1px solid var(--color-divider)" }}
                >
                  <Shimmer h={18} w="55%" />
                  <Shimmer h={11} w="40%" style={{ marginTop: 8 }} />
                  <Shimmer h={28} w="45%" style={{ marginTop: 16 }} />
                  <Shimmer h={12} style={{ marginTop: 16 }} />
                  <Shimmer h={12} w="80%" style={{ marginTop: 6 }} />
                  <Shimmer h={12} w="70%" style={{ marginTop: 6 }} />
                </div>
              ))}
            </div>
            <TableShimmer columns={5} rows={6} />
          </>
        }
        empty={
          <EmptyState
            title="No billing plans"
            body="The billing_plans collection is empty; nothing can be assigned to an organisation."
          />
        }
        error={<ErrorState message="The plan catalogue could not be read from billing_plans." />}
      >
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
          {plans.map((p) => (
            <div
              key={p.plan_code}
              className="card"
              style={{
                gap: 0,
                padding: 0,
                border: "1px solid var(--color-divider)",
              }}
            >
              <div className="flex justify-between items-start" style={{ padding: "16px 16px 0" }}>
                <div>
                  <CardTitle>{p.display_name}</CardTitle>
                  <div
                    className="mono"
                    style={{ fontSize: 12, color: "var(--color-neutral-600)" }}
                  >
                    {p.plan_code}
                  </div>
                </div>
                <Tag variant={p.statusTag}>{p.statusLabel}</Tag>
              </div>
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--color-divider)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800,
                    fontSize: 30,
                    lineHeight: 1,
                  }}
                >
                  {p.price}
                </span>{" "}
                <span style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>
                  {p.per}
                </span>
              </div>
              <div
                className="flex flex-col flex-1"
                style={{
                  padding: "12px 16px",
                  gap: 6,
                  fontSize: 13,
                  color: "var(--color-neutral-700)",
                }}
              >
                {p.features.map((f) => (
                  <div key={f}>{f}</div>
                ))}
              </div>
              <div className="flex gap-2" style={{ padding: "0 16px 12px" }}>
                <Button
                  variant="secondary"
                  style={{ flex: 1, justifyContent: "flex-start" }}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  style={{ flex: 1, justifyContent: "flex-start" }}
                >
                  Duplicate
                </Button>
              </div>
              <div
                style={{
                  padding: "10px 16px",
                  borderTop: "1px solid var(--color-divider)",
                  fontSize: 12,
                  color: "var(--color-neutral-600)",
                }}
              >
                {p.orgs} organisations · {p.mrr} MRR
              </div>
            </div>
          ))}
        </div>

        <section>
          <h4 style={{ marginBottom: 8 }}>Recent invoices</h4>
          <PageStateBoundary
            state={recent.state}
            loading={<TableShimmer columns={5} rows={6} />}
            // Unreachable while the catalogue is the outer boundary's source:
            // `?state=empty` is answered above. Zero invoices is not an empty
            // state here — the table renders its header with no rows, exactly as
            // it did before this page went live.
            empty={
              <EmptyState
                title="No invoices"
                body="Lago has issued no invoices for this environment yet."
              />
            }
            error={<ErrorState message="Recent invoices could not be read from Lago." />}
          >
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Organisation</th>
                    <th>Period</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((i) => (
                    <tr
                      key={i.no}
                      className="rowlink"
                      // The prototype matched the rendered org *name* against
                      // the workspace list to find an id. Live rows carry
                      // Lago's `customer.external_id`, which is that id, so the
                      // row navigates straight to it — same click, same target,
                      // no lookup that a paginated workspace list can miss.
                      onClick={() => {
                        if (i.orgId) router.push(`/workspaces/${i.orgId}`);
                      }}
                    >
                      <td className="mono" style={{ fontSize: 12 }}>
                        {i.no}
                      </td>
                      <td style={{ fontWeight: 600 }}>{i.org}</td>
                      <td style={{ fontSize: 13 }}>{i.period}</td>
                      <td className="tnum" style={{ textAlign: "right" }}>
                        {i.amount}
                      </td>
                      <td>
                        <Tag variant={i.tag}>{i.status}</Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          </PageStateBoundary>
        </section>
      </PageStateBoundary>
    </>
  );
}
