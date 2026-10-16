"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar, SidebarBody } from "./sidebar";
import { Header } from "./header";
import { ImpersonationBanner } from "./impersonation-banner";
import { HeaderSearchProvider } from "./search-context";
import { setForbiddenHandler } from "@/lib/data/client";

/**
 * 232px dark sidebar + content. Below 769px the sidebar becomes a slide-out
 * drawer, closed by default (§7 — the design does not draw this, so the plan's
 * rule is what is implemented here).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawer, setDrawer] = React.useState(false);
  const [q, setQ] = React.useState("");
  const pathname = usePathname();

  React.useEffect(() => {
    setDrawer(false);
    // The header box is shared chrome but only one page reads it. Clearing on
    // navigation keeps a query typed on `/workspaces` from silently narrowing a
    // later list the operator did not type it for.
    setQ("");
  }, [pathname]);

  const search = React.useMemo(() => ({ q, setQ }), [q]);

  // Plan §7: a 403 anywhere under the shell means the operator gate said no —
  // most often because the session went past its revalidation window and
  // gtwy-node declined it on the way back. It is resolved once, here, rather
  // than by every page. The 401 half is handled inside `adminFetch` itself.
  React.useEffect(() => {
    setForbiddenHandler(() => {
      if (window.location.pathname === "/unauthorized") return;
      window.location.assign("/unauthorized");
    });
    return () => setForbiddenHandler(null);
  }, []);

  // The drawer is modal while open: Escape closes it and the page behind it
  // does not scroll.
  React.useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawer(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawer]);

  return (
    <HeaderSearchProvider value={search}>
      <div
        className="min-h-screen grid grid-cols-1 min-[769px]:grid-cols-[232px_minmax(0,1fr)]"
        style={{ background: "var(--color-bg)" }}
      >
        <Sidebar />

        {drawer ? (
          <div className="min-[769px]:hidden">
            <div
              className="fixed inset-0 z-40"
              style={{
                background:
                  "color-mix(in srgb, var(--color-neutral-900) 50%, transparent)",
              }}
              onClick={() => setDrawer(false)}
            />
            <aside className="app-sidebar fixed inset-y-0 left-0 z-50 w-[232px] flex flex-col overflow-y-auto">
              <SidebarBody onNavigate={() => setDrawer(false)} />
            </aside>
          </div>
        ) : null}

        <main className="min-w-0 flex flex-col">
          <Header onOpenDrawer={() => setDrawer(true)} />
          <ImpersonationBanner />
          <div className="flex flex-col gap-[28px] p-[28px] max-sm:p-4">
            {children}
          </div>
        </main>
      </div>
    </HeaderSearchProvider>
  );
}
