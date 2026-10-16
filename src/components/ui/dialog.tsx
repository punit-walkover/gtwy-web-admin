"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

/**
 * The design's dialog shell, on Radix for focus trapping and Escape.
 * At 375px the panel goes full-screen per §7 of the plan.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  body,
  actions,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  body?: React.ReactNode;
  actions: React.ReactNode;
  children?: React.ReactNode;
}) {
  const content = React.useRef<HTMLDivElement>(null);
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="dialog-backdrop z-50 max-sm:p-0 max-sm:place-items-stretch" />
        <div className="dialog-backdrop z-50 max-sm:p-0 max-sm:place-items-stretch pointer-events-none bg-transparent">
          <RadixDialog.Content
            ref={content}
            tabIndex={-1}
            /* Radix focuses the first field on open, which paints a focus ring
               the design does not have. Focus the panel instead: the trap and
               Escape still work, and the dialog looks like the design. */
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              content.current?.focus();
            }}
            className={cn(
              "dialog pointer-events-auto",
              "max-sm:w-full max-sm:h-full max-sm:max-w-none"
            )}
          >
            <RadixDialog.Title className="dialog-title">{title}</RadixDialog.Title>
            {body ? (
              <RadixDialog.Description className="dialog-body">
                {body}
              </RadixDialog.Description>
            ) : null}
            {children}
            <div className="dialog-actions">{actions}</div>
          </RadixDialog.Content>
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
