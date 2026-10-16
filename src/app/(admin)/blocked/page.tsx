"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { blockOrg, getBlockedRows, unblockOrg, type BlockedRow } from "@/lib/data";
import { AdminFetchError } from "@/lib/data/client";
import { Button } from "@/components/ui/button";
import { Table, TableWrap } from "@/components/ui/table";
import { SectionHeading } from "@/components/data/section-heading";
import { PageStateBoundary, TableShimmer, ErrorState } from "@/components/states";
import { BlockOrgDialog, UnblockOrgDialog } from "@/components/dialogs";
import { Toast } from "@/components/layout/toast";
import { useRemoteData } from "@/hooks/useRemoteData";

export default function BlockedPage() {
  const router = useRouter();
  const [block, setBlock] = React.useState(false);
  // The row whose Unblock button was pressed. `null` keeps the dialog closed,
  // which renders nothing at all.
  const [unblocking, setUnblocking] = React.useState<BlockedRow | null>(null);
  // Bumped after a successful action so the list re-reads `blocked_orgs`.
  const [reload, setReload] = React.useState(0);
  // An org id that does not exist is a typo, not a refused action — worth a
  // red toast rather than just the dialog's own inline message.
  const [notFoundToast, setNotFoundToast] = React.useState<string | null>(null);

  const { data } = useRemoteData<BlockedRow[]>(
    (signal) => getBlockedRows(signal),
    [reload],
    { placeholder: [], isEmpty: (rows) => rows.length === 0 },
  );
  const rows = data ?? [];

  return (
    <>
      <SectionHeading
        kicker="Enforcement"
        title="Blocked organisations"
        count={data?.length}
        actions={
          <Button variant="primary" onClick={() => setBlock(true)}>
            Block an org
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
        A blocked org fails every request at the auth middleware. Unblocking
        takes effect immediately; the Redis cache for that org is purged.
      </p>

      <PageStateBoundary
        loading={<TableShimmer columns={5} rows={3} />}
        empty={
          /* The design's own `blockedEmpty` copy. */
          <div style={{ padding: "40px 0", color: "var(--color-neutral-600)" }}>
            No organisations are blocked.
          </div>
        }
        error={<ErrorState message="The enforcement list could not be loaded." />}
      >
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Workspace</th>
                <th>Reason</th>
                <th>Blocked by</th>
                <th>Blocked at</th>
                <th style={{ textAlign: "right" }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.name}</div>
                    <div
                      style={{ fontSize: 11, color: "var(--color-neutral-600)" }}
                    >
                      org {b.id}
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{b.reason}</td>
                  <td style={{ fontSize: 13 }}>{b.by}</td>
                  <td style={{ fontSize: 12 }}>{b.at}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <Button
                      variant="ghost"
                      style={{ fontSize: 12 }}
                      onClick={() => router.push(`/workspaces/${b.id}`)}
                    >
                      Open
                    </Button>
                    <Button
                      variant="secondary"
                      style={{ fontSize: 12, marginLeft: 8 }}
                      onClick={() => setUnblocking(b)}
                    >
                      Unblock
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      </PageStateBoundary>

      <BlockOrgDialog
        open={block}
        onOpenChange={setBlock}
        onConfirm={async ({ orgId, reason }) => {
          try {
            await blockOrg(orgId, reason);
          } catch (err) {
            if (err instanceof AdminFetchError && err.code === "not_found") {
              setNotFoundToast(err.message);
            }
            throw err;
          }
          setReload((n) => n + 1);
        }}
      />
      <UnblockOrgDialog
        open={unblocking !== null}
        onOpenChange={(open) => {
          if (!open) setUnblocking(null);
        }}
        orgId={unblocking?.id}
        orgName={unblocking?.name}
        onConfirm={async ({ orgId }) => {
          try {
            await unblockOrg(orgId);
          } catch (err) {
            if (err instanceof AdminFetchError && err.code === "not_found") {
              setNotFoundToast(err.message);
            }
            throw err;
          }
          setUnblocking(null);
          setReload((n) => n + 1);
        }}
      />
      <Toast message={notFoundToast} variant="error" onDismiss={() => setNotFoundToast(null)} />
    </>
  );
}
