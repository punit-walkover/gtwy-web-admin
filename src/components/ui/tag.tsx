import * as React from "react";
import { cn } from "@/lib/utils";
import type { TagVariant } from "@/mocks";

export function Tag({
  variant = "tag-neutral",
  className,
  ...props
}: { variant?: TagVariant } & React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("tag", variant, className)} {...props} />;
}
