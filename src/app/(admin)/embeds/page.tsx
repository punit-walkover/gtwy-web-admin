"use client";

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

const NOTHING: EmbedListPage = { rows: [], total: 0, page: 1, pageSize: 25 };

export default function EmbedsPage() {
  const router = useRouter();

  const { state, data } = useRemoteData<EmbedListPage>(
    (signal) => getEmbedRows({}, signal),
    [],
    { placeholder: NOTHING, isEmpty: (page) => page.rows.length === 0 },
  );
  const rows = data?.rows ?? [];

  return (
    <>
      <SectionHeading kicker="GTWY Embed" title="Embeds" count={data?.total} />

      <PageStateBoundary
        state={state}
        loading={<TableShimmer columns={9} rows={5} />}
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
                <th style={{ textAlign: "right" }}>Calls · 30d</th>
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
                  <td style={{ textAlign: "right" }}>{e.calls}</td>
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
      </PageStateBoundary>
    </>
  );
}
