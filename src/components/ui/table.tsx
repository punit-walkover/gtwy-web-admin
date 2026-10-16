import * as React from "react";
import { cn } from "@/lib/utils";

/** Every table is wrapped — this is how tables survive 375px. */
export function TableWrap({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("table-wrap", className)} {...props} />;
}

export function Table({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("table", className)} {...props} />;
}
