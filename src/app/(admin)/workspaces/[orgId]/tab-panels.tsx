"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { EmbedRow, WorkspaceDetailView } from "@/mocks";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Table, TableWrap } from "@/components/ui/table";
import {
  Card,
  CardBody,
  CardKicker,
  CardMeta,
  CardTitle,
} from "@/components/ui/card";
import { UsageRow } from "@/components/data/bar-meter";

/**
 * The eight tab panels.
 *
 * Three things changed with D3 and nothing else did — each is a plan §9 gap
 * with no data source behind it, not a design decision:
 *
 *  - **PAuth keys** is gone entirely (gap 1). msg91 cAuth keys have no
 *    collection and gtwy-node only ever validates one, it never lists them.
 *  - **Tools** lost Endpoint and Auth (gap 2 — `apicalls` stores a viaSocket
 *    `script_id`, not a URL or an auth mode) and Calls · 30d and Fail (gap 3 —
 *    no per-tool metrics exist in any plane).
 *  - **Knowledge bases** lost Chunks (gap 4 — Hippocampus, outside scope) and
 *    Used by (gap 5 — confirmed on live data: no agent configuration
 *    references a `collection_id`).
 *
 * **Members kept all five columns.** Gap 6 assumed `getProxyDetails` returns
 * only `id, name, email, meta`; the raw msg91 row carries `role`,
 * `last_login_at` and `created_at` too, so Role, Last active and Joined all
 * have a source. The Login-as button and its dialog are gone on the board's
 * own instruction (plan §6), which is what leaves that column empty.
 */
export function WorkspaceTabPanel({
  tab,
  ws,
  embedRows,
}: {
  tab: string;
  ws: WorkspaceDetailView;
  embedRows: EmbedRow[];
}) {
  const router = useRouter();

  if (tab === "Agents")
    return (
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <th>Agent</th>
              <th>Type</th>
              <th>Service / model</th>
              <th>Version</th>
              <th style={{ textAlign: "right" }}>Calls · 30d</th>
              <th style={{ textAlign: "right" }}>Error</th>
              <th style={{ textAlign: "right" }}>Cost</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ws.agents.map((a) => (
              <tr key={a.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{a.name}</div>
                  <div
                    className="mono"
                    style={{ fontSize: 11, color: "var(--color-neutral-600)" }}
                  >
                    {a.id}
                  </div>
                </td>
                <td>
                  <Tag variant="tag-neutral">{a.type}</Tag>
                </td>
                <td style={{ fontSize: 13 }}>
                  {a.service} · {a.model}
                </td>
                <td style={{ fontSize: 12 }}>{a.version}</td>
                <td className="tnum" style={{ textAlign: "right" }}>
                  {a.calls}
                </td>
                <td className="tnum" style={{ textAlign: "right" }}>
                  {a.err}%
                </td>
                <td className="tnum" style={{ textAlign: "right" }}>
                  ${a.cost}
                </td>
                <td>
                  <Tag variant={a.statusTag}>{a.status}</Tag>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    );

  if (tab === "API keys")
    return (
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Service</th>
              <th>Key</th>
              <th>Scope</th>
              <th style={{ textAlign: "right" }}>Usage / limit</th>
              <th>Reset</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {ws.apikeys.map((k, i) => (
              <tr key={`${k.name}-${i}`}>
                <td style={{ fontWeight: 600 }}>{k.name}</td>
                <td>{k.service}</td>
                <td className="mono" style={{ fontSize: 12 }}>
                  {k.masked}
                </td>
                <td style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
                  {k.scope}
                </td>
                <td className="tnum" style={{ textAlign: "right" }}>
                  {k.usage}
                </td>
                <td style={{ fontSize: 12 }}>{k.reset}</td>
                <td style={{ fontSize: 12 }}>{k.created}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    );

  if (tab === "Knowledge bases")
    return (
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <th>Collection</th>
              <th style={{ textAlign: "right" }}>Resources</th>
              <th>Embedding</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {ws.kbs.map((k, i) => (
              <tr key={`${k.name}-${i}`}>
                <td style={{ fontWeight: 600 }}>{k.name}</td>
                <td style={{ textAlign: "right" }}>{k.resources}</td>
                <td style={{ fontSize: 12 }}>{k.embedding}</td>
                <td style={{ fontSize: 12 }}>{k.updated}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    );

  if (tab === "Tools")
    return (
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <th>Tool</th>
              <th>Attached to</th>
            </tr>
          </thead>
          <tbody>
            {ws.tools.map((t, i) => (
              <tr key={`${t.name}-${i}`}>
                <td style={{ fontWeight: 600 }}>{t.name}</td>
                <td style={{ fontSize: 12 }}>{t.attached}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    );

  if (tab === "Members")
    return (
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Last active</th>
              <th>Joined</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ws.members.map((m, i) => (
              <tr key={`${m.email}-${i}`}>
                <td>
                  <div style={{ fontWeight: 600 }}>{m.name}</div>
                  <div
                    style={{ fontSize: 12, color: "var(--color-neutral-700)" }}
                  >
                    {m.email}
                  </div>
                </td>
                <td>
                  <Tag variant="tag-neutral">{m.role}</Tag>
                </td>
                <td style={{ fontSize: 12 }}>{m.lastActive}</td>
                <td style={{ fontSize: 12 }}>{m.joined}</td>
                {/* Login-as is removed on the board's instruction (plan §6), so
                    the column the design gave it carries nothing. */}
                <td style={{ textAlign: "right" }} />
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    );

  if (tab === "Usage")
    return (
      <>
        <div className="grid gap-[28px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] max-[768px]:grid-cols-1">
          <section>
            <h4 style={{ marginBottom: 8 }}>By service</h4>
            {ws.usageService.map((u) => (
              <UsageRow key={u.name} {...u} labelWidth={120} tone="text" />
            ))}
          </section>
          <section>
            <h4 style={{ marginBottom: 8 }}>By model</h4>
            {ws.usageModel.map((u) => (
              <UsageRow key={u.name} {...u} labelWidth={160} tone="accent" />
            ))}
          </section>
        </div>
        <section>
          <h4 style={{ marginBottom: 8 }}>Daily calls · 30d</h4>
          <div
            className="flex items-end gap-[3px] h-[120px]"
            style={{ borderBottom: "2px solid var(--color-divider)" }}
          >
            {ws.daily.map((d) => (
              <div
                key={d.label}
                title={d.label}
                className="flex-1 flex flex-col justify-end h-full"
              >
                <div
                  style={{ background: "var(--color-accent)", height: `${d.errH}%` }}
                />
                <div
                  style={{ background: "var(--color-text)", height: `${d.okH}%` }}
                />
              </div>
            ))}
          </div>
          <div
            className="flex gap-4 mt-[6px]"
            style={{ fontSize: 11, color: "var(--color-neutral-600)" }}
          >
            <span>
              <span
                className="inline-block w-2 h-2 mr-1"
                style={{ background: "var(--color-text)" }}
              />
              success
            </span>
            <span>
              <span
                className="inline-block w-2 h-2 mr-1"
                style={{ background: "var(--color-accent)" }}
              />
              failed
            </span>
          </div>
        </section>
      </>
    );

  if (tab === "Billing")
    return (
      <>
        <div className="grid gap-[28px] grid-cols-3 max-[768px]:grid-cols-1">
          <Card>
            <CardKicker>Wallet</CardKicker>
            {/* The design prints the raw number here — the grouped form is
                only used in the KPI strip above. */}
            <CardTitle className="tnum" style={{ fontSize: 30 }}>
              {ws.wallet} cr
            </CardTitle>
            <CardBody>
              ≈ ${ws.walletUsd} at LAGO_CREDIT_RATE_USD · shadow balance in Redis
              matches Lago
            </CardBody>
            <CardMeta>Synced {ws.walletSynced}</CardMeta>
            {/* Plan §6: visible, disabled, "Coming soon". */}
            <Button
              variant="secondary"
              style={{ justifyContent: "flex-start" }}
              disabled
              title="Coming soon"
            >
              Sync balance
            </Button>
          </Card>
          <Card>
            <CardKicker>Plan</CardKicker>
            <CardTitle>{ws.planName}</CardTitle>
            <CardBody>
              Lago plan <code>{ws.planCode}</code> · Redis cache{" "}
              <code>{ws.planCache}</code> ·{" "}
              <span style={{ color: ws.driftColor }}>{ws.drift}</span>
            </CardBody>
            <CardMeta>Changed {ws.planChanged}</CardMeta>
            <Button
              variant="secondary"
              style={{ justifyContent: "flex-start" }}
              disabled
              title="Coming soon"
            >
              Change plan
            </Button>
          </Card>
          <Card>
            <CardKicker>Failed debits</CardKicker>
            <CardTitle style={{ fontSize: 30 }}>{ws.failedDebits}</CardTitle>
            <CardBody>
              Debits that did not post to Lago. Replay re-posts them in order.
            </CardBody>
            <CardMeta>failed_billing_debits</CardMeta>
            <Button
              variant="secondary"
              style={{ justifyContent: "flex-start" }}
              disabled
              title="Coming soon"
            >
              Replay debits
            </Button>
          </Card>
        </div>
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Event</th>
                <th>Detail</th>
                <th style={{ textAlign: "right" }}>Credits</th>
                <th style={{ textAlign: "right" }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {ws.ledger.map((l, i) => (
                <tr key={`${l.date}-${i}`}>
                  <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>{l.date}</td>
                  <td>
                    <Tag variant={l.tag}>{l.event}</Tag>
                  </td>
                  <td style={{ fontSize: 13 }}>{l.detail}</td>
                  <td
                    className="tnum"
                    style={{ textAlign: "right", color: l.color }}
                  >
                    {l.credits}
                  </td>
                  <td className="tnum" style={{ textAlign: "right" }}>
                    {l.balance}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      </>
    );

  if (tab === "Embeds")
    return (
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <th>Embed</th>
              <th>Folder id</th>
              <th style={{ textAlign: "right" }}>Agents</th>
              <th style={{ textAlign: "right" }}>End users</th>
              <th>Limit</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {embedRows.map((e) => (
              <tr
                key={e.id}
                className="rowlink"
                onClick={() => router.push(`/embeds/${e.id}`)}
              >
                <td style={{ fontWeight: 600 }}>{e.name}</td>
                <td className="mono" style={{ fontSize: 12 }}>
                  {e.id}
                </td>
                <td style={{ textAlign: "right" }}>{e.agents}</td>
                <td style={{ textAlign: "right" }}>{e.users}</td>
                <td style={{ fontSize: 12 }}>{e.limit}</td>
                <td style={{ textAlign: "right" }}>
                  <Button
                    variant="ghost"
                    style={{ fontSize: 12 }}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      router.push(`/embeds/${e.id}`);
                    }}
                  >
                    Manage →
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    );

  return null;
}
