"use client";

import * as React from "react";

/** Bottom toast. The design auto-dismisses after 2600ms. */
export function Toast({
  message,
  onDismiss,
  variant = "default",
}: {
  message: string | null;
  onDismiss: () => void;
  /** "error" renders on a red background for a refused action. */
  variant?: "default" | "error";
}) {
  React.useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 2600);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;
  return (
    <div
      className="fixed left-1/2 bottom-6 -translate-x-1/2 z-[60] px-4 py-[10px] text-[13px] shadow-lg"
      style={
        variant === "error"
          ? { background: "#b3261e", color: "#fff" }
          : { background: "var(--color-text)", color: "var(--color-bg)" }
      }
      role="status"
    >
      {message}
    </div>
  );
}
