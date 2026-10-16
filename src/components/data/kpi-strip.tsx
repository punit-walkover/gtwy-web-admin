import * as React from "react";

/**
 * The KPI strip: a 2px rule top and bottom, 1px separators between cells.
 * `size` follows the design — 34px on Overview, 26px on the detail pages.
 */
export function KpiStrip({
  columns,
  size = "lg",
  children,
}: {
  columns: number;
  size?: "lg" | "sm";
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid max-[768px]:!grid-cols-2 max-[420px]:!grid-cols-1"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`,
        borderTop: "2px solid var(--color-divider)",
        borderBottom: "2px solid var(--color-divider)",
      }}
      data-size={size}
    >
      {children}
    </div>
  );
}

export function KpiCell({
  label,
  value,
  delta,
  deltaColor,
  size = "lg",
}: {
  label: string;
  value: React.ReactNode;
  delta?: string;
  deltaColor?: string;
  size?: "lg" | "sm";
}) {
  const lg = size === "lg";
  return (
    <div
      style={{
        padding: lg ? "18px 20px 18px 0" : "14px 16px 14px 0",
        marginLeft: lg ? 20 : 16,
        borderRight: "1px solid var(--color-divider)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--color-neutral-600)",
        }}
      >
        {label}
      </div>
      <div
        className="tnum"
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 800,
          fontSize: lg ? 34 : 26,
          lineHeight: 1.1,
          margin: lg ? "6px 0 4px" : "4px 0 0",
        }}
      >
        {value}
      </div>
      {delta ? (
        <div style={{ fontSize: 12, color: deltaColor }}>{delta}</div>
      ) : null}
    </div>
  );
}
