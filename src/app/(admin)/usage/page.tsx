"use client";

import * as React from "react";

import { getUsage, type UsageRange } from "@/mocks";
import { useRemoteData } from "@/hooks/useRemoteData";
import { Segmented } from "@/components/ui/segmented";
import { Table, TableWrap } from "@/components/ui/table";
import { UsageRow } from "@/components/data/bar-meter";
import { SectionHeading } from "@/components/data/section-heading";
import {
  PageStateBoundary,
  TableShimmer,
  EmptyState,
  ErrorState,
  Shimmer,
} from "@/components/states";

/** What the loading and error branches render behind; never shown as data. */
const NOTHING: Awaited<ReturnType<typeof getUsage>> = { services: [], models: [] };

export default function UsagePage() {
  // The toggle is a live filter now (plan §4.5 Q22); `30d` is the window the
  // control opens on, so the first fetch and the first paint agree.
  const [range, setRange] = React.useState<UsageRange>("30d");

  const { state, data } = useRemoteData(
    (signal) => getUsage(range, signal),
    [range],
    {
      placeholder: NOTHING,
      isEmpty: (d) => d.services.length === 0 && d.models.length === 0,
    },
  );

  const { services, models } = data ?? NOTHING;

  return (
    <>
      <SectionHeading
        kicker="Platform-wide"
        title="Usage by service & model"
        actions={
          <Segmented
            name="urng"
            options={["7d", "30d", "90d"]}
            defaultValue="30d"
            onChange={(value) => setRange(value as UsageRange)}
          />
        }
      />

      <PageStateBoundary
        state={state}
        loading={
          <div className="grid gap-[28px] grid-cols-[minmax(0,2fr)_minmax(0,3fr)] max-[768px]:grid-cols-1">
            <section>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    padding: "9px 0",
                    borderBottom: "1px solid var(--color-divider)",
                  }}
                >
                  <Shimmer h={12} />
                </div>
              ))}
            </section>
            <TableShimmer columns={7} rows={6} />
          </div>
        }
        empty={
          <EmptyState
            title="No usage in this window"
            body="No service or model recorded traffic in the selected range."
          />
        }
        error={<ErrorState message="Platform usage could not be aggregated." />}
      >
        <div className="grid gap-[28px] grid-cols-[minmax(0,2fr)_minmax(0,3fr)] max-[768px]:grid-cols-1">
          <section>
            <h4 style={{ marginBottom: 8 }}>Services</h4>
            {services.map((u) => (
              <UsageRow
                key={u.name}
                {...u}
                labelWidth={110}
                tokensWidth={80}
                costWidth={80}
                rowPadding={9}
                tone="text"
              />
            ))}
          </section>

          <section>
            <h4 style={{ marginBottom: 8 }}>Models</h4>
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Service</th>
                    <th style={{ textAlign: "right" }}>Calls</th>
                    <th style={{ textAlign: "right" }}>Tokens</th>
                    <th style={{ textAlign: "right" }}>p50 latency</th>
                    <th style={{ textAlign: "right" }}>Success</th>
                    <th style={{ textAlign: "right" }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {/*
                    The row identity is the (model, service) pair, not the model
                    name: real data carries `mistral-medium-latest` under both
                    `mistral` and `openai`. A key is not rendered, so the markup
                    is unchanged.
                  */}
                  {models.map((m) => (
                    <tr key={`${m.service} ${m.name}`}>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td style={{ fontSize: 12 }}>{m.service}</td>
                      <td className="tnum" style={{ textAlign: "right" }}>
                        {m.calls}
                      </td>
                      <td className="tnum" style={{ textAlign: "right" }}>
                        {m.tokens}
                      </td>
                      <td className="tnum" style={{ textAlign: "right" }}>
                        {m.latency}
                      </td>
                      <td
                        className="tnum"
                        style={{ textAlign: "right", color: m.color }}
                      >
                        {m.success}%
                      </td>
                      <td className="tnum" style={{ textAlign: "right" }}>
                        ${m.cost}
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
