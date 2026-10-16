import * as React from "react";

/**
 * The inline progress bar in tables. Two colourways:
 *  - "error"   track neutral-200, fill accent
 *  - "success" track accent-200,  fill text
 */
export function BarMeter({
  pct,
  label,
  tone = "error",
}: {
  pct: number;
  label: string;
  tone?: "error" | "success";
}) {
  const track = tone === "error" ? "var(--color-neutral-200)" : "var(--color-accent-200)";
  const fill = tone === "error" ? "var(--color-accent)" : "var(--color-text)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 8, background: track }}>
        <div style={{ height: 8, background: fill, width: `${pct}%` }} />
      </div>
      <span
        className="tnum"
        style={{ fontSize: 12, width: 44, textAlign: "right" }}
      >
        {label}
      </span>
    </div>
  );
}

/** The wider usage bar used on the Usage page and the workspace Usage tab. */
export function UsageRow({
  name,
  pct,
  tokens,
  cost,
  tone = "text",
  labelWidth,
  tokensWidth = 90,
  costWidth = 70,
  rowPadding = 8,
}: {
  name: string;
  pct: number;
  tokens: string;
  cost: string;
  tone?: "text" | "accent";
  /** The design sizes these columns differently per page — pass them in. */
  labelWidth: number;
  tokensWidth?: number;
  costWidth?: number;
  rowPadding?: number;
}) {
  return (
    <div
      className="max-sm:!grid-cols-[minmax(0,1fr)_auto]"
      style={{
        display: "grid",
        gridTemplateColumns: `${labelWidth}px minmax(0,1fr) ${tokensWidth}px ${costWidth}px`,
        gap: 12,
        alignItems: "center",
        padding: `${rowPadding}px 0`,
        borderBottom: "1px solid var(--color-divider)",
        fontSize: 13,
      }}
    >
      <span style={{ fontWeight: 600 }}>{name}</span>
      <div style={{ height: 10, background: "var(--color-neutral-200)" }}>
        <div
          style={{
            height: 10,
            background: tone === "accent" ? "var(--color-accent)" : "var(--color-text)",
            width: `${pct}%`,
          }}
        />
      </div>
      <span className="tnum" style={{ textAlign: "right" }}>
        {tokens}
      </span>
      <span className="tnum" style={{ textAlign: "right" }}>
        ${cost}
      </span>
    </div>
  );
}
