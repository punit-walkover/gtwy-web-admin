"use client";

import * as React from "react";
import { getAuditEntries, type AuditPage } from "@/mocks";
import { useRemoteData } from "@/hooks/useRemoteData";
import { Tag } from "@/components/ui/tag";
import { Table, TableWrap } from "@/components/ui/table";
import { SectionHeading } from "@/components/data/section-heading";
import {
  PageStateBoundary,
  TableShimmer,
  EmptyState,
  ErrorState,
} from "@/components/states";

/**
 * Audit log (plan §5, page 10).
 *
 * Mongo `admin_audit_logs`, newest first, 25 a page — the only collection this
 * console creates and the only thing it writes. Every row here was appended by
 * one of the four proxied actions in plan §3 *after* gtwy-node confirmed it, so
 * a row existing means the action really happened.
 *
 * **Read-only, by construction.** There is no update or delete route, and this
 * page offers no control that could reach one. The log is append-only.
 *
 * The one change to the markup is the board's: "Start login-as session" and
 * `LoginAsDialog` are removed. The seven columns, the table chrome and the three
 * state branches are exactly what they were.
 */

/** What the three non-`ready` branches render against, so the page still types. */
const NONE: AuditPage = { rows: [], total: 0, page: 1, pageSize: 25 };

export default function AuditLogPage() {
  const { state, data } = useRemoteData<AuditPage>(
    (signal) => getAuditEntries({}, signal),
    [],
    { placeholder: NONE, isEmpty: (page) => page.rows.length === 0 },
  );
  const rows = (data ?? NONE).rows;

  return (
    <>
      <SectionHeading
        kicker="Login-as"
        title="Audit log"
        // The whole log, not the page — the same rule the Workspaces heading
        // follows. Unknown while the fetch is in flight, because a flash of "0"
        // would read as a real count.
        count={state === "loading" ? undefined : data?.total}
      />

      <PageStateBoundary
        state={state}
        loading={<TableShimmer columns={7} rows={7} />}
        empty={
          <EmptyState
            title="No audit entries"
            body="No admin has acted on a workspace in this window."
          />
        }
        error={<ErrorState message="The audit log could not be read." />}
      >
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Target</th>
                <th>Workspace</th>
                <th>Reason</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a, i) => (
                <tr key={`${a.time}-${i}`}>
                  <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>{a.time}</td>
                  <td style={{ fontSize: 13 }}>{a.admin}</td>
                  <td>
                    <Tag variant={a.tag}>{a.action}</Tag>
                  </td>
                  <td style={{ fontSize: 13 }}>{a.target}</td>
                  <td style={{ fontSize: 13 }}>{a.ws}</td>
                  <td style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
                    {a.reason}
                  </td>
                  <td className="mono" style={{ fontSize: 12 }}>
                    {a.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      </PageStateBoundary>
    </>
  );
}
