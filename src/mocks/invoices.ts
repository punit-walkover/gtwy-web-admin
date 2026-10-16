// Frozen literals — the exact values the design prototype renders.
// Recent invoices.
// Generated once from the prototype's own seeded data; never recomputed at runtime.

import type { Invoice } from "./types";

export const invoices: Invoice[] = [
  {
    "no": "INV-2026-0912",
    "org": "Acme Corp",
    "period": "Aug 2026",
    "amount": "$4,698",
    "status": "Paid",
    "tag": "tag-neutral"
  },
  {
    "no": "INV-2026-0911",
    "org": "Northwind Retail",
    "period": "Aug 2026",
    "amount": "$3,376",
    "status": "Paid",
    "tag": "tag-neutral"
  },
  {
    "no": "INV-2026-0910",
    "org": "Kite Logistics",
    "period": "Aug 2026",
    "amount": "$1,842",
    "status": "Paid",
    "tag": "tag-neutral"
  },
  {
    "no": "INV-2026-0909",
    "org": "Bluefin Capital",
    "period": "Aug 2026",
    "amount": "$1,473",
    "status": "Pending",
    "tag": "tag-outline"
  },
  {
    "no": "INV-2026-0908",
    "org": "Orbit Media",
    "period": "Aug 2026",
    "amount": "$48",
    "status": "Failed",
    "tag": "tag-accent"
  },
  {
    "no": "INV-2026-0907",
    "org": "Helix Health",
    "period": "Aug 2026",
    "amount": "$1,124",
    "status": "Paid",
    "tag": "tag-neutral"
  }
];
