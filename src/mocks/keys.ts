// Frozen literals — the exact values the design prototype renders.
// Platform provider keys — one row per service.
// Generated once from the prototype's own seeded data; never recomputed at runtime.

import type { PlatformKeyRow } from "./types";

export const platformKeys: PlatformKeyRow[] = [
  {
    "service": "neev_cloud",
    "masked": "nc_…8f2a",
    "updated": "2026-09-01",
    "by": "ops@walkover.in",
    "calls": "36,109",
    "plans": "Free, Paid"
  },
  {
    "service": "open_router",
    "masked": "sk-or-…c91d",
    "updated": "2026-09-01",
    "by": "ops@walkover.in",
    "calls": "12,728",
    "plans": "Free, Paid"
  },
  {
    "service": "openai",
    "masked": "sk-…Q7xk",
    "updated": "2026-08-28",
    "by": "finance@walkover.in",
    "calls": "5,232",
    "plans": "Paid"
  },
  {
    "service": "anthropic",
    "masked": "sk-ant-…m3Lp",
    "updated": "2026-08-28",
    "by": "finance@walkover.in",
    "calls": "37,146",
    "plans": "Paid"
  }
];

export const missingKeys = "groq";
