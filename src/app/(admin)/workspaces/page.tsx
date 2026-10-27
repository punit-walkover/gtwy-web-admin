"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  applyWorkspacePlans,
  getWorkspacePlans,
  getWorkspaceRows,
  resolveWorkspacePlans,
  type ResolvedPlans,
  type WorkspaceFilter,
  type WorkspaceListPage,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Tag } from "@/components/ui/tag";
import { Table, TableWrap } from "@/components/ui/table";
import { SectionHeading } from "@/components/data/section-heading";
import {
  PageStateBoundary,
  TableShimmer,
  ErrorState,
} from "@/components/states";
import { useRemoteData } from "@/hooks/useRemoteData";
import { useDebounced, useHeaderSearch } from "@/components/layout/search-context";

/** The Segmented labels, in the design's order, mapped to the route's `filter`. */
const FILTER_FOR_LABEL: Record<string, WorkspaceFilter> = {
  All: "all",
  Paid: "paid",
  Free: "free",
};

const NOTHING: WorkspaceListPage = { rows: [], total: 0, page: 1, pageSize: 25 };

export default function WorkspacesPage() {
  const router = useRouter();
  const [filter, setFilter] = React.useState<WorkspaceFilter>("all");
  // The header box, settled — plan §4.5 Q20. Org id and org name only.
  const q = useDebounced(useHeaderSearch().q);

  const { state, data } = useRemoteData<WorkspaceListPage>(
    (signal) => getWorkspaceRows({ filter, q }, signal),
    [filter, q],
    { placeholder: NOTHING, isEmpty: (page) => page.rows.length === 0 },
  );

  // Pages after the first, appended as the sentinel below the table scrolls
  // into view. Reset whenever the first page is re-read (filter or search).
  const [more, setMore] = React.useState<WorkspaceListPage["rows"]>([]);
  const [nextPage, setNextPage] = React.useState(2);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [moreError, setMoreError] = React.useState(false);
  React.useEffect(() => {
    setMore([]);
    setNextPage(2);
    setMoreError(false);
  }, [data]);

  const loaded = React.useMemo(() => [...(data?.rows ?? []), ...more], [data, more]);
  const hasMore = state === "ready" && !!data && loaded.length < data.total;

  // The "all" list arrives before Lago has answered, with `plan: null`. Each
  // batch of such rows asks for its plans once; answers are kept across filter
  // and search changes, since an org's plan does not depend on either.
  const [plans, setPlans] = React.useState<ResolvedPlans>({});
  const asked = React.useRef(new Set<string>());
  React.useEffect(() => {
    const orgIds = loaded
      .filter((w) => w.plan === null && !asked.current.has(w.id))
      .map((w) => w.id);
    if (orgIds.length === 0) return;
    for (const id of orgIds) asked.current.add(id);
    getWorkspacePlans(orgIds)
      .catch(() => null)
      .then((raw) => setPlans((prev) => ({ ...prev, ...resolveWorkspacePlans(orgIds, raw) })));
  }, [loaded]);

  const rows = React.useMemo(() => applyWorkspacePlans(loaded, plans), [loaded, plans]);

  const loadMore = React.useCallback(async () => {
    if (!hasMore || loadingMore || moreError) return;
    setLoadingMore(true);
    try {
      const page = await getWorkspaceRows({
        page: nextPage,
        pageSize: data?.pageSize,
        filter,
        q,
      });
      setMore((prev) => [...prev, ...page.rows]);
      setNextPage((n) => n + 1);
      if (page.rows.length === 0) setMoreError(true);
    } catch {
      setMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, moreError, nextPage, data?.pageSize, filter, q]);

  const sentinel = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <>
      <SectionHeading
        kicker="Organisations"
        title="Workspaces"
        count={data?.total}
        actions={
          <>
            <Segmented
              name="wsf"
              options={["All", "Paid", "Free"]}
              onChange={(label) => setFilter(FILTER_FOR_LABEL[label] ?? "all")}
            />
            <Button variant="secondary">Export CSV</Button>
          </>
        }
      />

      <PageStateBoundary
        state={state}
        loading={<TableShimmer columns={5} rows={8} />}
        empty={
          /* The design's own empty branch, driven by the header search box. */
          <div
            style={{
              padding: "40px 0",
              borderBottom: "2px solid var(--color-divider)",
              color: "var(--color-neutral-600)",
            }}
          >
            No workspace matches “acme-holdings”. Search matches name, org id and
            member e-mail.
          </div>
        }
        error={<ErrorState message="The workspace list could not be loaded." />}
      >
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Workspace</th>
                <th>Owner</th>
                <th>Plan</th>
                <th style={{ textAlign: "right" }}>Agents</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr
                  key={w.id}
                  className="rowlink"
                  onClick={() => router.push(`/workspaces/${w.id}`)}
                >
                  <td>
                    <div style={{ fontWeight: 600 }}>{w.name}</div>
                    <div
                      style={{ fontSize: 11, color: "var(--color-neutral-600)" }}
                    >
                      org {w.id}
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{w.owner}</td>
                  <td>
                    {w.plan === null ? (
                      <span
                        aria-label="Loading plan"
                        style={{ color: "var(--color-neutral-600)" }}
                      >
                        …
                      </span>
                    ) : (
                      <Tag variant={w.planTag}>{w.plan}</Tag>
                    )}
                  </td>
                  <td className="tnum" style={{ textAlign: "right" }}>
                    {w.agents}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Button
                      variant="ghost"
                      style={{ fontSize: 12 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/workspaces/${w.id}`);
                      }}
                    >
                      Open →
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
        <div ref={sentinel} aria-hidden />
        {loadingMore ? <TableShimmer columns={5} rows={3} /> : null}
        {moreError && hasMore ? (
          <div className="flex justify-center py-4">
            <Button variant="secondary" onClick={() => setMoreError(false)}>
              Load more
            </Button>
          </div>
        ) : null}
      </PageStateBoundary>
    </>
  );
}
