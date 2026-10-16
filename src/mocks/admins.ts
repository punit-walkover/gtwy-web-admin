// Frozen literals — the exact values the design prototype renders.
// Generated once from the prototype's own seeded data; never recomputed at runtime.
//
// The `loginAllowlist` fixture and the hardcoded `adminEmail` that used to head
// this file are **deleted** (plan §14.2 §4). No allowlist ships to the browser:
// the operator list lives only in gtwy-node's `INTERNAL_ALLOWED_EMAILS`, and the
// signed-in address comes from `GET /api/admin/me`.

import type { AdminRow } from "./types";

export const admins: AdminRow[] = [
  {
    "name": "Aman Mehta",
    "email": "ops@walkover.in",
    "role": "Super admin",
    "loginAs": "Allowed",
    "lastActive": "now",
    "status": "Active",
    "invited": false,
    "statusTag": "tag-neutral",
    "laColor": "var(--color-accent-700)"
  },
  {
    "name": "Nikhil Rao",
    "email": "nikhil@walkover.in",
    "role": "Support",
    "loginAs": "Read-only",
    "lastActive": "8 min ago",
    "status": "Active",
    "invited": false,
    "statusTag": "tag-neutral",
    "laColor": "inherit"
  },
  {
    "name": "Rhea Shah",
    "email": "rhea@walkover.in",
    "role": "Support",
    "loginAs": "Read-only",
    "lastActive": "2 h ago",
    "status": "Active",
    "invited": false,
    "statusTag": "tag-neutral",
    "laColor": "inherit"
  },
  {
    "name": "Devika Iyer",
    "email": "finance@walkover.in",
    "role": "Billing",
    "loginAs": "Denied",
    "lastActive": "1 d ago",
    "status": "Active",
    "invited": false,
    "statusTag": "tag-neutral",
    "laColor": "var(--color-neutral-600)"
  },
  {
    "name": "Karan Bose",
    "email": "dev@walkover.in",
    "role": "Engineer",
    "loginAs": "Allowed",
    "lastActive": "3 d ago",
    "status": "Active",
    "invited": false,
    "statusTag": "tag-neutral",
    "laColor": "var(--color-accent-700)"
  },
  {
    "name": "—",
    "email": "sana@walkover.in",
    "role": "Support",
    "loginAs": "Read-only",
    "lastActive": "never",
    "status": "Invited",
    "invited": true,
    "statusTag": "tag-outline",
    "laColor": "inherit"
  }
];
