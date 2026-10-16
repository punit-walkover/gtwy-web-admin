"use client";

import * as React from "react";
import Link from "next/link";
import { destroySession, recallDenial } from "@/lib/data/client";

/**
 * The 403 state (plan §7, §14.2 §6).
 *
 * Two completely different things arrive here wearing the same status code, and
 * saying which is the whole job of this screen:
 *
 *   - **not an operator** — a real person, correctly signed in, who is not on
 *     the platform's internal list. The fix is an invitation.
 *   - **the platform attached no e-mail to the session** — nobody is being
 *     declined; the operator check cannot run at all. The fix is a platform
 *     change, and telling someone in that state to "ask for access" would send
 *     them chasing the wrong person.
 *
 * The sentence is written server-side (`operatorGate.ts`) so the two cannot
 * drift apart, and it names no gtwy-node internals — no route, no middleware, no
 * claim, no allowlist variable. This page renders it and adds the one thing the
 * server cannot know: what to do next in this console.
 */
export default function UnauthorizedPage() {
  const [denial, setDenial] = React.useState<{ message: string; email: string } | null>(null);
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    setDenial(recallDenial());
    setChecked(true);
  }, []);

  async function signOut() {
    // Best effort: the session may already be cleared, and either way the
    // operator is leaving this screen for the sign-in one.
    try {
      await destroySession();
    } catch {
      // Nothing to recover — the cookie is httpOnly and the server clears it on
      // any refusal anyway.
    }
    window.location.assign("/login");
  }

  const message =
    denial?.message ??
    "This account is not authorised for the operations console. Access is invite-only.";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-12 max-sm:p-6"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="flex flex-col gap-5" style={{ width: "min(520px, 100%)" }}>
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 14,
              height: 14,
              background: "var(--color-accent)",
            }}
          />
          gtwy.ai{" "}
          <span style={{ fontWeight: 400, color: "var(--color-neutral-600)" }}>
            / Admin
          </span>
        </div>

        <div>
          <h6 style={{ color: "var(--color-accent)", marginBottom: 12 }}>
            Access declined
          </h6>
          <h3 style={{ margin: "0 0 6px" }}>You are signed in, but not in.</h3>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-neutral-700)",
              margin: 0,
            }}
          >
            Your sign-in reached the platform. The platform declined this console.
          </p>
        </div>

        {/* `checked` keeps the fallback sentence from flashing before the real one. */}
        {checked ? <div className="callout">{message}</div> : null}

        <div
          className="flex gap-3"
          style={{ borderTop: "1px solid var(--color-divider)", paddingTop: 16 }}
        >
          <button
            className="btn btn-primary"
            type="button"
            onClick={signOut}
            style={{ padding: "12px 14px", fontSize: 14 }}
          >
            Sign in as someone else
          </button>
        </div>

        <div style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>
          Need access? Ask an existing admin to add you to{" "}
          <code>INTERNAL_ALLOWED_EMAILS</code> on gtwy-node. Already added and
          still seeing this? <Link href="/login">Sign in again</Link> — the check
          is re-run every time.
        </div>
      </div>
    </div>
  );
}
