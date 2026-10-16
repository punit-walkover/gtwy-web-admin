"use client";

import * as React from "react";
import { usePageState, type PageState } from "@/hooks/usePageState";
import { Button } from "@/components/ui/button";

/** A shimmer bar. Bars mirror the real layout, never a generic spinner. */
export function Shimmer({
  w,
  h = 14,
  className,
  style,
}: {
  w?: number | string;
  h?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`shimmer block ${className ?? ""}`}
      style={{ width: w ?? "100%", height: h, ...style }}
      aria-hidden
    />
  );
}

/** A shimmering stand-in for a table: same column count, same row count. */
export function TableShimmer({
  columns,
  rows = 6,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <div className="table-wrap">
      <div
        style={{
          borderBottom: "2px solid var(--color-divider)",
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`,
          gap: 8,
          padding: "8px",
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Shimmer key={i} h={9} w="60%" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            borderBottom: "1px solid var(--color-divider)",
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`,
            gap: 8,
            padding: "12px 8px",
          }}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Shimmer key={c} h={12} w={c === 0 ? "80%" : "55%"} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function KpiShimmer({ columns }: { columns: number }) {
  return (
    <div
      className="grid max-[768px]:!grid-cols-2 max-[420px]:!grid-cols-1"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`,
        borderTop: "2px solid var(--color-divider)",
        borderBottom: "2px solid var(--color-divider)",
      }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: "18px 20px 18px 0",
            marginLeft: 20,
            borderRight: "1px solid var(--color-divider)",
          }}
        >
          <Shimmer h={9} w="55%" />
          <Shimmer h={30} w="70%" style={{ marginTop: 8 }} />
          <Shimmer h={10} w="45%" style={{ marginTop: 6 }} />
        </div>
      ))}
    </div>
  );
}

/** Centred block inside the content area. Chrome and section headings stay. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-[64px]">
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 800,
          fontSize: 20,
          lineHeight: 1.12,
          letterSpacing: "-0.015em",
        }}
      >
        {title}
      </div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>
        {body}
      </p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/** Same frame as empty, with the login error callout treatment. */
export function ErrorState({
  title = "Could not load this page",
  message,
}: {
  title?: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-[64px]">
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 800,
          fontSize: 20,
          lineHeight: 1.12,
          letterSpacing: "-0.015em",
        }}
      >
        {title}
      </div>
      <div className="callout text-left">{message}</div>
      <Button variant="secondary">Retry</Button>
    </div>
  );
}

/**
 * Renders the right branch for `?state=`. The chrome around it — sidebar,
 * header, breadcrumb, page kicker and title — is rendered by the page and
 * stays put in every state.
 *
 * A page that loads real data passes `useRemoteData`'s state in (plan §1.3);
 * that hook already lets `?state=` win when it is set, so the two agree. With
 * no `state` prop this behaves exactly as it always has — the query parameter
 * alone, which is what an unconverted page still relies on.
 */
export function PageStateBoundary({
  state,
  loading,
  empty,
  error,
  children,
}: {
  state?: PageState;
  loading: React.ReactNode;
  empty: React.ReactNode;
  error: React.ReactNode;
  children: React.ReactNode;
}) {
  const forced = usePageState();
  const effective = state ?? forced;
  if (effective === "loading") return <>{loading}</>;
  if (effective === "empty") return <>{empty}</>;
  if (effective === "error") return <>{error}</>;
  return <>{children}</>;
}
