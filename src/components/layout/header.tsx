"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { breadcrumbs, headerSearchPlaceholder } from "@/mocks";
import { getEmbedName, getWorkspaceName } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Tag } from "@/components/ui/tag";
import { useHeaderSearch } from "./search-context";

/**
 * A detail breadcrumb's name is fetched, not looked up in a literal — the embed
 * one since D5, the workspace one since D3. Both fall back to the id, which is
 * what the crumb already showed for an unknown one, until the name arrives.
 *
 * Neither accessor throws: each answers `null` when it cannot say, so a
 * breadcrumb is never the thing that fails a page.
 */
function useFetchedName(
  id: string | undefined,
  fetchName: (id: string) => Promise<string | null>,
): string | null {
  const [name, setName] = React.useState<string | null>(null);
  const fetchRef = React.useRef(fetchName);
  fetchRef.current = fetchName;

  React.useEffect(() => {
    setName(null);
    if (!id) return;
    let live = true;
    fetchRef.current(id).then((value) => {
      if (live) setName(value);
    });
    return () => {
      live = false;
    };
  }, [id]);

  return name;
}

function useCrumb() {
  const pathname = usePathname();
  const ws = pathname.match(/^\/workspaces\/([^/]+)$/);
  const em = pathname.match(/^\/embeds\/([^/]+)$/);
  const workspaceName = useFetchedName(ws?.[1], getWorkspaceName);
  const embedName = useFetchedName(em?.[1], getEmbedName);

  if (ws) return `Workspaces / ${workspaceName ?? ws[1]}`;
  if (em) return `Embeds / ${embedName ?? em[1]}`;
  return breadcrumbs[pathname] ?? "";
}

export function Header({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const crumb = useCrumb();
  // Live on `/workspaces`, for org id and org name (plan §4.5 Q20). The input is
  // controlled now rather than uncontrolled; it renders exactly the same markup.
  const { q, setQ } = useHeaderSearch();
  return (
    <header
      className="app-header flex items-center gap-4 sticky top-0 z-[5] px-[28px] py-[14px] max-sm:px-4 max-[768px]:flex-wrap"
      style={{ background: "var(--color-bg)" }}
    >
      <button
        type="button"
        className="btn btn-secondary min-[769px]:hidden min-h-[44px] min-w-[44px]"
        aria-label="Open navigation"
        onClick={onOpenDrawer}
      >
        Menu
      </button>
      <div style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>{crumb}</div>
      <div className="ml-auto flex items-center gap-[10px] max-[768px]:w-full max-[768px]:ml-0">
        <Input
          placeholder={headerSearchPlaceholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-[340px] max-[768px]:w-full min-h-[32px] text-[13px]"
        />
        <Tag variant="tag-neutral">prod</Tag>
      </div>
    </header>
  );
}
