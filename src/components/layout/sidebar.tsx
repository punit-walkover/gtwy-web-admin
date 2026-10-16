"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navEntries } from "@/mocks";
import { destroySession, getMe } from "@/lib/data/client";

/**
 * The signed-in address, from `GET /api/admin/me` (plan §14.2 §4 — this
 * replaced the `getAdminEmail()` fixture).
 *
 * A failure is left blank rather than guessed at: `adminFetch` already routes a
 * 401 to `/login` and a 403 to the not-authorised state, so there is no case
 * where this is empty *and* the operator should still be looking at the shell.
 */
function useAdminEmail(): string {
  const [email, setEmail] = React.useState("");

  React.useEffect(() => {
    const controller = new AbortController();
    getMe(controller.signal)
      .then((me) => setEmail(me.email))
      .catch(() => {
        // Handled centrally in `adminFetch`; nothing useful to render here.
      });
    return () => controller.abort();
  }, []);

  return email;
}

function isActive(pathname: string, match: string[]) {
  return match.some(
    (m) => pathname === m || (m !== "/" && pathname.startsWith(m + "/"))
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col flex-1" style={{ padding: "8px 0" }}>
      {navEntries.map((entry, i) =>
        entry.kind === "section" ? (
          <div
            key={`s-${i}`}
            className="nav-section"
            style={{
              fontSize: 10,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              padding: "14px 16px 4px",
            }}
          >
            {entry.label}
          </div>
        ) : (
          <Link
            key={entry.href}
            href={entry.href}
            onClick={onNavigate}
            className="nav-item"
            data-active={isActive(pathname, entry.match)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              fontSize: 14,
              textDecoration: "none",
              fontWeight: isActive(pathname, entry.match) ? 600 : 400,
            }}
          >
            <span
              className="nav-idx tnum"
              style={{ fontSize: 11, width: 16 }}
            >
              {entry.idx}
            </span>
            {entry.label}
          </Link>
        )
      )}
    </nav>
  );
}

export function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const email = useAdminEmail();

  async function signOut(e: React.MouseEvent) {
    e.preventDefault();
    // Best effort: the server clears the cookie on any refusal too, so a failure
    // here still leaves the operator signed out.
    try {
      await destroySession();
    } catch {
      // Nothing to recover — the cookie is httpOnly and unreadable from here.
    }
    window.location.assign("/login");
  }

  return (
    <>
      <div
        style={{
          padding: "18px 16px",
          borderBottomStyle: "solid",
          fontFamily: "var(--font-heading)",
          fontWeight: 800,
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          className="sidebar-mark"
          style={{ display: "inline-block", width: 12, height: 12 }}
        />
        gtwy.ai{" "}
        <span style={{ fontWeight: 400, color: "var(--color-neutral-600)" }}>
          / Admin
        </span>
      </div>

      <SidebarNav onNavigate={onNavigate} />

      <div
        style={{
          padding: "14px 16px",
          borderTopStyle: "solid",
          fontSize: 12,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ fontWeight: 600 }}>{email}</div>
        <div className="sidebar-foot-meta flex justify-between">
          <span>Internal admin</span>
          <Link href="/login" onClick={signOut}>
            Sign out
          </Link>
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside
      className="app-sidebar hidden min-[769px]:flex flex-col sticky top-0 h-screen"
    >
      <SidebarBody />
    </aside>
  );
}
