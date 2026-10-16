"use client";

import * as React from "react";

import Link from "next/link";
import {
  getOverview,
  OVERVIEW_RANGES,
  OVERVIEW_RANGE_TITLE,
  type OverviewRange,
} from "@/mocks";
import { useRemoteData } from "@/hooks/useRemoteData";
import { Segmented } from "@/components/ui/segmented";
import { Table, TableWrap } from "@/components/ui/table";
import { KpiStrip, KpiCell } from "@/components/data/kpi-strip";
import { BarMeter } from "@/components/data/bar-meter";
import { SectionHeading } from "@/components/data/section-heading";
import {
  PageStateBoundary,
  TableShimmer,
  KpiShimmer,
  EmptyState,
  ErrorState,
} from "@/components/states";

/** What the loading and error branches render behind; never shown as data. */
const NOTHING: Awaited<ReturnType<typeof getOverview>> = {
  kpis: [],
  failingAgents: [],
  orgRates: [],
};

export default function OverviewPage() {
  // The toggle is a live filter now (plan §4.5 Q22); `24h` is the window the
  // control opens on, so the first fetch and the first paint agree.
  const [range, setRange] = React.useState<OverviewRange>("24h");

  const { state, data } = useRemoteData((signal) => getOverview(range, signal), [range], {
    placeholder: NOTHING,
    // No traffic at all in the window: neither table has a row to show. An
    // agent-free but busy window still fills the org table, so this is `&&`.
    isEmpty: (d) => d.failingAgents.length === 0 && d.orgRates.length === 0,
  });

  const { kpis, failingAgents, orgRates } = data ?? NOTHING;

  return (
    <>
      <SectionHeading
        kicker="Usage & error observability"
        title={OVERVIEW_RANGE_TITLE[range]}
        actions={
          <Segmented
            name="rng"
            options={[...OVERVIEW_RANGES]}
            defaultValue="24h"
            onChange={(value) => setRange(value as OverviewRange)}
          />
        }
      />

      <PageStateBoundary
        state={state}
        loading={
          <>
            <KpiShimmer columns={4} />
            <div className="grid gap-[28px] grid-cols-[repeat(auto-fit,minmax(480px,1fr))] max-[768px]:grid-cols-1">
              <TableShimmer columns={6} rows={7} />
              <TableShimmer columns={3} rows={7} />
            </div>
          </>
        }
        empty={
          <EmptyState
            title="No traffic in the last 24 hours"
            body="Nothing has been called on the platform in this window. Widen the range to see earlier activity."
          />
        }
        error={
          <ErrorState message="Observability data could not be read for the last 24 hours." />
        }
      >
        <KpiStrip columns={4}>
          {kpis.map((k) => (
            <KpiCell
              key={k.label}
              label={k.label}
              value={k.value}
              delta={k.delta}
              deltaColor={k.deltaColor}
            />
          ))}
        </KpiStrip>

        <div className="grid gap-[28px] grid-cols-[repeat(auto-fit,minmax(480px,1fr))] max-[768px]:grid-cols-1">
          <section className="min-w-0">
            <div className="flex justify-between items-baseline mb-2">
              <h4 style={{ margin: 0 }}>Top failing agents</h4>
              <span style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>
                by failed calls · daily_data
              </span>
            </div>
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Workspace</th>
                    <th>Model</th>
                    <th style={{ textAlign: "right" }}>Calls</th>
                    <th style={{ textAlign: "right" }}>Failed</th>
                    <th style={{ width: 160, minWidth: 140, whiteSpace: "nowrap" }}>
                      Error rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {failingAgents.map((a, i) => (
                    <tr key={`${a.name}-${i}`} className="rowlink">
                      <td style={{ fontWeight: 600 }}>
                        <Link
                          href={`/workspaces/${a.wsId}`}
                          className="no-underline"
                          style={{ color: "inherit" }}
                        >
                          {a.name}
                        </Link>
                      </td>
                      <td style={{ color: "var(--color-neutral-700)" }}>{a.ws}</td>
                      <td style={{ fontSize: 12 }}>{a.model}</td>
                      <td className="tnum" style={{ textAlign: "right" }}>
                        {a.calls}
                      </td>
                      <td
                        className="tnum"
                        style={{
                          textAlign: "right",
                          color: "var(--color-accent-700)",
                          fontWeight: 600,
                        }}
                      >
                        {a.failed}
                      </td>
                      <td>
                        <BarMeter pct={a.pct} label={a.rate} tone="error" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          </section>

          <section className="min-w-0">
            <div className="flex justify-between items-baseline mb-2">
              <h4 style={{ margin: 0 }}>Success rate by org</h4>
              <span style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>
                worst first
              </span>
            </div>
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <th>Workspace</th>
                    <th style={{ textAlign: "right" }}>Calls</th>
                    <th style={{ width: 140 }}>Success</th>
                  </tr>
                </thead>
                <tbody>
                  {orgRates.map((o) => (
                    <tr key={o.id} className="rowlink">
                      <td>
                        <Link
                          href={`/workspaces/${o.id}`}
                          className="no-underline"
                          style={{ color: "inherit" }}
                        >
                          <div style={{ fontWeight: 600 }}>{o.name}</div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--color-neutral-600)",
                            }}
                          >
                            org {o.id}
                          </div>
                        </Link>
                      </td>
                      <td className="tnum" style={{ textAlign: "right" }}>
                        {o.calls}
                      </td>
                      <td>
                        <BarMeter
                          pct={Number(o.success)}
                          label={`${o.success}%`}
                          tone="success"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          </section>
        </div>
      </PageStateBoundary>
    </>
  );
}
