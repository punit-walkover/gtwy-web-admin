"use client";

import * as React from "react";
import { getAdmins } from "@/mocks";
import { useRemoteData } from "@/hooks/useRemoteData";
import { Table, TableWrap } from "@/components/ui/table";
import { SectionHeading } from "@/components/data/section-heading";
import {
  PageStateBoundary,
  TableShimmer,
  EmptyState,
  ErrorState,
} from "@/components/states";

/**
 * Admin access (plan §5, page 09).
 *
 * The one page whose design intentionally changed, on the board's explicit
 * instruction: **e-mail and last active only**. Name, Role, Login-as and Status
 * are gone, and so are Invite admin, Remove and Resend invite — none of them has
 * a source. There is no admin record and no invite record anywhere; an admin
 * exists because `INTERNAL_ALLOWED_EMAILS` says so, and that is the whole of it.
 *
 * Everything else — spacing, typography, table chrome, the three state branches
 * — is untouched.
 */

/** What the three non-`ready` branches render against, so the page still types. */
const NONE: Awaited<ReturnType<typeof getAdmins>> = [];

export default function AdminAccessPage() {
  const { state, data } = useRemoteData((signal) => getAdmins(signal), [], {
    placeholder: NONE,
    isEmpty: (rows) => rows.length === 0,
  });
  const rows = data ?? NONE;

  return (
    <>
      <SectionHeading
        kicker="Platform"
        title="Admin access"
        // Unknown while the fetch is in flight — a flash of "0" would read as a
        // real count. Every other state has the true number.
        count={state === "loading" ? undefined : rows.length}
      >
        <p
          style={{
            fontSize: 13,
            color: "var(--color-neutral-700)",
            margin: "6px 0 0",
          }}
        >
          Access is controlled by the INTERNAL_ALLOWED_EMAILS allowlist. Last
          active is the most recent action taken in this console.
        </p>
      </SectionHeading>

      <PageStateBoundary
        state={state}
        loading={<TableShimmer columns={2} rows={6} />}
        empty={
          <EmptyState
            title="No admins on the allowlist"
            body="INTERNAL_ALLOWED_EMAILS is empty — nobody can sign in to this console."
          />
        }
        error={<ErrorState message="The admin allowlist could not be loaded." />}
      >
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Last active</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.email}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{a.email}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{a.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      </PageStateBoundary>
    </>
  );
}
