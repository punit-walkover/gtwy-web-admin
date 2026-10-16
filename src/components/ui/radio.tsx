import * as React from "react";
import { cn } from "@/lib/utils";

export function Radio({
  className,
  children,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { children?: React.ReactNode }) {
  return (
    <label className={cn("radio", className)}>
      <input type="radio" {...props} />
      <span className="dot" />
      {children}
    </label>
  );
}
