"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The 24h/7d/30d range picker and the Workspaces plan filter.
 *
 * The selection still lives here — a caller that passes no `onChange` gets the
 * same self-contained control it always had. `onChange` is how a page that has
 * been wired to real data makes the toggle a live filter (plan §4.5 Q22); it
 * adds no attribute and no element, so the rendered markup is unchanged either
 * way.
 */
export function Segmented({
  name,
  options,
  defaultValue,
  className,
  onChange,
}: {
  name: string;
  options: string[];
  defaultValue?: string;
  className?: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = React.useState(defaultValue ?? options[0]);
  return (
    <div className={cn("seg", className)}>
      {options.map((opt) => (
        <label className="seg-opt" key={opt}>
          <input
            type="radio"
            name={name}
            checked={value === opt}
            onChange={() => {
              setValue(opt);
              onChange?.(opt);
            }}
          />
          {opt}
        </label>
      ))}
    </div>
  );
}
