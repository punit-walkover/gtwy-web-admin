"use client";

import * as React from "react";
import type { WorkspaceTab } from "@/mocks";

/**
 * The underline tabs on Workspace detail: label + count, active gets accent
 * colour, weight 600 and a 3px accent bottom border pulled over the 2px rule.
 */
export function Tabs({
  tabs,
  value,
  onValueChange,
}: {
  tabs: WorkspaceTab[];
  value: string;
  onValueChange: (label: string) => void;
}) {
  return (
    <div
      className="flex gap-1 overflow-x-auto"
      style={{ borderBottom: "2px solid var(--color-divider)" }}
      role="tablist"
    >
      {tabs.map((t) => {
        const on = t.label === value;
        return (
          <button
            key={t.label}
            role="tab"
            aria-selected={on}
            className="tab whitespace-nowrap"
            onClick={() => onValueChange(t.label)}
            style={{
              padding: "10px 14px",
              fontSize: 13,
              textDecoration: "none",
              color: on ? "var(--color-accent)" : "inherit",
              fontWeight: on ? 600 : 400,
              borderBottom: `3px solid ${on ? "var(--color-accent)" : "transparent"}`,
              marginBottom: -2,
              background: "transparent",
              cursor: "pointer",
            }}
          >
            {t.label}{" "}
            <span style={{ color: "var(--color-neutral-500)", fontSize: 11 }}>
              {t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
