"use client";

import * as React from "react";
import { getPlatformKeys } from "@/mocks";
import { useRemoteData } from "@/hooks/useRemoteData";
import { PlatformKeyDialog } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import { Table, TableWrap } from "@/components/ui/table";
import { SectionHeading } from "@/components/data/section-heading";
import {
  PageStateBoundary,
  TableShimmer,
  EmptyState,
  ErrorState,
} from "@/components/states";

/** What the three non-`ready` branches render against, so the page still types. */
const NONE = { rows: [], missing: "" };

export default function PlatformKeysPage() {
  // `undefined` = closed, `""` = Add key, a service name = Rotate that key.
  const [keyDlg, setKeyDlg] = React.useState<string | undefined>(undefined);

  const { state, data } = useRemoteData(
    (signal) => getPlatformKeys(signal),
    [],
    { placeholder: NONE, isEmpty: (d) => d.rows.length === 0 },
  );
  const { rows, missing } = data ?? NONE;

  return (
    <>
      <SectionHeading
        kicker="platform_apikeys"
        title="Platform provider keys"
        actions={
          <Button variant="primary" disabled title="Coming soon">
            Add key
          </Button>
        }
      />
      <p
        style={{
          fontSize: 13,
          color: "var(--color-neutral-700)",
          maxWidth: 640,
          margin: "-12px 0 0",
        }}
      >
        The sole source of provider keys that wallet-billed traffic runs on.
        Stored encrypted, returned masked. One row per service.
      </p>

      <PageStateBoundary
        state={state}
        loading={<TableShimmer columns={6} rows={5} />}
        empty={
          <EmptyState
            title="No platform keys"
            body="platform_apikeys is empty — all wallet-billed traffic is keyless."
          />
        }
        error={<ErrorState message="Platform provider keys could not be read." />}
      >
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Key</th>
                <th>Plans allowing</th>
                <th style={{ textAlign: "right" }}>Calls · 24h</th>
                <th>Updated</th>
                <th style={{ textAlign: "right" }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((k) => (
                <tr key={k.service}>
                  <td style={{ fontWeight: 600 }}>{k.service}</td>
                  <td className="mono" style={{ fontSize: 12 }}>
                    {k.masked}
                  </td>
                  <td style={{ fontSize: 12 }}>{k.plans}</td>
                  <td className="tnum" style={{ textAlign: "right" }}>
                    {k.calls}
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {k.updated} · {k.by}
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <Button
                      variant="secondary"
                      style={{ fontSize: 12 }}
                      disabled
                      title="Coming soon"
                    >
                      Rotate
                    </Button>
                    <Button
                      variant="ghost"
                      style={{ fontSize: 12, marginLeft: 8 }}
                      disabled
                      title="Coming soon"
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>

        {missing ? (
          <div
            className="callout"
            style={{ padding: "10px 14px" }}
          >
            Plans allow <strong>{missing}</strong> but no platform key is seeded —
            wallet traffic on those services is keyless.
          </div>
        ) : null}
      </PageStateBoundary>

      <PlatformKeyDialog
        open={keyDlg !== undefined}
        onOpenChange={(o) => setKeyDlg(o ? keyDlg : undefined)}
        rotateService={keyDlg || undefined}
      />
    </>
  );
}
