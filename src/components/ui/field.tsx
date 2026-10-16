import * as React from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  className,
  children,
  ...props
}: { label: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("field", className)} {...props}>
      <label>{label}</label>
      {children}
    </div>
  );
}
