"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getEmbedRows, type EmbedListPage } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Table, TableWrap } from "@/components/ui/table";
import { SectionHeading } from "@/components/data/section-heading";
import {
  PageStateBoundary,
  TableShimmer,
  EmptyState,
  ErrorState,
} from "@/components/states";
import { useRemoteData } from "@/hooks/useRemoteData";
import { useDebounced, useHeaderSearch } from "@/components/layout/search-context";

const NOTHING: EmbedListPage = { rows: [], total: 0, page: 1, pageSize: 25 };

export default function EmbedsPage() {
  const router = useRouter();
  const q = useDebounced(useHeaderSearch().q);

  const { state, data } = useRemoteData<EmbedListPage>(
    (signal) => getEmbedRows({ q }, signal),
    [q],
    { placeholder: NOTHING, isEmpty: (page) => page.rows.length === 0 },
  );

  // Pages after the first, appended as the sentinel below the table scrolls
  // into view. Reset whenever the first page is re-read.
  const [more, setMore] = React.useState<EmbedListPage["rows"]>([]);
  const [nextPage, setNextPage] = React.useState(2);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [moreError, setMoreError] = React.useState(false);
  React.useEffect(() => {
    setMore([]);
    setNextPage(2);
    setMoreError(false);
  }, [data]);

  const rows = React.useMemo(() => [...(data?.rows ?? []), ...more], [data, more]);
  const hasMore = state === "ready" && !!data && rows.length < data.total;

  const loadMore = React.useCallback(async () => {
    if (!hasMore || loadingMore || moreError) return;
    setLoadingMore(true);
    try {
      const page = await getEmbedRows({ page: nextPage, pageSize: data?.pageSize, q });
      setMore((prev) => [...prev, ...page.rows]);
      setNextPage((n) => n + 1);
      if (page.rows.length === 0) setMoreError(true);
    } catch {
      setMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, moreError, nextPage, data?.pageSize, q]);

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
      <SectionHeading kicker="GTWY Embed" title="Embeds" count={data?.total} />

      <PageStateBoundary
        state={state}
        loading={<TableShimmer columns={8} rows={5} />}
        empty={
          <EmptyState
            title="No embeds yet"
            body="No workspace has published a GTWY Embed folder."
          />
        }
        error={<ErrorState message="The embed list could not be loaded." />}
      >
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Embed</th>
                <th>Workspace</th>
                <th>Folder id</th>
                <th style={{ textAlign: "right" }}>Agents</th>
                <th style={{ textAlign: "right" }}>End users</th>
                <th>Usage / limit</th>
                <th>Theme</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr
                  key={e.id}
                  className="rowlink"
                  onClick={() => router.push(`/embeds/${e.id}`)}
                >
                  <td style={{ fontWeight: 600 }}>{e.name}</td>
                  <td style={{ fontSize: 13 }}>{e.ws}</td>
                  <td className="mono" style={{ fontSize: 12 }}>
                    {e.id}
                  </td>
                  <td style={{ textAlign: "right" }}>{e.agents}</td>
                  <td style={{ textAlign: "right" }}>{e.users}</td>
                  <td style={{ fontSize: 12 }}>{e.limit}</td>
                  <td>
                    <Tag variant="tag-neutral">{e.theme}</Tag>
                  </td>
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
        <div ref={sentinel} aria-hidden />
        {loadingMore ? <TableShimmer columns={8} rows={3} /> : null}
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
