// Frozen literals — the exact values the design prototype renders.
// Login-as audit log.
// Generated once from the prototype's own seeded data; never recomputed at runtime.

import type { AuditEntry } from "./types";

export const auditEntries: AuditEntry[] = [
  {
    "time": "2026-09-11 09:41",
    "admin": "ops@walkover.in",
    "action": "login-as",
    "target": "priya@acme.io",
    "ws": "Acme Corp",
    "reason": "Ticket #4821 — reproduce tool timeout",
    "ip": "10.4.1.22",
    "tag": "tag-accent"
  },
  {
    "time": "2026-09-11 09:58",
    "admin": "ops@walkover.in",
    "action": "end session",
    "target": "priya@acme.io",
    "ws": "Acme Corp",
    "reason": "—",
    "ip": "10.4.1.22",
    "tag": "tag-neutral"
  },
  {
    "time": "2026-09-10 16:20",
    "admin": "finance@walkover.in",
    "action": "plan change",
    "target": "org 52930 → gtwy_paid_v2",
    "ws": "Kite Logistics",
    "reason": "Upgrade after invoice paid",
    "ip": "10.4.1.9",
    "tag": "tag-neutral"
  },
  {
    "time": "2026-09-09 17:22",
    "admin": "ops@walkover.in",
    "action": "block org",
    "target": "org 91502",
    "ws": "Tandem Labs",
    "reason": "Credential stuffing against /public/login",
    "ip": "10.4.1.22",
    "tag": "tag-accent"
  },
  {
    "time": "2026-09-08 14:30",
    "admin": "ops@walkover.in",
    "action": "wallet top-up",
    "target": "+1000 cr",
    "ws": "Northwind Retail",
    "reason": "Goodwill credit for outage on 8 Sep",
    "ip": "10.4.1.22",
    "tag": "tag-neutral"
  },
  {
    "time": "2026-09-06 11:05",
    "admin": "dev@walkover.in",
    "action": "login-as",
    "target": "cto@kite.io",
    "ws": "Kite Logistics",
    "reason": "Verify embed config after migration",
    "ip": "10.4.2.3",
    "tag": "tag-accent"
  },
  {
    "time": "2026-09-02 10:00",
    "admin": "finance@walkover.in",
    "action": "plan edit",
    "target": "gtwy_paid_v2",
    "ws": "—",
    "reason": "Allow all services",
    "ip": "10.4.1.9",
    "tag": "tag-neutral"
  }
];
