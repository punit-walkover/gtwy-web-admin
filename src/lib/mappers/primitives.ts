import type { Plan, TagVariant } from "@/mocks/types";

/**
 * The presentation vocabulary of the design, in one place.
 *
 * Plan §1.3 splits the two halves deliberately: API routes return **raw** values
 * — numbers, ISO-8601 dates, enum codes — and this layer turns them into the
 * exact strings `src/mocks/types.ts` declares. `"17.9k"`, `"tag-accent"` and
 * `"var(--color-accent-700)"` are produced here and nowhere else.
 *
 * Every rule below was derived from the frozen fixtures under `src/mocks/`, and
 * `tests/mappers.test.ts` re-derives each one from those same fixtures — so a
 * mapper that drifts from the design fails the build rather than the eye.
 *
 * Where a threshold sits between two observed values the fixtures only bound it;
 * the bounds are recorded on each function so a later page task can tighten it
 * against real data instead of re-guessing.
 */

export const ACCENT = "var(--color-accent-700)";
export const NEUTRAL_700 = "var(--color-neutral-700)";
export const INHERIT = "inherit";

/** The IST rule, plan §4.5 Q26 — matching `daily_data_aggregate`'s own timezone. */
export const DISPLAY_TZ = "Asia/Kolkata";

// ---------------------------------------------------------------- numbers ---

/**
 * The design's own compact form, re-exported so mappers have one import.
 * Note its M branch carries two decimals (`1.20M`) while `compact1` carries one
 * (`1.2M`); both appear in the design, on different fields.
 */
export { fmt } from "@/lib/format";

/** `2255 → "2,255"`. Agent calls, KB chunks, wallet balances, platform-key calls. */
export function thousands(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/** `36_400_000 → "36.4M"`, `91_400 → "91.4k"`. Token counts and usage-page calls. */
export function compact1(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

/** `4.5531 → "4.6"`. Error rates and success rates. */
export function oneDecimal(n: number): string {
  return n.toFixed(1);
}

/** `85.35 → "85.35"`. Costs, rendered without a currency symbol by the design. */
export function twoDecimal(n: number): string {
  return n.toFixed(2);
}

/** `85.35 → "$85.35"`. Spend columns that carry the symbol. */
export function usd(n: number): string {
  return "$" + n.toFixed(2);
}

/** `4698 → "$4,698"`. Invoice amounts — whole dollars, grouped. */
export function usdWhole(n: number): string {
  return "$" + thousands(n);
}

/** `1350 → "1.35 s"`. Latency, which the design always renders in seconds. */
export function seconds(ms: number): string {
  return (ms / 1000).toFixed(2) + " s";
}

// ------------------------------------------------------------------- tags ---

/**
 * PAID → accent, FREE → neutral.
 *
 * `"—"` is the plan §7 degradation — Lago unreachable, so the tier is unknown
 * rather than free. It takes `tag-outline`, the design's own variant for a state
 * that is neither of the two: the Billing plans page uses it for *Grandfathered*
 * and the invoice list for *Pending*.
 */
export function planTag(plan: Plan | typeof EM_DASH): TagVariant {
  if (plan === "PAID") return "tag-accent";
  if (plan === "FREE") return "tag-neutral";
  return "tag-outline";
}

/** active → neutral, blocked → accent. */
export function orgStatusTag(status: "active" | "blocked"): TagVariant {
  return status === "blocked" ? "tag-accent" : "tag-neutral";
}

/**
 * An agent is "degraded" above 8% error.
 *
 * Fixtures: healthy spans errN 0–8.0, degraded spans 8.1–13.9, and the Overview
 * page's own copy reads "3 agents above 8% error". The boundary value 8.0 is
 * healthy, so the test is strictly greater than.
 */
export function agentHealth(errorRatePct: number): {
  status: "healthy" | "degraded";
  statusTag: TagVariant;
} {
  return errorRatePct > 8
    ? { status: "degraded", statusTag: "tag-accent" }
    : { status: "healthy", statusTag: "tag-neutral" };
}

/**
 * Error rate is called out from 5% up.
 *
 * Fixtures bound this to (4.55, 5.46]; 5 is the value inside that band the
 * design's own copy uses elsewhere.
 */
export function errColor(errorRatePct: number): string {
  return errorRatePct >= 5 ? ACCENT : INHERIT;
}

/**
 * Success rate is called out below 93%.
 *
 * Fixtures bound this to (92.9, 93.4]; 93 is the round value inside that band.
 */
export function successColor(successRatePct: number): string {
  return successRatePct < 93 ? ACCENT : INHERIT;
}

/** Ledger rows: a debit is neutral, credit added to the wallet is accented. */
export function ledgerStyle(event: "debit" | "topup" | "grant"): { tag: TagVariant; color: string } {
  return event === "debit"
    ? { tag: "tag-neutral", color: INHERIT }
    : { tag: "tag-accent", color: ACCENT };
}

/** Lago invoice payment status → the design's three tags. */
export function invoiceTag(status: "Paid" | "Pending" | "Failed"): TagVariant {
  if (status === "Paid") return "tag-neutral";
  if (status === "Pending") return "tag-outline";
  return "tag-accent";
}

/** `billing_plans.status` — 1 is live, 0 is grandfathered. */
export function planStatus(status: 0 | 1): { statusTag: TagVariant; statusLabel: string } {
  return status === 1
    ? { statusTag: "tag-accent", statusLabel: "Live" }
    : { statusTag: "tag-outline", statusLabel: "Grandfathered" };
}

// ------------------------------------------------------------------- time ---

function istParts(value: Date | string): Record<string, string> {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: DISPLAY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  return Object.fromEntries(parts.map((p) => [p.type, p.value]));
}

/** `"2026-03-10"`, in IST. The design's date-only columns. */
export function istDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const p = istParts(value);
  return `${p.year}-${p.month}-${p.day}`;
}

/** `"2026-09-11 09:41"`, in IST. Audit times and ledger timestamps. */
export function istDateTime(value: Date | string | null | undefined): string {
  if (!value) return "";
  const p = istParts(value);
  // `hour12: false` renders midnight as "24" in some ICU builds.
  const hour = p.hour === "24" ? "00" : p.hour;
  return `${p.year}-${p.month}-${p.day} ${hour}:${p.minute}`;
}

/**
 * `"now"` · `"8 min ago"` · `"12h ago"` · `"18d ago"` — the design's relative
 * form, used for "Last active", "Updated" and "Wallet synced".
 */
export function relative(value: Date | string | null | undefined, now: Date = new Date()): string {
  if (!value) return "never";
  const then = value instanceof Date ? value : new Date(value);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (!Number.isFinite(seconds)) return "never";
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** The design renders an absent value as an em dash, never as an empty cell. */
export const EM_DASH = "—";

export function orDash(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return EM_DASH;
  return String(value);
}

/** Plan §4.1: an org whose name msg91 could not supply renders as `org <id>`. */
export function orgLabel(orgId: string, name: string | null | undefined): string {
  return name && name !== "" ? name : `org ${orgId}`;
}
