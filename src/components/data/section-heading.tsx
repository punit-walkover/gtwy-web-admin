import * as React from "react";
import { cn } from "@/lib/utils";

/** The repeated accent `h6` kicker + `h2` title at the top of each page. */
export function SectionHeading({
  kicker,
  title,
  count,
  actions,
  align = "end",
  children,
}: {
  kicker: React.ReactNode;
  title: React.ReactNode;
  count?: React.ReactNode;
  actions?: React.ReactNode;
  align?: "end" | "start";
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex gap-4 justify-between max-[768px]:flex-col max-[768px]:items-stretch",
        align === "end" ? "min-[769px]:items-end" : "min-[769px]:items-start"
      )}
    >
      <div>
        <h6 style={{ color: "var(--color-accent)" }}>{kicker}</h6>
        <h2 style={{ margin: 0 }}>
          {title}
          {count !== undefined ? (
            <>
              {" "}
              <span style={{ color: "var(--color-neutral-500)", fontWeight: 400 }}>
                {count}
              </span>
            </>
          ) : null}
        </h2>
        {children}
      </div>
      {actions ? (
        <div className="flex gap-2 max-[768px]:flex-wrap">{actions}</div>
      ) : null}
    </div>
  );
}
