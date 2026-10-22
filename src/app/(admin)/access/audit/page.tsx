"use client";

import * as React from "react";
import {
  getAuditEntries,
  AUDIT_ACTIONS,
  AUDIT_ACTION_LABEL,
  AUDIT_PAGE_SIZE,
  type AuditPage,
  type RawAuditAction,
} from "@/mocks";
import { useRemoteData } from "@/hooks/useRemoteData";
import { useDebounced } from "@/components/layout/search-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
 * The board removed "Start login-as session" and `LoginAsDialog`. The filter
 * bar drives the route's three filters (action, admin e-mail, org id) and sits
 * outside the state boundary, so an empty result keeps it on screen to be
 * cleared. The pager below the table steps through the log 25 at a time; any
 * filter change goes back to page 1.
 */

/** What the three non-`ready` branches render against, so the page still types. */
const NONE: AuditPage = { rows: [], total: 0, page: 1, pageSize: AUDIT_PAGE_SIZE };

export default function AuditLogPage() {
  const [action, setAction] = React.useState<RawAuditAction | "">("");
  const [adminEmail, setAdminEmail] = React.useState("");
  const [orgId, setOrgId] = React.useState("");
  // The two text boxes settle before they fetch, like the header search.
  const email = useDebounced(adminEmail.trim());
  const org = useDebounced(orgId.trim());

  // A new filter is a new result set; page 3 of the old one means nothing. The
  // page is stored against the filters it belongs to and reset to 1 during
  // render when they change, so the stale page is never fetched — and clearing
  // the filters cannot bring back a page from before they were set.
  const filterKey = `${action}|${email}|${org}`;
  const [paging, setPaging] = React.useState({ key: filterKey, page: 1 });
  if (paging.key !== filterKey) setPaging({ key: filterKey, page: 1 });
  const page = paging.key === filterKey ? paging.page : 1;
  const setPage = (next: number) => setPaging({ key: filterKey, page: next });

  const { state, data } = useRemoteData<AuditPage>(
    (signal) =>
      getAuditEntries(
        {
          page,
          action: action || undefined,
          adminEmail: email || undefined,
          orgId: org || undefined,
        },
        signal,
      ),
    [page, action, email, org],
    { placeholder: NONE, isEmpty: (p) => p.rows.length === 0 },
  );
  const result = data ?? NONE;
  const rows = result.rows;
  const filtered = action !== "" || email !== "" || org !== "";
  const pageCount = Math.max(1, Math.ceil(result.total / result.pageSize));
  const first = (result.page - 1) * result.pageSize + 1;
  const last = first + rows.length - 1;

  const clear = () => {
    setAction("");
    setAdminEmail("");
    setOrgId("");
  };

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

      <div className="flex gap-2 items-center max-[768px]:flex-wrap">
        <Select
          aria-label="Action"
          value={action}
          onChange={(e) => setAction(e.target.value as RawAuditAction | "")}
          style={{ maxWidth: 220 }}
        >
          <option value="">All actions</option>
          {AUDIT_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {AUDIT_ACTION_LABEL[a]}
            </option>
          ))}
        </Select>
        <Input
          aria-label="Admin e-mail"
          placeholder="Admin e-mail"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          style={{ maxWidth: 260 }}
        />
        <Input
          aria-label="Org id"
          placeholder="Org id"
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          style={{ maxWidth: 160 }}
        />
        {filtered ? (
          <Button variant="ghost" onClick={clear}>
            Clear filters
          </Button>
        ) : null}
      </div>

      <PageStateBoundary
        state={state}
        loading={<TableShimmer columns={7} rows={7} />}
        empty={
          filtered ? (
            <EmptyState
              title="No matching entries"
              body="No audit entry matches these filters."
            />
          ) : (
            <EmptyState
              title="No audit entries"
              body="No admin has acted on a workspace in this window."
            />
          )
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
        <div
          className="flex items-center justify-between gap-3 max-[768px]:flex-wrap"
          style={{ fontSize: 13, color: "var(--color-neutral-700)" }}
        >
          <span className="tnum">
            {first}–{last} of {result.total} · page {result.page} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={result.page <= 1}
              onClick={() => setPage(page - 1)}
            >
              ← Newer
            </Button>
            <Button
              variant="secondary"
              disabled={result.page >= pageCount}
              onClick={() => setPage(page + 1)}
            >
              Older →
            </Button>
          </div>
        </div>
      </PageStateBoundary>
    </>
  );
}
