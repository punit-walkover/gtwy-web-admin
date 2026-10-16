"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * The full-bleed accent bar under the header. The design only shows it while a
 * login-as session is active; forms here do not submit, so it is driven by
 * `?impersonating=<target>` in the same spirit as the `?state=` harness.
 */
export function ImpersonationBanner() {
  const params = useSearchParams();
  const target = params.get("impersonating");
  if (!target) return null;
  return (
    <div
      className="flex items-center gap-[14px] px-[28px] py-2 max-sm:px-4 max-sm:flex-wrap"
      style={{
        background: "var(--color-accent)",
        color: "var(--color-bg)",
        fontSize: 13,
      }}
    >
      <strong>Login-as active</strong>
      <span>{target}</span>
      <span style={{ opacity: 0.8 }}>All actions are written to the audit log.</span>
      <Button
        className="ml-auto"
        style={{ color: "var(--color-bg)", borderColor: "var(--color-bg)" }}
      >
        End session
      </Button>
    </div>
  );
}
