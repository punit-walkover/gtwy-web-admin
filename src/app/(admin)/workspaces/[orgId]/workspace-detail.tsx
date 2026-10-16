"use client";

import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getWorkspace,
  getWorkspaceDetail,
  getWorkspaceEmbedRows,
  type EmbedRow,
  type WorkspaceDetailView,
  type WorkspaceKpi,
  type WorkspaceTab,
} from "@/mocks";
import { addInternalOrg, blockOrg, removeInternalOrg, unblockOrg } from "@/lib/data";
import { AdminFetchError } from "@/lib/data/client";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Tabs } from "@/components/ui/tabs";
import { KpiStrip, KpiCell } from "@/components/data/kpi-strip";
import { PageStateBoundary, TableShimmer, KpiShimmer, EmptyState, ErrorState } from "@/components/states";
import { WorkspaceTabPanel } from "./tab-panels";
import {
  TopUpDialog,
  ChangePlanDialog,
  BlockOrgDialog,
  UnblockOrgDialog,
  InternalOrgDialog,
} from "@/components/dialogs";
import { useRemoteData } from "@/hooks/useRemoteData";

interface WorkspacePage {
  ws: WorkspaceDetailView;
  detail: { kpis: WorkspaceKpi[]; tabs: WorkspaceTab[] };
  embedRows: EmbedRow[];
}

export function WorkspaceDetail({ orgId }: { orgId: string }) {
  // Bumped after a successful action so the header re-reads `blocked_orgs` and
  // `internal_orgs` — the same pattern the Blocked page uses.
  const [reload, setReload] = React.useState(0);

  const { state, data, error } = useRemoteData<WorkspacePage>(
    async (signal) => {
      const [ws, detail, embedRows] = await Promise.all([
        getWorkspace(orgId, signal),
        getWorkspaceDetail(orgId),
        getWorkspaceEmbedRows(orgId),
      ]);
      return { ws, detail, embedRows };
    },
    [orgId, reload],
  );

  // An org no plane has heard of is the 404 this route always returned; it now
  // arrives as the header route's `not_found` rather than as a miss in a literal.
  if (state === "error" && error instanceof AdminFetchError && error.code === "not_found") {
    notFound();
  }

  const ws = data?.ws;
  const detail = data?.detail;
  const embedRows = data?.embedRows ?? [];

  const [tab, setTab] = React.useState<string | null>(null);
  const tabs = detail?.tabs ?? [];
  const activeTab = tab ?? tabs[0]?.label ?? "";

  const [dialog, setDialog] = React.useState<
    "topup" | "plan" | "block" | "unblock" | "internal" | null
  >(null);

  return (
    <>
      <div className="flex gap-4 justify-between items-start max-[768px]:flex-col">
        <div>
          <h6 style={{ color: "var(--color-accent)" }}>
            <Link
              href="/workspaces"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Workspaces
            </Link>{" "}
            / org {ws?.id ?? orgId}
          </h6>
          <h2 className="flex items-center gap-3 flex-wrap" style={{ margin: 0 }}>
            {ws?.name ?? ""}
            <Tag variant={ws?.planTag ?? "tag-outline"} style={{ fontSize: 12 }}>
              {ws?.plan ?? ""}
            </Tag>
            <Tag variant={ws?.statusTag ?? "tag-neutral"} style={{ fontSize: 12 }}>
              {ws?.status ?? ""}
            </Tag>
            {/* The internal-org section's membership half (plan §5 item 11),
                said in the design's own vocabulary: a tag in the row of tags
                the header already renders. */}
            {ws?.internal ? (
              <Tag variant="tag-outline" style={{ fontSize: 12 }}>
                internal
              </Tag>
            ) : null}
          </h2>
          <div
            style={{
              fontSize: 13,
              color: "var(--color-neutral-700)",
              marginTop: 6,
            }}
          >
            Owner {ws?.owner ?? ""} · created {ws?.created ?? ""} · Lago customer{" "}
            {ws?.lagoId ?? ""}
          </div>
        </div>
        <div className="flex gap-2 max-[768px]:flex-wrap">
          {/* Read-only console (plan §6): both wallet and plan controls stay in
              place, disabled. Block, unblock and the internal-org control are
              the live ones. */}
          <Button variant="secondary" disabled title="Coming soon">
            Top up wallet
          </Button>
          <Button variant="secondary" disabled title="Coming soon">
            Change plan
          </Button>
          <Button
            variant="secondary"
            disabled={!ws}
            onClick={() => setDialog("internal")}
          >
            {ws?.internal ? "Remove from internal orgs" : "Add to internal orgs"}
          </Button>
          {ws?.blocked ? (
            <Button variant="primary" onClick={() => setDialog("unblock")}>
              Unblock org
            </Button>
          ) : (
            <Button
              variant="secondary"
              style={{ color: "var(--color-accent-700)" }}
              disabled={!ws}
              onClick={() => setDialog("block")}
            >
              Block org
            </Button>
          )}
        </div>
      </div>

      <PageStateBoundary
        loading={
          <>
            <KpiShimmer columns={5} />
            <TableShimmer columns={8} rows={6} />
          </>
        }
        empty={
          <EmptyState
            title="Nothing recorded for this workspace"
            body="This organisation has no agents, keys or usage in the selected window."
          />
        }
        error={<ErrorState message={`Workspace org ${orgId} could not be loaded.`} />}
      >
        <KpiStrip columns={5} size="sm">
          {(detail?.kpis ?? []).map((k) => (
            <KpiCell key={k.label} label={k.label} value={k.value} size="sm" />
          ))}
        </KpiStrip>

        <Tabs tabs={tabs} value={activeTab} onValueChange={setTab} />

        {ws ? (
          <WorkspaceTabPanel tab={activeTab} ws={ws} embedRows={embedRows} />
        ) : null}
      </PageStateBoundary>

      {/* Disabled controls still render their dialogs so the design's markup is
          unchanged; neither can be opened. */}
      <TopUpDialog
        open={dialog === "topup"}
        onOpenChange={(o) => setDialog(o ? "topup" : null)}
        wsName={ws?.name ?? ""}
        wallet={ws?.wallet ?? 0}
      />
      <ChangePlanDialog
        open={dialog === "plan"}
        onOpenChange={(o) => setDialog(o ? "plan" : null)}
        wsName={ws?.name ?? ""}
        currentPlan={ws?.planCode ?? ""}
      />
      {/* On this screen the org is already known, so the design hides the
          org_id field and names the workspace in the body copy. */}
      <BlockOrgDialog
        open={dialog === "block"}
        onOpenChange={(o) => setDialog(o ? "block" : null)}
        orgName={ws?.name}
        orgId={orgId}
        needsPick={false}
        onConfirm={async ({ reason }) => {
          await blockOrg(orgId, reason);
          setReload((n) => n + 1);
        }}
      />
      <UnblockOrgDialog
        open={dialog === "unblock"}
        onOpenChange={(o) => setDialog(o ? "unblock" : null)}
        orgId={orgId}
        orgName={ws?.name}
        onConfirm={async () => {
          await unblockOrg(orgId);
          setReload((n) => n + 1);
        }}
      />
      <InternalOrgDialog
        open={dialog === "internal"}
        onOpenChange={(o) => setDialog(o ? "internal" : null)}
        orgId={orgId}
        orgName={ws?.name}
        internal={ws?.internal ?? false}
        onConfirm={async () => {
          if (ws?.internal) await removeInternalOrg(orgId);
          else await addInternalOrg(orgId);
          setReload((n) => n + 1);
        }}
      />
    </>
  );
}
