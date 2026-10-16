// Frozen literals — the exact values the design prototype renders.
// Billing plan catalogue as rendered on the Plans page.
// Generated once from the prototype's own seeded data; never recomputed at runtime.

import type { PlanCard, PlanChoice } from "./types";

export const planCards: PlanCard[] = [
  {
    "plan_code": "gtwy_free",
    "display_name": "Free",
    "price": "$0",
    "per": "/ month",
    "features": [
      "500 signup credits",
      "neev_cloud + 2 open_router models",
      "Community support"
    ],
    "statusTag": "tag-accent",
    "statusLabel": "Live",
    "orgs": 4,
    "mrr": "$304",
    "credit_grant": 500,
    "status": 1,
    "updated": "2026-08-12",
    "updated_by": "ops@walkover.in",
    "servicesSummary": "neev_cloud, open_router (2)"
  },
  {
    "plan_code": "gtwy_paid_v2",
    "display_name": "Paid",
    "price": "Wallet",
    "per": "pay as you go",
    "features": [
      "All services & models",
      "Unlimited agents, RAG + tools",
      "E-mail support"
    ],
    "statusTag": "tag-accent",
    "statusLabel": "Live",
    "orgs": 4,
    "mrr": "$495",
    "credit_grant": 0,
    "status": 1,
    "updated": "2026-09-02",
    "updated_by": "finance@walkover.in",
    "servicesSummary": "All services & models"
  },
  {
    "plan_code": "gtwy_paid_v1",
    "display_name": "Paid (legacy)",
    "price": "$399",
    "per": "/ month",
    "features": [
      "1M requests / month",
      "Closed to new signups",
      "Migrate by Dec 2026"
    ],
    "statusTag": "tag-outline",
    "statusLabel": "Grandfathered",
    "orgs": 0,
    "mrr": "$0",
    "credit_grant": 0,
    "status": 0,
    "updated": "2026-05-20",
    "updated_by": "ops@walkover.in",
    "servicesSummary": "openai, anthropic, groq"
  }
];

export const planChoices: PlanChoice[] = [
  {
    "plan_code": "gtwy_free",
    "display_name": "Free",
    "servicesSummary": "neev_cloud, open_router (2)"
  },
  {
    "plan_code": "gtwy_paid_v2",
    "display_name": "Paid",
    "servicesSummary": "All services & models"
  }
];
