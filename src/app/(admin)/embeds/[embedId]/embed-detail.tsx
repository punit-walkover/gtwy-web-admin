"use client";

import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEmbed, getEmbedDetail, type Embed, type EmbedDetailPanel } from "@/lib/data";
import { AdminFetchError } from "@/lib/data/client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableWrap } from "@/components/ui/table";
import { KpiStrip, KpiCell } from "@/components/data/kpi-strip";
import {
  PageStateBoundary,
  KpiShimmer,
  TableShimmer,
  EmptyState,
  ErrorState,
} from "@/components/states";
import { useRemoteData } from "@/hooks/useRemoteData";

interface EmbedPage {
  embed: Embed;
  detail: EmbedDetailPanel;
}

/**
 * The design's own option lists. A folder may store a value outside them —
 * `slide: "full"` exists in production — so the stored value is appended rather
 * than silently rendered as whichever option happens to be first. The control
 * shows what the document holds.
 */
function options(design: string[], stored: string): string[] {
  return design.includes(stored) ? design : [...design, stored];
}

export function EmbedDetail({ embedId }: { embedId: string }) {
  const { state, data, error } = useRemoteData<EmbedPage>(
    async (signal) => {
      const [embed, detail] = await Promise.all([
        getEmbed(embedId, signal),
        getEmbedDetail(embedId),
      ]);
      return { embed, detail };
    },
    [embedId],
    // The design's own empty branch: a folder whose document carries no stored
    // `config` at all, so every key on the panel would be a schema default.
    { isEmpty: ({ detail }) => !detail.hasStoredConfig },
  );

  // An unknown folder is the 404 this route always returned; it now arrives as
  // the API's `not_found` rather than as a miss in a literal.
  if (state === "error" && error instanceof AdminFetchError && error.code === "not_found") {
    notFound();
  }

  const embed = data?.embed;
  const detail = data?.detail;

  return (
    <>
      <div className="flex gap-4 justify-between items-start max-[768px]:flex-col">
        <div>
          <h6 style={{ color: "var(--color-accent)" }}>
            <Link
              href="/embeds"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Embeds
            </Link>{" "}
            / {embed?.ws ?? ""}
          </h6>
          <h2 style={{ margin: 0 }}>{embed?.name ?? ""}</h2>
          <div
            className="mono"
            style={{
              fontSize: 13,
              color: "var(--color-neutral-700)",
              marginTop: 6,
            }}
          >
            folder {embed?.id ?? embedId} · embed_id {embed?.embedId ?? ""}
          </div>
        </div>
        <div className="flex gap-2 max-[768px]:flex-wrap">
          {/* Read-only console (plan §6): both controls stay in place, disabled. */}
          <Button variant="secondary" disabled title="Coming soon">
            Reset to defaults
          </Button>
          <Button variant="primary" disabled title="Coming soon">
            Save config
          </Button>
        </div>
      </div>

      <PageStateBoundary
        state={state}
        loading={
          <>
            <KpiShimmer columns={4} />
            <TableShimmer columns={4} rows={5} />
          </>
        }
        empty={
          <EmptyState
            title="No configuration for this embed"
            body="This folder has no stored config; FolderSchema defaults apply to every key."
          />
        }
        error={<ErrorState message={`Embed ${embedId} could not be loaded.`} />}
      >
        {embed && detail ? (
          <>
            <KpiStrip columns={4} size="sm">
              {detail.kpis.map((k) => (
                <KpiCell key={k.label} label={k.label} value={k.value} size="sm" />
              ))}
            </KpiStrip>

            <div className="grid gap-[28px] grid-cols-[repeat(auto-fit,minmax(420px,1fr))] max-[768px]:grid-cols-1">
              <section className="min-w-0">
                <h4 style={{ marginBottom: 4 }}>Embed config</h4>
                <p style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>
                  FolderSchema.config · defaults apply where a key is absent
                </p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-x-6 gap-y-0">
                  {detail.flagOrder.map((key) => {
                    const on = embed.flags[key];
                    return (
                      <label
                        key={key}
                        className="flex items-center justify-between gap-3 min-w-0 cursor-not-allowed"
                        title="Coming soon"
                        style={{
                          padding: "9px 0",
                          borderBottom: "1px solid var(--color-divider)",
                          fontSize: 13,
                        }}
                      >
                        <span
                          className="mono min-w-0"
                          style={{ fontSize: 12, overflowWrap: "anywhere" }}
                        >
                          {key}
                        </span>
                        {/* Reflects the stored config and cannot be changed (plan §6). */}
                        <span
                          role="switch"
                          aria-checked={on}
                          aria-disabled="true"
                          aria-label={key}
                          className="relative flex-none cursor-not-allowed"
                          style={{
                            width: 34,
                            height: 18,
                            background: on
                              ? "var(--color-accent)"
                              : "var(--color-neutral-400)",
                          }}
                        >
                          <span
                            className="absolute"
                            style={{
                              top: 2,
                              left: on ? 18 : 2,
                              width: 14,
                              height: 14,
                              background: "var(--color-bg)",
                            }}
                          />
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 max-[768px]:grid-cols-1">
                  <Field label="slide">
                    <Select defaultValue={embed.slide}>
                      {options(["right", "left", "bottom"], embed.slide).map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="themeMode">
                    <Select defaultValue={embed.theme}>
                      {options(["light", "dark", "system"], embed.theme).map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="folder_limit / reset">
                    <Input defaultValue={embed.limit} />
                  </Field>
                  <Field
                    label="configureGtwyRedirection"
                    className="col-[1/-1] max-[768px]:col-auto"
                  >
                    <Input defaultValue={embed.redirect} placeholder="https://" />
                  </Field>
                </div>
              </section>

              <section className="flex flex-col gap-5 min-w-0">
                <div>
                  <h4 style={{ marginBottom: 8 }}>Agents in this embed</h4>
                  <TableWrap>
                    <Table>
                      <thead>
                        <tr>
                          <th>Agent</th>
                          <th>Model</th>
                          <th style={{ textAlign: "right" }}>Calls</th>
                          <th style={{ textAlign: "right" }}>Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {embed.agents.map((a) => (
                          <tr key={a.id}>
                            <td style={{ fontWeight: 600 }}>{a.name}</td>
                            <td style={{ fontSize: 12 }}>{a.model}</td>
                            <td style={{ textAlign: "right" }}>{a.calls}</td>
                            <td style={{ textAlign: "right" }}>{a.err}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableWrap>
                </div>
                <div>
                  <h4 style={{ marginBottom: 8 }}>Top end users</h4>
                  <TableWrap>
                    <Table>
                      <thead>
                        <tr>
                          <th>User</th>
                          <th style={{ textAlign: "right" }}>Sessions</th>
                          <th style={{ textAlign: "right" }}>Calls</th>
                          <th>Last seen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {embed.endUsers.map((u) => (
                          <tr key={u.name}>
                            <td style={{ fontSize: 13 }}>{u.name}</td>
                            <td style={{ textAlign: "right" }}>{u.sessions}</td>
                            <td style={{ textAlign: "right" }}>{u.calls}</td>
                            <td style={{ fontSize: 12 }}>{u.last}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableWrap>
                </div>
              </section>
            </div>
          </>
        ) : null}
      </PageStateBoundary>
    </>
  );
}
