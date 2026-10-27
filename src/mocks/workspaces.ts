// Frozen literals — the exact values the design prototype renders.
// The 8 organisations, in the design's order.
// Generated once from the prototype's own seeded data; never recomputed at runtime.

import type { Workspace, WorkspaceKpi, WorkspaceTab, WorkspaceRow, BlockedRow } from "./types";

export const workspaces: Workspace[] = [
  {
    "id": "74145",
    "name": "Acme Corp",
    "owner": "priya@acme.io",
    "plan": "PAID",
    "planTag": "tag-accent",
    "planCode": "gtwy_paid_v2",
    "planName": "Paid",
    "planCache": "gtwy_paid_v2",
    "drift": "in sync",
    "driftColor": "var(--color-neutral-700)",
    "planChanged": "2026-03-10",
    "agents": [
      {
        "id": "brg_5644988",
        "name": "Support triage",
        "type": "chatbot",
        "service": "groq",
        "model": "llama-3.3-70b",
        "version": "v5 · published",
        "calls": "2,255",
        "err": "3.4",
        "errN": 3.4,
        "failed": 77,
        "cost": "1.13",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_5653559",
        "name": "Order lookup",
        "type": "api",
        "service": "neev_cloud",
        "model": "llama-3.1-8b",
        "version": "v8 · published",
        "calls": "10,692",
        "err": "5.7",
        "errN": 5.7,
        "failed": 609,
        "cost": "22.45",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_5667047",
        "name": "Refund policy QA",
        "type": "api",
        "service": "openai",
        "model": "gpt-4o",
        "version": "v2 · published",
        "calls": "9,074",
        "err": "3.3",
        "errN": 3.3,
        "failed": 299,
        "cost": "16.33",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_5679452",
        "name": "Onboarding guide",
        "type": "chatbot",
        "service": "anthropic",
        "model": "claude-sonnet-4",
        "version": "v9 · published",
        "calls": "3,336",
        "err": "0.7",
        "errN": 0.7,
        "failed": 23,
        "cost": "2.00",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_5684773",
        "name": "Invoice extractor",
        "type": "api",
        "service": "anthropic",
        "model": "claude-sonnet-4",
        "version": "v5 · published",
        "calls": "17,212",
        "err": "2.6",
        "errN": 2.6,
        "failed": 448,
        "cost": "36.15",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_5695010",
        "name": "Lead qualifier",
        "type": "api",
        "service": "openai",
        "model": "gpt-4o-mini",
        "version": "v3 · published",
        "calls": "3,233",
        "err": "13.8",
        "errN": 13.8,
        "failed": 446,
        "cost": "5.82",
        "status": "degraded",
        "statusTag": "tag-accent"
      },
      {
        "id": "brg_56a4165",
        "name": "Docs assistant",
        "type": "chatbot",
        "service": "openai",
        "model": "gpt-4o-mini",
        "version": "v4 · published",
        "calls": "2,934",
        "err": "10.8",
        "errN": 10.8,
        "failed": 317,
        "cost": "1.47",
        "status": "degraded",
        "statusTag": "tag-accent"
      }
    ],
    "apikeys": [
      {
        "name": "openai-prod",
        "service": "openai",
        "masked": "sk-…1dd463",
        "scope": "all agents",
        "usage": "$107 / ∞",
        "reset": "monthly",
        "created": "2026-03-17"
      },
      {
        "name": "anthropic-prod-1",
        "service": "anthropic",
        "masked": "sk-…tw780",
        "scope": "2 agents",
        "usage": "$668 / $2351",
        "reset": "monthly",
        "created": "2026-06-23"
      }
    ],
    "kbs": [
      {
        "name": "Help centre",
        "resources": 27,
        "chunks": "8,163",
        "embedding": "text-embedding-3-small",
        "usedBy": "1 agents",
        "updated": "18d ago"
      },
      {
        "name": "Product docs",
        "resources": 11,
        "chunks": "1,877",
        "embedding": "text-embedding-3-small",
        "usedBy": "1 agents",
        "updated": "7d ago"
      },
      {
        "name": "Policies",
        "resources": 6,
        "chunks": "13,369",
        "embedding": "text-embedding-3-small",
        "usedBy": "2 agents",
        "updated": "8d ago"
      }
    ],
    "tools": [
      {
        "name": "get_order",
        "endpoint": "https://api.acme.io/v1/get/order",
        "auth": "Bearer",
        "attached": "3 agents",
        "calls": "3,852",
        "fail": "0.7"
      },
      {
        "name": "create_ticket",
        "endpoint": "https://api.acme.io/v1/create/ticket",
        "auth": "Bearer",
        "attached": "3 agents",
        "calls": "4,540",
        "fail": "5.5"
      },
      {
        "name": "lookup_customer",
        "endpoint": "https://api.acme.io/v1/lookup/customer",
        "auth": "Bearer",
        "attached": "2 agents",
        "calls": "8,707",
        "fail": "5.4"
      }
    ],
    "pauth": [
      {
        "name": "Production",
        "masked": "pauth_…486",
        "by": "priya@acme.io",
        "lastUsed": "50h ago",
        "status": "active",
        "statusTag": "tag-neutral"
      }
    ],
    "members": [
      {
        "name": "Priya Nair",
        "role": "admin",
        "email": "priya@acme.io",
        "lastActive": "12h ago",
        "joined": "2026-08-18"
      },
      {
        "name": "Arjun Mehta",
        "role": "editor",
        "email": "arjun@acme.io",
        "lastActive": "12h ago",
        "joined": "2026-05-17"
      },
      {
        "name": "Sara Lin",
        "role": "viewer",
        "email": "sara@acme.io",
        "lastActive": "37h ago",
        "joined": "2026-06-12"
      },
      {
        "name": "Dev Patel",
        "role": "editor",
        "email": "dev@acme.io",
        "lastActive": "11h ago",
        "joined": "2026-04-11"
      },
      {
        "name": "Ines Costa",
        "role": "admin",
        "email": "ines@acme.io",
        "lastActive": "3h ago",
        "joined": "2026-04-22"
      },
      {
        "name": "Tom Baker",
        "role": "viewer",
        "email": "tom@acme.io",
        "lastActive": "32h ago",
        "joined": "2026-08-16"
      }
    ],
    "usageService": [
      {
        "name": "anthropic",
        "pct": 100,
        "tokens": "36.4M",
        "cost": "38.15"
      },
      {
        "name": "openai",
        "pct": 66,
        "tokens": "24.2M",
        "cost": "23.62"
      },
      {
        "name": "neev_cloud",
        "pct": 51,
        "tokens": "18.6M",
        "cost": "22.45"
      },
      {
        "name": "groq",
        "pct": 10,
        "tokens": "3.7M",
        "cost": "1.13"
      }
    ],
    "usageModel": [
      {
        "name": "claude-sonnet-4",
        "pct": 100,
        "tokens": "36.4M",
        "cost": "38.15"
      },
      {
        "name": "llama-3.1-8b",
        "pct": 51,
        "tokens": "18.6M",
        "cost": "22.45"
      },
      {
        "name": "gpt-4o",
        "pct": 41,
        "tokens": "14.9M",
        "cost": "16.33"
      },
      {
        "name": "gpt-4o-mini",
        "pct": 25,
        "tokens": "9.3M",
        "cost": "7.29"
      },
      {
        "name": "llama-3.3-70b",
        "pct": 10,
        "tokens": "3.7M",
        "cost": "1.13"
      }
    ],
    "daily": [
      {
        "label": "Day 1",
        "okH": 39,
        "errH": 7
      },
      {
        "label": "Day 2",
        "okH": 37,
        "errH": 2
      },
      {
        "label": "Day 3",
        "okH": 76,
        "errH": 8
      },
      {
        "label": "Day 4",
        "okH": 89,
        "errH": 9
      },
      {
        "label": "Day 5",
        "okH": 84,
        "errH": 7
      },
      {
        "label": "Day 6",
        "okH": 70,
        "errH": 5
      },
      {
        "label": "Day 7",
        "okH": 28,
        "errH": 3
      },
      {
        "label": "Day 8",
        "okH": 53,
        "errH": 2
      },
      {
        "label": "Day 9",
        "okH": 51,
        "errH": 6
      },
      {
        "label": "Day 10",
        "okH": 80,
        "errH": 2
      },
      {
        "label": "Day 11",
        "okH": 97,
        "errH": 0
      },
      {
        "label": "Day 12",
        "okH": 50,
        "errH": 5
      },
      {
        "label": "Day 13",
        "okH": 61,
        "errH": 0
      },
      {
        "label": "Day 14",
        "okH": 96,
        "errH": 4
      },
      {
        "label": "Day 15",
        "okH": 86,
        "errH": 5
      },
      {
        "label": "Day 16",
        "okH": 62,
        "errH": 1
      },
      {
        "label": "Day 17",
        "okH": 78,
        "errH": 8
      },
      {
        "label": "Day 18",
        "okH": 48,
        "errH": 0
      },
      {
        "label": "Day 19",
        "okH": 33,
        "errH": 7
      },
      {
        "label": "Day 20",
        "okH": 73,
        "errH": 6
      },
      {
        "label": "Day 21",
        "okH": 89,
        "errH": 2
      },
      {
        "label": "Day 22",
        "okH": 87,
        "errH": 1
      },
      {
        "label": "Day 23",
        "okH": 32,
        "errH": 0
      },
      {
        "label": "Day 24",
        "okH": 26,
        "errH": 5
      },
      {
        "label": "Day 25",
        "okH": 80,
        "errH": 8
      },
      {
        "label": "Day 26",
        "okH": 36,
        "errH": 4
      },
      {
        "label": "Day 27",
        "okH": 31,
        "errH": 2
      },
      {
        "label": "Day 28",
        "okH": 64,
        "errH": 0
      },
      {
        "label": "Day 29",
        "okH": 53,
        "errH": 2
      },
      {
        "label": "Day 30",
        "okH": 44,
        "errH": 7
      }
    ],
    "calls": 48736,
    "failed": 2219,
    "errRate": 4.5531024294156275,
    "spend": 85.35,
    "wallet": 7595,
    "walletUsd": "75.95",
    "walletSynced": "32 min ago",
    "failedDebits": 0,
    "ledger": [
      {
        "date": "2026-09-11 08:12",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "gpt-4o · 1.2M tokens",
        "credits": "-84",
        "color": "inherit",
        "balance": "7,595"
      },
      {
        "date": "2026-09-10 21:40",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "claude-sonnet-4 · 640k tokens",
        "credits": "-58",
        "color": "inherit",
        "balance": "7,632"
      },
      {
        "date": "2026-09-10 09:02",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "llama-3.3-70b · 2.1M tokens",
        "credits": "-30",
        "color": "inherit",
        "balance": "7,669"
      },
      {
        "date": "2026-09-08 14:30",
        "event": "topup",
        "tag": "tag-accent",
        "detail": "Manual top-up · ops@walkover.in",
        "credits": "+1000",
        "color": "var(--color-accent-700)",
        "balance": "7,706"
      },
      {
        "date": "2026-09-01 00:00",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "Monthly rollup · 18 agents",
        "credits": "-291",
        "color": "inherit",
        "balance": "7,743"
      },
      {
        "date": "2026-08-30 11:00",
        "event": "grant",
        "tag": "tag-accent",
        "detail": "Signup grant · credit_grant",
        "credits": "+500",
        "color": "var(--color-accent-700)",
        "balance": "7,780"
      }
    ],
    "status": "active",
    "statusTag": "tag-neutral",
    "blocked": false,
    "blockReason": "",
    "blockedBy": "",
    "blockedAt": "",
    "created": "2025-10-18",
    "lagoId": "cus_74145_167",
    "errColor": "inherit"
  },
  {
    "id": "11643",
    "name": "Northwind Retail",
    "owner": "ops@northwind.co",
    "plan": "PAID",
    "planTag": "tag-accent",
    "planCode": "gtwy_paid_v2",
    "planName": "Paid",
    "planCache": "gtwy_paid_v2",
    "drift": "in sync",
    "driftColor": "var(--color-neutral-700)",
    "planChanged": "2026-03-21",
    "agents": [
      {
        "id": "brg_56o7755",
        "name": "Onboarding guide",
        "type": "chatbot",
        "service": "groq",
        "model": "llama-3.3-70b",
        "version": "v8 · published",
        "calls": "11,811",
        "err": "5.5",
        "errN": 5.5,
        "failed": 650,
        "cost": "20.08",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_56p1465",
        "name": "Invoice extractor",
        "type": "api",
        "service": "anthropic",
        "model": "claude-sonnet-4",
        "version": "v4 · published",
        "calls": "15,908",
        "err": "10.1",
        "errN": 10.1,
        "failed": 1607,
        "cost": "25.45",
        "status": "degraded",
        "statusTag": "tag-accent"
      },
      {
        "id": "brg_56q7092",
        "name": "Lead qualifier",
        "type": "api",
        "service": "neev_cloud",
        "model": "llama-3.1-8b",
        "version": "v2 · published",
        "calls": "11,928",
        "err": "2.1",
        "errN": 2.1,
        "failed": 250,
        "cost": "9.54",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_56r9635",
        "name": "Docs assistant",
        "type": "chatbot",
        "service": "groq",
        "model": "llama-3.3-70b",
        "version": "v5 · published",
        "calls": "5,805",
        "err": "0.3",
        "errN": 0.3,
        "failed": 17,
        "cost": "1.74",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_56s3095",
        "name": "Ticket summariser",
        "type": "api",
        "service": "anthropic",
        "model": "claude-sonnet-4",
        "version": "v7 · published",
        "calls": "3,473",
        "err": "9.2",
        "errN": 9.2,
        "failed": 320,
        "cost": "3.82",
        "status": "degraded",
        "statusTag": "tag-accent"
      },
      {
        "id": "brg_56t8472",
        "name": "SQL helper",
        "type": "api",
        "service": "neev_cloud",
        "model": "llama-3.1-8b",
        "version": "v2 · published",
        "calls": "10,866",
        "err": "5.5",
        "errN": 5.5,
        "failed": 598,
        "cost": "13.04",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_56u1765",
        "name": "Ad copy drafter",
        "type": "chatbot",
        "service": "anthropic",
        "model": "claude-sonnet-4",
        "version": "v2 · published",
        "calls": "16,116",
        "err": "8.0",
        "errN": 8,
        "failed": 1289,
        "cost": "25.79",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_56v3975",
        "name": "Contract reviewer",
        "type": "api",
        "service": "openai",
        "model": "gpt-4o-mini",
        "version": "v1 · published",
        "calls": "7,356",
        "err": "7.1",
        "errN": 7.1,
        "failed": 522,
        "cost": "2.94",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_56w9101",
        "name": "Churn predictor",
        "type": "api",
        "service": "open_router",
        "model": "deepseek-v3",
        "version": "v1 · published",
        "calls": "8,321",
        "err": "7.8",
        "errN": 7.8,
        "failed": 649,
        "cost": "11.65",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_56x2145",
        "name": "Support triage",
        "type": "chatbot",
        "service": "openai",
        "model": "gpt-4o-mini",
        "version": "v7 · published",
        "calls": "7,143",
        "err": "0.4",
        "errN": 0.4,
        "failed": 29,
        "cost": "18.57",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_56y4105",
        "name": "Order lookup",
        "type": "api",
        "service": "openai",
        "model": "gpt-4o",
        "version": "v3 · published",
        "calls": "9,756",
        "err": "3.9",
        "errN": 3.9,
        "failed": 380,
        "cost": "22.44",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_56z8981",
        "name": "Refund policy QA",
        "type": "api",
        "service": "anthropic",
        "model": "claude-sonnet-4",
        "version": "v9 · published",
        "calls": "4,292",
        "err": "8.8",
        "errN": 8.8,
        "failed": 378,
        "cost": "5.58",
        "status": "degraded",
        "statusTag": "tag-accent"
      }
    ],
    "apikeys": [
      {
        "name": "openai-prod",
        "service": "openai",
        "masked": "sk-…2ug953",
        "scope": "all agents",
        "usage": "$540 / ∞",
        "reset": "monthly",
        "created": "2026-01-22"
      },
      {
        "name": "anthropic-prod-1",
        "service": "anthropic",
        "masked": "sk-…5ok112",
        "scope": "1 agents",
        "usage": "$118 / $2302",
        "reset": "monthly",
        "created": "2026-01-14"
      }
    ],
    "kbs": [
      {
        "name": "Help centre",
        "resources": 50,
        "chunks": "11,807",
        "embedding": "text-embedding-3-small",
        "usedBy": "4 agents",
        "updated": "2d ago"
      },
      {
        "name": "Product docs",
        "resources": 34,
        "chunks": "2,164",
        "embedding": "text-embedding-3-small",
        "usedBy": "1 agents",
        "updated": "3d ago"
      }
    ],
    "tools": [
      {
        "name": "get_order",
        "endpoint": "https://api.northwind.co/v1/get/order",
        "auth": "PAuth",
        "attached": "2 agents",
        "calls": "1,007",
        "fail": "2.5"
      },
      {
        "name": "create_ticket",
        "endpoint": "https://api.northwind.co/v1/create/ticket",
        "auth": "PAuth",
        "attached": "4 agents",
        "calls": "4,195",
        "fail": "3.1"
      }
    ],
    "pauth": [
      {
        "name": "Production",
        "masked": "pauth_…5fr",
        "by": "ops@northwind.co",
        "lastUsed": "26h ago",
        "status": "active",
        "statusTag": "tag-neutral"
      },
      {
        "name": "CI / staging",
        "masked": "pauth_…5wr",
        "by": "ops@northwind.co",
        "lastUsed": "33h ago",
        "status": "active",
        "statusTag": "tag-neutral"
      }
    ],
    "members": [
      {
        "name": "Priya Nair",
        "role": "admin",
        "email": "ops@northwind.co",
        "lastActive": "39h ago",
        "joined": "2026-04-11"
      },
      {
        "name": "Arjun Mehta",
        "role": "editor",
        "email": "arjun@northwind.co",
        "lastActive": "11h ago",
        "joined": "2026-02-23"
      },
      {
        "name": "Sara Lin",
        "role": "viewer",
        "email": "sara@northwind.co",
        "lastActive": "29h ago",
        "joined": "2026-08-15"
      },
      {
        "name": "Dev Patel",
        "role": "editor",
        "email": "dev@northwind.co",
        "lastActive": "17h ago",
        "joined": "2026-03-13"
      },
      {
        "name": "Ines Costa",
        "role": "admin",
        "email": "ines@northwind.co",
        "lastActive": "45h ago",
        "joined": "2026-05-25"
      },
      {
        "name": "Tom Baker",
        "role": "viewer",
        "email": "tom@northwind.co",
        "lastActive": "34h ago",
        "joined": "2026-03-21"
      }
    ],
    "usageService": [
      {
        "name": "anthropic",
        "pct": 100,
        "tokens": "77.6M",
        "cost": "60.64"
      },
      {
        "name": "openai",
        "pct": 61,
        "tokens": "47.4M",
        "cost": "43.95"
      },
      {
        "name": "neev_cloud",
        "pct": 60,
        "tokens": "46.2M",
        "cost": "22.58"
      },
      {
        "name": "groq",
        "pct": 32,
        "tokens": "24.5M",
        "cost": "21.82"
      },
      {
        "name": "open_router",
        "pct": 12,
        "tokens": "9.2M",
        "cost": "11.65"
      }
    ],
    "usageModel": [
      {
        "name": "claude-sonnet-4",
        "pct": 100,
        "tokens": "77.6M",
        "cost": "60.64"
      },
      {
        "name": "llama-3.1-8b",
        "pct": 60,
        "tokens": "46.2M",
        "cost": "22.58"
      },
      {
        "name": "gpt-4o-mini",
        "pct": 32,
        "tokens": "24.9M",
        "cost": "21.51"
      },
      {
        "name": "llama-3.3-70b",
        "pct": 32,
        "tokens": "24.5M",
        "cost": "21.82"
      },
      {
        "name": "gpt-4o",
        "pct": 29,
        "tokens": "22.5M",
        "cost": "22.44"
      },
      {
        "name": "deepseek-v3",
        "pct": 12,
        "tokens": "9.2M",
        "cost": "11.65"
      }
    ],
    "daily": [
      {
        "label": "Day 1",
        "okH": 61,
        "errH": 6
      },
      {
        "label": "Day 2",
        "okH": 69,
        "errH": 4
      },
      {
        "label": "Day 3",
        "okH": 35,
        "errH": 1
      },
      {
        "label": "Day 4",
        "okH": 45,
        "errH": 11
      },
      {
        "label": "Day 5",
        "okH": 71,
        "errH": 12
      },
      {
        "label": "Day 6",
        "okH": 50,
        "errH": 11
      },
      {
        "label": "Day 7",
        "okH": 60,
        "errH": 1
      },
      {
        "label": "Day 8",
        "okH": 89,
        "errH": 4
      },
      {
        "label": "Day 9",
        "okH": 44,
        "errH": 3
      },
      {
        "label": "Day 10",
        "okH": 29,
        "errH": 4
      },
      {
        "label": "Day 11",
        "okH": 42,
        "errH": 12
      },
      {
        "label": "Day 12",
        "okH": 80,
        "errH": 7
      },
      {
        "label": "Day 13",
        "okH": 68,
        "errH": 0
      },
      {
        "label": "Day 14",
        "okH": 60,
        "errH": 2
      },
      {
        "label": "Day 15",
        "okH": 60,
        "errH": 4
      },
      {
        "label": "Day 16",
        "okH": 41,
        "errH": 6
      },
      {
        "label": "Day 17",
        "okH": 68,
        "errH": 2
      },
      {
        "label": "Day 18",
        "okH": 63,
        "errH": 8
      },
      {
        "label": "Day 19",
        "okH": 63,
        "errH": 1
      },
      {
        "label": "Day 20",
        "okH": 24,
        "errH": 6
      },
      {
        "label": "Day 21",
        "okH": 62,
        "errH": 0
      },
      {
        "label": "Day 22",
        "okH": 72,
        "errH": 1
      },
      {
        "label": "Day 23",
        "okH": 33,
        "errH": 3
      },
      {
        "label": "Day 24",
        "okH": 52,
        "errH": 8
      },
      {
        "label": "Day 25",
        "okH": 87,
        "errH": 11
      },
      {
        "label": "Day 26",
        "okH": 41,
        "errH": 0
      },
      {
        "label": "Day 27",
        "okH": 77,
        "errH": 12
      },
      {
        "label": "Day 28",
        "okH": 81,
        "errH": 9
      },
      {
        "label": "Day 29",
        "okH": 59,
        "errH": 11
      },
      {
        "label": "Day 30",
        "okH": 27,
        "errH": 4
      }
    ],
    "calls": 112775,
    "failed": 6689,
    "errRate": 5.931279095544225,
    "spend": 160.64000000000001,
    "wallet": 30006,
    "walletUsd": "300.06",
    "walletSynced": "32 min ago",
    "failedDebits": 3,
    "ledger": [
      {
        "date": "2026-09-11 08:12",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "gpt-4o · 1.2M tokens",
        "credits": "-38",
        "color": "inherit",
        "balance": "30,006"
      },
      {
        "date": "2026-09-10 21:40",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "claude-sonnet-4 · 640k tokens",
        "credits": "-63",
        "color": "inherit",
        "balance": "30,043"
      },
      {
        "date": "2026-09-10 09:02",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "llama-3.3-70b · 2.1M tokens",
        "credits": "-16",
        "color": "inherit",
        "balance": "30,080"
      },
      {
        "date": "2026-09-08 14:30",
        "event": "topup",
        "tag": "tag-accent",
        "detail": "Manual top-up · ops@walkover.in",
        "credits": "+1000",
        "color": "var(--color-accent-700)",
        "balance": "30,117"
      },
      {
        "date": "2026-09-01 00:00",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "Monthly rollup · 18 agents",
        "credits": "-238",
        "color": "inherit",
        "balance": "30,154"
      },
      {
        "date": "2026-08-30 11:00",
        "event": "grant",
        "tag": "tag-accent",
        "detail": "Signup grant · credit_grant",
        "credits": "+500",
        "color": "var(--color-accent-700)",
        "balance": "30,191"
      }
    ],
    "status": "active",
    "statusTag": "tag-neutral",
    "blocked": false,
    "blockReason": "",
    "blockedBy": "",
    "blockedAt": "",
    "created": "2025-11-12",
    "lagoId": "cus_11643_546",
    "errColor": "var(--color-accent-700)"
  },
  {
    "id": "80211",
    "name": "Helix Health",
    "owner": "dev@helix.health",
    "plan": "FREE",
    "planTag": "tag-neutral",
    "planCode": "gtwy_free",
    "planName": "Free",
    "planCache": "gtwy_free",
    "drift": "in sync",
    "driftColor": "var(--color-neutral-700)",
    "planChanged": "2026-07-23",
    "agents": [
      {
        "id": "brg_5782812",
        "name": "Docs assistant",
        "type": "chatbot",
        "service": "openai",
        "model": "gpt-4o-mini",
        "version": "v7 · published",
        "calls": "14,086",
        "err": "9.7",
        "errN": 9.7,
        "failed": 1366,
        "cost": "7.04",
        "status": "degraded",
        "statusTag": "tag-accent"
      },
      {
        "id": "brg_5794578",
        "name": "Ticket summariser",
        "type": "api",
        "service": "anthropic",
        "model": "claude-sonnet-4",
        "version": "v3 · published",
        "calls": "13,677",
        "err": "0.9",
        "errN": 0.9,
        "failed": 123,
        "cost": "4.10",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_57a1260",
        "name": "SQL helper",
        "type": "api",
        "service": "anthropic",
        "model": "claude-sonnet-4",
        "version": "v5 · published",
        "calls": "13,103",
        "err": "4.5",
        "errN": 4.5,
        "failed": 590,
        "cost": "19.65",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_57b4859",
        "name": "Ad copy drafter",
        "type": "chatbot",
        "service": "groq",
        "model": "llama-3.3-70b",
        "version": "v7 · published",
        "calls": "497",
        "err": "11.0",
        "errN": 11,
        "failed": 55,
        "cost": "1.19",
        "status": "degraded",
        "statusTag": "tag-accent"
      },
      {
        "id": "brg_57c9374",
        "name": "Contract reviewer",
        "type": "api",
        "service": "openai",
        "model": "gpt-4o",
        "version": "v3 · published",
        "calls": "17,395",
        "err": "11.2",
        "errN": 11.2,
        "failed": 1948,
        "cost": "19.13",
        "status": "degraded",
        "statusTag": "tag-accent"
      },
      {
        "id": "brg_57d8807",
        "name": "Churn predictor",
        "type": "api",
        "service": "anthropic",
        "model": "claude-sonnet-4",
        "version": "v4 · published",
        "calls": "16,327",
        "err": "9.7",
        "errN": 9.7,
        "failed": 1584,
        "cost": "21.23",
        "status": "degraded",
        "statusTag": "tag-accent"
      },
      {
        "id": "brg_57e6155",
        "name": "Support triage",
        "type": "chatbot",
        "service": "open_router",
        "model": "deepseek-v3",
        "version": "v6 · published",
        "calls": "3,226",
        "err": "11.2",
        "errN": 11.2,
        "failed": 361,
        "cost": "3.87",
        "status": "degraded",
        "statusTag": "tag-accent"
      }
    ],
    "apikeys": [
      {
        "name": "openai-prod",
        "service": "openai",
        "masked": "sk-…12k808",
        "scope": "all agents",
        "usage": "$893 / ∞",
        "reset": "monthly",
        "created": "2026-01-18"
      },
      {
        "name": "anthropic-prod-1",
        "service": "anthropic",
        "masked": "sk-…3tz440",
        "scope": "1 agents",
        "usage": "$331 / $2002",
        "reset": "monthly",
        "created": "2026-02-13"
      }
    ],
    "kbs": [
      {
        "name": "Help centre",
        "resources": 18,
        "chunks": "6,353",
        "embedding": "text-embedding-3-small",
        "usedBy": "2 agents",
        "updated": "7d ago"
      }
    ],
    "tools": [
      {
        "name": "get_order",
        "endpoint": "https://api.helix.health/v1/get/order",
        "auth": "Bearer",
        "attached": "1 agents",
        "calls": "727",
        "fail": "0.9"
      }
    ],
    "pauth": [
      {
        "name": "Production",
        "masked": "pauth_…4v5",
        "by": "dev@helix.health",
        "lastUsed": "23h ago",
        "status": "active",
        "statusTag": "tag-neutral"
      }
    ],
    "members": [
      {
        "name": "Priya Nair",
        "role": "admin",
        "email": "dev@helix.health",
        "lastActive": "5h ago",
        "joined": "2026-04-17"
      },
      {
        "name": "Arjun Mehta",
        "role": "editor",
        "email": "arjun@helix.health",
        "lastActive": "5h ago",
        "joined": "2026-05-14"
      },
      {
        "name": "Sara Lin",
        "role": "viewer",
        "email": "sara@helix.health",
        "lastActive": "1h ago",
        "joined": "2026-08-21"
      },
      {
        "name": "Dev Patel",
        "role": "editor",
        "email": "dev@helix.health",
        "lastActive": "12h ago",
        "joined": "2026-02-28"
      },
      {
        "name": "Ines Costa",
        "role": "admin",
        "email": "ines@helix.health",
        "lastActive": "12h ago",
        "joined": "2026-06-22"
      }
    ],
    "usageService": [
      {
        "name": "anthropic",
        "pct": 100,
        "tokens": "81.2M",
        "cost": "44.98"
      },
      {
        "name": "openai",
        "pct": 47,
        "tokens": "38.2M",
        "cost": "26.17"
      },
      {
        "name": "open_router",
        "pct": 9,
        "tokens": "7.7M",
        "cost": "3.87"
      },
      {
        "name": "groq",
        "pct": 1,
        "tokens": "0.6M",
        "cost": "1.19"
      }
    ],
    "usageModel": [
      {
        "name": "claude-sonnet-4",
        "pct": 100,
        "tokens": "81.2M",
        "cost": "44.98"
      },
      {
        "name": "gpt-4o-mini",
        "pct": 27,
        "tokens": "22.2M",
        "cost": "7.04"
      },
      {
        "name": "gpt-4o",
        "pct": 20,
        "tokens": "16.0M",
        "cost": "19.13"
      },
      {
        "name": "deepseek-v3",
        "pct": 9,
        "tokens": "7.7M",
        "cost": "3.87"
      },
      {
        "name": "llama-3.3-70b",
        "pct": 1,
        "tokens": "0.6M",
        "cost": "1.19"
      }
    ],
    "daily": [
      {
        "label": "Day 1",
        "okH": 76,
        "errH": 0
      },
      {
        "label": "Day 2",
        "okH": 29,
        "errH": 2
      },
      {
        "label": "Day 3",
        "okH": 35,
        "errH": 15
      },
      {
        "label": "Day 4",
        "okH": 31,
        "errH": 0
      },
      {
        "label": "Day 5",
        "okH": 37,
        "errH": 9
      },
      {
        "label": "Day 6",
        "okH": 72,
        "errH": 1
      },
      {
        "label": "Day 7",
        "okH": 41,
        "errH": 7
      },
      {
        "label": "Day 8",
        "okH": 29,
        "errH": 7
      },
      {
        "label": "Day 9",
        "okH": 23,
        "errH": 9
      },
      {
        "label": "Day 10",
        "okH": 69,
        "errH": 11
      },
      {
        "label": "Day 11",
        "okH": 93,
        "errH": 4
      },
      {
        "label": "Day 12",
        "okH": 82,
        "errH": 10
      },
      {
        "label": "Day 13",
        "okH": 80,
        "errH": 0
      },
      {
        "label": "Day 14",
        "okH": 34,
        "errH": 5
      },
      {
        "label": "Day 15",
        "okH": 53,
        "errH": 12
      },
      {
        "label": "Day 16",
        "okH": 59,
        "errH": 12
      },
      {
        "label": "Day 17",
        "okH": 84,
        "errH": 14
      },
      {
        "label": "Day 18",
        "okH": 44,
        "errH": 2
      },
      {
        "label": "Day 19",
        "okH": 73,
        "errH": 4
      },
      {
        "label": "Day 20",
        "okH": 81,
        "errH": 5
      },
      {
        "label": "Day 21",
        "okH": 54,
        "errH": 3
      },
      {
        "label": "Day 22",
        "okH": 38,
        "errH": 14
      },
      {
        "label": "Day 23",
        "okH": 97,
        "errH": 0
      },
      {
        "label": "Day 24",
        "okH": 47,
        "errH": 5
      },
      {
        "label": "Day 25",
        "okH": 73,
        "errH": 15
      },
      {
        "label": "Day 26",
        "okH": 80,
        "errH": 3
      },
      {
        "label": "Day 27",
        "okH": 43,
        "errH": 11
      },
      {
        "label": "Day 28",
        "okH": 56,
        "errH": 13
      },
      {
        "label": "Day 29",
        "okH": 65,
        "errH": 4
      },
      {
        "label": "Day 30",
        "okH": 75,
        "errH": 12
      }
    ],
    "calls": 78311,
    "failed": 6027,
    "errRate": 7.696236799427922,
    "spend": 76.21000000000001,
    "wallet": 752,
    "walletUsd": "7.52",
    "walletSynced": "21 min ago",
    "failedDebits": 0,
    "ledger": [
      {
        "date": "2026-09-11 08:12",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "gpt-4o · 1.2M tokens",
        "credits": "-25",
        "color": "inherit",
        "balance": "752"
      },
      {
        "date": "2026-09-10 21:40",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "claude-sonnet-4 · 640k tokens",
        "credits": "-62",
        "color": "inherit",
        "balance": "789"
      },
      {
        "date": "2026-09-10 09:02",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "llama-3.3-70b · 2.1M tokens",
        "credits": "-26",
        "color": "inherit",
        "balance": "826"
      },
      {
        "date": "2026-09-08 14:30",
        "event": "topup",
        "tag": "tag-accent",
        "detail": "Manual top-up · ops@walkover.in",
        "credits": "+1000",
        "color": "var(--color-accent-700)",
        "balance": "863"
      },
      {
        "date": "2026-09-01 00:00",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "Monthly rollup · 18 agents",
        "credits": "-387",
        "color": "inherit",
        "balance": "900"
      },
      {
        "date": "2026-08-30 11:00",
        "event": "grant",
        "tag": "tag-accent",
        "detail": "Signup grant · credit_grant",
        "credits": "+500",
        "color": "var(--color-accent-700)",
        "balance": "937"
      }
    ],
    "status": "active",
    "statusTag": "tag-neutral",
    "blocked": false,
    "blockReason": "",
    "blockedBy": "",
    "blockedAt": "",
    "created": "2025-05-19",
    "lagoId": "cus_80211_669",
    "errColor": "var(--color-accent-700)"
  },
  {
    "id": "52930",
    "name": "Kite Logistics",
    "owner": "cto@kite.io",
    "plan": "PAID",
    "planTag": "tag-accent",
    "planCode": "gtwy_paid_v2",
    "planName": "Paid",
    "planCache": "gtwy_paid_v2",
    "drift": "in sync",
    "driftColor": "var(--color-neutral-700)",
    "planChanged": "2026-03-23",
    "agents": [
      {
        "id": "brg_57s5346",
        "name": "Ad copy drafter",
        "type": "chatbot",
        "service": "neev_cloud",
        "model": "llama-3.1-8b",
        "version": "v1 · published",
        "calls": "9,656",
        "err": "3.4",
        "errN": 3.4,
        "failed": 328,
        "cost": "5.79",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_57t8098",
        "name": "Contract reviewer",
        "type": "api",
        "service": "groq",
        "model": "llama-3.3-70b",
        "version": "v7 · published",
        "calls": "11,857",
        "err": "2.7",
        "errN": 2.7,
        "failed": 320,
        "cost": "32.01",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_57u7766",
        "name": "Churn predictor",
        "type": "api",
        "service": "anthropic",
        "model": "claude-sonnet-4",
        "version": "v9 · published",
        "calls": "11,915",
        "err": "8.1",
        "errN": 8.1,
        "failed": 965,
        "cost": "27.40",
        "status": "degraded",
        "statusTag": "tag-accent"
      },
      {
        "id": "brg_57v7351",
        "name": "Support triage",
        "type": "chatbot",
        "service": "anthropic",
        "model": "claude-sonnet-4",
        "version": "v9 · published",
        "calls": "15,764",
        "err": "10.2",
        "errN": 10.2,
        "failed": 1608,
        "cost": "4.73",
        "status": "degraded",
        "statusTag": "tag-accent"
      }
    ],
    "apikeys": [
      {
        "name": "openai-prod",
        "service": "openai",
        "masked": "sk-…78c673",
        "scope": "all agents",
        "usage": "$871 / ∞",
        "reset": "monthly",
        "created": "2026-05-27"
      }
    ],
    "kbs": [
      {
        "name": "Help centre",
        "resources": 69,
        "chunks": "934",
        "embedding": "text-embedding-3-small",
        "usedBy": "2 agents",
        "updated": "12d ago"
      }
    ],
    "tools": [
      {
        "name": "get_order",
        "endpoint": "https://api.kite.io/v1/get/order",
        "auth": "Bearer",
        "attached": "3 agents",
        "calls": "2,698",
        "fail": "0.9"
      },
      {
        "name": "create_ticket",
        "endpoint": "https://api.kite.io/v1/create/ticket",
        "auth": "PAuth",
        "attached": "2 agents",
        "calls": "5,812",
        "fail": "4.3"
      }
    ],
    "pauth": [
      {
        "name": "Production",
        "masked": "pauth_…5vv",
        "by": "cto@kite.io",
        "lastUsed": "49h ago",
        "status": "active",
        "statusTag": "tag-neutral"
      },
      {
        "name": "CI / staging",
        "masked": "pauth_…1p6",
        "by": "cto@kite.io",
        "lastUsed": "60h ago",
        "status": "active",
        "statusTag": "tag-neutral"
      }
    ],
    "members": [
      {
        "name": "Priya Nair",
        "role": "admin",
        "email": "cto@kite.io",
        "lastActive": "31h ago",
        "joined": "2026-08-28"
      },
      {
        "name": "Arjun Mehta",
        "role": "editor",
        "email": "arjun@kite.io",
        "lastActive": "13h ago",
        "joined": "2026-01-24"
      }
    ],
    "usageService": [
      {
        "name": "anthropic",
        "pct": 100,
        "tokens": "46.1M",
        "cost": "32.13"
      },
      {
        "name": "groq",
        "pct": 52,
        "tokens": "24.1M",
        "cost": "32.01"
      },
      {
        "name": "neev_cloud",
        "pct": 29,
        "tokens": "13.3M",
        "cost": "5.79"
      }
    ],
    "usageModel": [
      {
        "name": "claude-sonnet-4",
        "pct": 100,
        "tokens": "46.1M",
        "cost": "32.13"
      },
      {
        "name": "llama-3.3-70b",
        "pct": 52,
        "tokens": "24.1M",
        "cost": "32.01"
      },
      {
        "name": "llama-3.1-8b",
        "pct": 29,
        "tokens": "13.3M",
        "cost": "5.79"
      }
    ],
    "daily": [
      {
        "label": "Day 1",
        "okH": 34,
        "errH": 11
      },
      {
        "label": "Day 2",
        "okH": 38,
        "errH": 1
      },
      {
        "label": "Day 3",
        "okH": 79,
        "errH": 11
      },
      {
        "label": "Day 4",
        "okH": 80,
        "errH": 6
      },
      {
        "label": "Day 5",
        "okH": 59,
        "errH": 9
      },
      {
        "label": "Day 6",
        "okH": 26,
        "errH": 10
      },
      {
        "label": "Day 7",
        "okH": 40,
        "errH": 1
      },
      {
        "label": "Day 8",
        "okH": 78,
        "errH": 9
      },
      {
        "label": "Day 9",
        "okH": 28,
        "errH": 2
      },
      {
        "label": "Day 10",
        "okH": 73,
        "errH": 1
      },
      {
        "label": "Day 11",
        "okH": 46,
        "errH": 6
      },
      {
        "label": "Day 12",
        "okH": 86,
        "errH": 7
      },
      {
        "label": "Day 13",
        "okH": 56,
        "errH": 10
      },
      {
        "label": "Day 14",
        "okH": 50,
        "errH": 4
      },
      {
        "label": "Day 15",
        "okH": 37,
        "errH": 1
      },
      {
        "label": "Day 16",
        "okH": 37,
        "errH": 5
      },
      {
        "label": "Day 17",
        "okH": 41,
        "errH": 8
      },
      {
        "label": "Day 18",
        "okH": 27,
        "errH": 3
      },
      {
        "label": "Day 19",
        "okH": 93,
        "errH": 4
      },
      {
        "label": "Day 20",
        "okH": 49,
        "errH": 9
      },
      {
        "label": "Day 21",
        "okH": 89,
        "errH": 3
      },
      {
        "label": "Day 22",
        "okH": 27,
        "errH": 13
      },
      {
        "label": "Day 23",
        "okH": 24,
        "errH": 11
      },
      {
        "label": "Day 24",
        "okH": 29,
        "errH": 5
      },
      {
        "label": "Day 25",
        "okH": 30,
        "errH": 8
      },
      {
        "label": "Day 26",
        "okH": 69,
        "errH": 6
      },
      {
        "label": "Day 27",
        "okH": 93,
        "errH": 2
      },
      {
        "label": "Day 28",
        "okH": 36,
        "errH": 7
      },
      {
        "label": "Day 29",
        "okH": 48,
        "errH": 11
      },
      {
        "label": "Day 30",
        "okH": 73,
        "errH": 11
      }
    ],
    "calls": 49192,
    "failed": 3221,
    "errRate": 6.547812652463815,
    "spend": 69.92999999999999,
    "wallet": 33609,
    "walletUsd": "336.09",
    "walletSynced": "33 min ago",
    "failedDebits": 0,
    "ledger": [
      {
        "date": "2026-09-11 08:12",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "gpt-4o · 1.2M tokens",
        "credits": "-49",
        "color": "inherit",
        "balance": "33,609"
      },
      {
        "date": "2026-09-10 21:40",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "claude-sonnet-4 · 640k tokens",
        "credits": "-60",
        "color": "inherit",
        "balance": "33,646"
      },
      {
        "date": "2026-09-10 09:02",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "llama-3.3-70b · 2.1M tokens",
        "credits": "-9",
        "color": "inherit",
        "balance": "33,683"
      },
      {
        "date": "2026-09-08 14:30",
        "event": "topup",
        "tag": "tag-accent",
        "detail": "Manual top-up · ops@walkover.in",
        "credits": "+1000",
        "color": "var(--color-accent-700)",
        "balance": "33,720"
      },
      {
        "date": "2026-09-01 00:00",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "Monthly rollup · 18 agents",
        "credits": "-352",
        "color": "inherit",
        "balance": "33,757"
      },
      {
        "date": "2026-08-30 11:00",
        "event": "grant",
        "tag": "tag-accent",
        "detail": "Signup grant · credit_grant",
        "credits": "+500",
        "color": "var(--color-accent-700)",
        "balance": "33,794"
      }
    ],
    "status": "active",
    "statusTag": "tag-neutral",
    "blocked": false,
    "blockReason": "",
    "blockedBy": "",
    "blockedAt": "",
    "created": "2025-04-23",
    "lagoId": "cus_52930_582",
    "errColor": "var(--color-accent-700)"
  },
  {
    "id": "66104",
    "name": "Papercut Studio",
    "owner": "hello@papercut.studio",
    "plan": "FREE",
    "planTag": "tag-neutral",
    "planCode": "gtwy_free",
    "planName": "Free",
    "planCache": "gtwy_free",
    "drift": "in sync",
    "driftColor": "var(--color-neutral-700)",
    "planChanged": "2026-06-27",
    "agents": [
      {
        "id": "brg_58c8411",
        "name": "Support triage",
        "type": "chatbot",
        "service": "open_router",
        "model": "deepseek-v3",
        "version": "v4 · published",
        "calls": "16,661",
        "err": "5.6",
        "errN": 5.6,
        "failed": 933,
        "cost": "33.32",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_58d5399",
        "name": "Order lookup",
        "type": "api",
        "service": "openai",
        "model": "gpt-4o-mini",
        "version": "v4 · published",
        "calls": "8,121",
        "err": "2.4",
        "errN": 2.4,
        "failed": 195,
        "cost": "12.99",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_58e1303",
        "name": "Refund policy QA",
        "type": "api",
        "service": "neev_cloud",
        "model": "llama-3.1-8b",
        "version": "v8 · published",
        "calls": "13,261",
        "err": "13.1",
        "errN": 13.1,
        "failed": 1737,
        "cost": "39.78",
        "status": "degraded",
        "statusTag": "tag-accent"
      }
    ],
    "apikeys": [
      {
        "name": "openai-prod",
        "service": "openai",
        "masked": "sk-…54w847",
        "scope": "all agents",
        "usage": "$545 / ∞",
        "reset": "monthly",
        "created": "2026-01-21"
      }
    ],
    "kbs": [
      {
        "name": "Help centre",
        "resources": 26,
        "chunks": "15,316",
        "embedding": "text-embedding-3-small",
        "usedBy": "1 agents",
        "updated": "15d ago"
      }
    ],
    "tools": [
      {
        "name": "get_order",
        "endpoint": "https://api.papercut.studio/v1/get/order",
        "auth": "Bearer",
        "attached": "4 agents",
        "calls": "3,926",
        "fail": "0.4"
      },
      {
        "name": "create_ticket",
        "endpoint": "https://api.papercut.studio/v1/create/ticket",
        "auth": "PAuth",
        "attached": "4 agents",
        "calls": "7,865",
        "fail": "5.0"
      },
      {
        "name": "lookup_customer",
        "endpoint": "https://api.papercut.studio/v1/lookup/customer",
        "auth": "PAuth",
        "attached": "4 agents",
        "calls": "4,185",
        "fail": "1.4"
      }
    ],
    "pauth": [
      {
        "name": "Production",
        "masked": "pauth_…3q5",
        "by": "hello@papercut.studio",
        "lastUsed": "62h ago",
        "status": "active",
        "statusTag": "tag-neutral"
      }
    ],
    "members": [
      {
        "name": "Priya Nair",
        "role": "admin",
        "email": "hello@papercut.studio",
        "lastActive": "6h ago",
        "joined": "2026-01-25"
      },
      {
        "name": "Arjun Mehta",
        "role": "editor",
        "email": "arjun@papercut.studio",
        "lastActive": "2h ago",
        "joined": "2026-04-15"
      }
    ],
    "usageService": [
      {
        "name": "open_router",
        "pct": 100,
        "tokens": "41.9M",
        "cost": "33.32"
      },
      {
        "name": "openai",
        "pct": 42,
        "tokens": "17.8M",
        "cost": "12.99"
      },
      {
        "name": "neev_cloud",
        "pct": 34,
        "tokens": "14.1M",
        "cost": "39.78"
      }
    ],
    "usageModel": [
      {
        "name": "deepseek-v3",
        "pct": 100,
        "tokens": "41.9M",
        "cost": "33.32"
      },
      {
        "name": "gpt-4o-mini",
        "pct": 42,
        "tokens": "17.8M",
        "cost": "12.99"
      },
      {
        "name": "llama-3.1-8b",
        "pct": 34,
        "tokens": "14.1M",
        "cost": "39.78"
      }
    ],
    "daily": [
      {
        "label": "Day 1",
        "okH": 48,
        "errH": 4
      },
      {
        "label": "Day 2",
        "okH": 65,
        "errH": 8
      },
      {
        "label": "Day 3",
        "okH": 60,
        "errH": 4
      },
      {
        "label": "Day 4",
        "okH": 21,
        "errH": 12
      },
      {
        "label": "Day 5",
        "okH": 62,
        "errH": 3
      },
      {
        "label": "Day 6",
        "okH": 58,
        "errH": 10
      },
      {
        "label": "Day 7",
        "okH": 65,
        "errH": 3
      },
      {
        "label": "Day 8",
        "okH": 42,
        "errH": 5
      },
      {
        "label": "Day 9",
        "okH": 39,
        "errH": 9
      },
      {
        "label": "Day 10",
        "okH": 40,
        "errH": 0
      },
      {
        "label": "Day 11",
        "okH": 41,
        "errH": 4
      },
      {
        "label": "Day 12",
        "okH": 91,
        "errH": 7
      },
      {
        "label": "Day 13",
        "okH": 35,
        "errH": 7
      },
      {
        "label": "Day 14",
        "okH": 77,
        "errH": 4
      },
      {
        "label": "Day 15",
        "okH": 93,
        "errH": 7
      },
      {
        "label": "Day 16",
        "okH": 85,
        "errH": 14
      },
      {
        "label": "Day 17",
        "okH": 27,
        "errH": 11
      },
      {
        "label": "Day 18",
        "okH": 77,
        "errH": 0
      },
      {
        "label": "Day 19",
        "okH": 82,
        "errH": 10
      },
      {
        "label": "Day 20",
        "okH": 67,
        "errH": 14
      },
      {
        "label": "Day 21",
        "okH": 46,
        "errH": 8
      },
      {
        "label": "Day 22",
        "okH": 44,
        "errH": 1
      },
      {
        "label": "Day 23",
        "okH": 89,
        "errH": 3
      },
      {
        "label": "Day 24",
        "okH": 51,
        "errH": 3
      },
      {
        "label": "Day 25",
        "okH": 45,
        "errH": 8
      },
      {
        "label": "Day 26",
        "okH": 79,
        "errH": 15
      },
      {
        "label": "Day 27",
        "okH": 24,
        "errH": 6
      },
      {
        "label": "Day 28",
        "okH": 65,
        "errH": 3
      },
      {
        "label": "Day 29",
        "okH": 33,
        "errH": 7
      },
      {
        "label": "Day 30",
        "okH": 68,
        "errH": 8
      }
    ],
    "calls": 38043,
    "failed": 2865,
    "errRate": 7.530951817679994,
    "spend": 86.09,
    "wallet": 168,
    "walletUsd": "1.68",
    "walletSynced": "25 min ago",
    "failedDebits": 0,
    "ledger": [
      {
        "date": "2026-09-11 08:12",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "gpt-4o · 1.2M tokens",
        "credits": "-29",
        "color": "inherit",
        "balance": "168"
      },
      {
        "date": "2026-09-10 21:40",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "claude-sonnet-4 · 640k tokens",
        "credits": "-73",
        "color": "inherit",
        "balance": "205"
      },
      {
        "date": "2026-09-10 09:02",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "llama-3.3-70b · 2.1M tokens",
        "credits": "-14",
        "color": "inherit",
        "balance": "242"
      },
      {
        "date": "2026-09-08 14:30",
        "event": "topup",
        "tag": "tag-accent",
        "detail": "Manual top-up · ops@walkover.in",
        "credits": "+1000",
        "color": "var(--color-accent-700)",
        "balance": "279"
      },
      {
        "date": "2026-09-01 00:00",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "Monthly rollup · 18 agents",
        "credits": "-105",
        "color": "inherit",
        "balance": "316"
      },
      {
        "date": "2026-08-30 11:00",
        "event": "grant",
        "tag": "tag-accent",
        "detail": "Signup grant · credit_grant",
        "credits": "+500",
        "color": "var(--color-accent-700)",
        "balance": "353"
      }
    ],
    "status": "active",
    "statusTag": "tag-neutral",
    "blocked": false,
    "blockReason": "",
    "blockedBy": "",
    "blockedAt": "",
    "created": "2025-04-26",
    "lagoId": "cus_66104_530",
    "errColor": "var(--color-accent-700)"
  },
  {
    "id": "30877",
    "name": "Bluefin Capital",
    "owner": "it@bluefin.vc",
    "plan": "PAID",
    "planTag": "tag-accent",
    "planCode": "gtwy_paid_v2",
    "planName": "Paid",
    "planCache": "gtwy_paid_v2",
    "drift": "in sync",
    "driftColor": "var(--color-neutral-700)",
    "planChanged": "2026-07-21",
    "agents": [
      {
        "id": "brg_58w9000",
        "name": "Onboarding guide",
        "type": "chatbot",
        "service": "groq",
        "model": "llama-3.3-70b",
        "version": "v8 · published",
        "calls": "16,846",
        "err": "11.9",
        "errN": 11.9,
        "failed": 2005,
        "cost": "40.43",
        "status": "degraded",
        "statusTag": "tag-accent"
      },
      {
        "id": "brg_58x1140",
        "name": "Invoice extractor",
        "type": "api",
        "service": "openai",
        "model": "gpt-4o-mini",
        "version": "v5 · published",
        "calls": "9,267",
        "err": "13.9",
        "errN": 13.9,
        "failed": 1288,
        "cost": "25.95",
        "status": "degraded",
        "statusTag": "tag-accent"
      },
      {
        "id": "brg_58y6197",
        "name": "Lead qualifier",
        "type": "api",
        "service": "groq",
        "model": "llama-3.3-70b",
        "version": "v7 · published",
        "calls": "1,524",
        "err": "0.0",
        "errN": 0,
        "failed": 0,
        "cost": "3.05",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_58z9171",
        "name": "Docs assistant",
        "type": "chatbot",
        "service": "openai",
        "model": "gpt-4o-mini",
        "version": "v1 · published",
        "calls": "17,350",
        "err": "3.3",
        "errN": 3.3,
        "failed": 573,
        "cost": "15.62",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_5904062",
        "name": "Ticket summariser",
        "type": "api",
        "service": "openai",
        "model": "gpt-4o",
        "version": "v7 · published",
        "calls": "9,277",
        "err": "0.1",
        "errN": 0.1,
        "failed": 9,
        "cost": "2.78",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_5912869",
        "name": "SQL helper",
        "type": "api",
        "service": "neev_cloud",
        "model": "llama-3.1-8b",
        "version": "v9 · published",
        "calls": "1,039",
        "err": "9.4",
        "errN": 9.4,
        "failed": 98,
        "cost": "1.35",
        "status": "degraded",
        "statusTag": "tag-accent"
      },
      {
        "id": "brg_5928593",
        "name": "Ad copy drafter",
        "type": "chatbot",
        "service": "open_router",
        "model": "deepseek-v3",
        "version": "v3 · published",
        "calls": "16,370",
        "err": "7.5",
        "errN": 7.5,
        "failed": 1228,
        "cost": "31.10",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_5936233",
        "name": "Contract reviewer",
        "type": "api",
        "service": "neev_cloud",
        "model": "llama-3.1-8b",
        "version": "v8 · published",
        "calls": "7,803",
        "err": "13.4",
        "errN": 13.4,
        "failed": 1046,
        "cost": "2.34",
        "status": "degraded",
        "statusTag": "tag-accent"
      },
      {
        "id": "brg_5947790",
        "name": "Churn predictor",
        "type": "api",
        "service": "openai",
        "model": "gpt-4o",
        "version": "v1 · published",
        "calls": "16,871",
        "err": "3.4",
        "errN": 3.4,
        "failed": 574,
        "cost": "5.06",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_5957264",
        "name": "Support triage",
        "type": "chatbot",
        "service": "openai",
        "model": "gpt-4o-mini",
        "version": "v4 · published",
        "calls": "13,908",
        "err": "10.6",
        "errN": 10.6,
        "failed": 1474,
        "cost": "37.55",
        "status": "degraded",
        "statusTag": "tag-accent"
      },
      {
        "id": "brg_5967655",
        "name": "Order lookup",
        "type": "api",
        "service": "open_router",
        "model": "deepseek-v3",
        "version": "v9 · published",
        "calls": "4,846",
        "err": "11.4",
        "errN": 11.4,
        "failed": 552,
        "cost": "14.05",
        "status": "degraded",
        "statusTag": "tag-accent"
      }
    ],
    "apikeys": [
      {
        "name": "openai-prod",
        "service": "openai",
        "masked": "sk-…4uz161",
        "scope": "all agents",
        "usage": "$252 / ∞",
        "reset": "monthly",
        "created": "2026-02-26"
      },
      {
        "name": "anthropic-prod-1",
        "service": "anthropic",
        "masked": "sk-…2pk117",
        "scope": "2 agents",
        "usage": "$138 / $3093",
        "reset": "monthly",
        "created": "2026-06-15"
      },
      {
        "name": "groq-prod-2",
        "service": "groq",
        "masked": "sk-…1ip242",
        "scope": "1 agents",
        "usage": "$179 / $2254",
        "reset": "monthly",
        "created": "2026-01-13"
      }
    ],
    "kbs": [
      {
        "name": "Help centre",
        "resources": 49,
        "chunks": "11,508",
        "embedding": "text-embedding-3-small",
        "usedBy": "1 agents",
        "updated": "19d ago"
      },
      {
        "name": "Product docs",
        "resources": 55,
        "chunks": "16,955",
        "embedding": "text-embedding-3-small",
        "usedBy": "3 agents",
        "updated": "17d ago"
      },
      {
        "name": "Policies",
        "resources": 88,
        "chunks": "5,779",
        "embedding": "text-embedding-3-small",
        "usedBy": "3 agents",
        "updated": "5d ago"
      },
      {
        "name": "Release notes",
        "resources": 89,
        "chunks": "10,515",
        "embedding": "text-embedding-3-small",
        "usedBy": "4 agents",
        "updated": "7d ago"
      }
    ],
    "tools": [
      {
        "name": "get_order",
        "endpoint": "https://api.bluefin.vc/v1/get/order",
        "auth": "Bearer",
        "attached": "3 agents",
        "calls": "6,907",
        "fail": "2.8"
      },
      {
        "name": "create_ticket",
        "endpoint": "https://api.bluefin.vc/v1/create/ticket",
        "auth": "Bearer",
        "attached": "1 agents",
        "calls": "1,075",
        "fail": "1.1"
      },
      {
        "name": "lookup_customer",
        "endpoint": "https://api.bluefin.vc/v1/lookup/customer",
        "auth": "PAuth",
        "attached": "4 agents",
        "calls": "1,250",
        "fail": "0.6"
      },
      {
        "name": "send_email",
        "endpoint": "https://api.bluefin.vc/v1/send/email",
        "auth": "PAuth",
        "attached": "4 agents",
        "calls": "6,003",
        "fail": "3.0"
      }
    ],
    "pauth": [
      {
        "name": "Production",
        "masked": "pauth_…1ot",
        "by": "it@bluefin.vc",
        "lastUsed": "13h ago",
        "status": "active",
        "statusTag": "tag-neutral"
      },
      {
        "name": "CI / staging",
        "masked": "pauth_…68s",
        "by": "it@bluefin.vc",
        "lastUsed": "66h ago",
        "status": "revoked",
        "statusTag": "tag-neutral"
      }
    ],
    "members": [
      {
        "name": "Priya Nair",
        "role": "admin",
        "email": "it@bluefin.vc",
        "lastActive": "36h ago",
        "joined": "2026-06-14"
      },
      {
        "name": "Arjun Mehta",
        "role": "editor",
        "email": "arjun@bluefin.vc",
        "lastActive": "8h ago",
        "joined": "2026-05-20"
      }
    ],
    "usageService": [
      {
        "name": "openai",
        "pct": 100,
        "tokens": "130.9M",
        "cost": "86.96"
      },
      {
        "name": "groq",
        "pct": 26,
        "tokens": "33.4M",
        "cost": "43.48"
      },
      {
        "name": "open_router",
        "pct": 20,
        "tokens": "26.0M",
        "cost": "45.15"
      },
      {
        "name": "neev_cloud",
        "pct": 13,
        "tokens": "16.4M",
        "cost": "3.69"
      }
    ],
    "usageModel": [
      {
        "name": "gpt-4o-mini",
        "pct": 100,
        "tokens": "82.7M",
        "cost": "79.12"
      },
      {
        "name": "gpt-4o",
        "pct": 58,
        "tokens": "48.2M",
        "cost": "7.84"
      },
      {
        "name": "llama-3.3-70b",
        "pct": 40,
        "tokens": "33.4M",
        "cost": "43.48"
      },
      {
        "name": "deepseek-v3",
        "pct": 31,
        "tokens": "26.0M",
        "cost": "45.15"
      },
      {
        "name": "llama-3.1-8b",
        "pct": 20,
        "tokens": "16.4M",
        "cost": "3.69"
      }
    ],
    "daily": [
      {
        "label": "Day 1",
        "okH": 27,
        "errH": 7
      },
      {
        "label": "Day 2",
        "okH": 32,
        "errH": 9
      },
      {
        "label": "Day 3",
        "okH": 36,
        "errH": 1
      },
      {
        "label": "Day 4",
        "okH": 85,
        "errH": 3
      },
      {
        "label": "Day 5",
        "okH": 94,
        "errH": 2
      },
      {
        "label": "Day 6",
        "okH": 47,
        "errH": 3
      },
      {
        "label": "Day 7",
        "okH": 20,
        "errH": 10
      },
      {
        "label": "Day 8",
        "okH": 37,
        "errH": 12
      },
      {
        "label": "Day 9",
        "okH": 79,
        "errH": 8
      },
      {
        "label": "Day 10",
        "okH": 97,
        "errH": 1
      },
      {
        "label": "Day 11",
        "okH": 50,
        "errH": 14
      },
      {
        "label": "Day 12",
        "okH": 92,
        "errH": 7
      },
      {
        "label": "Day 13",
        "okH": 18,
        "errH": 13
      },
      {
        "label": "Day 14",
        "okH": 82,
        "errH": 12
      },
      {
        "label": "Day 15",
        "okH": 37,
        "errH": 3
      },
      {
        "label": "Day 16",
        "okH": 62,
        "errH": 4
      },
      {
        "label": "Day 17",
        "okH": 81,
        "errH": 11
      },
      {
        "label": "Day 18",
        "okH": 71,
        "errH": 3
      },
      {
        "label": "Day 19",
        "okH": 74,
        "errH": 10
      },
      {
        "label": "Day 20",
        "okH": 80,
        "errH": 1
      },
      {
        "label": "Day 21",
        "okH": 72,
        "errH": 12
      },
      {
        "label": "Day 22",
        "okH": 33,
        "errH": 6
      },
      {
        "label": "Day 23",
        "okH": 82,
        "errH": 4
      },
      {
        "label": "Day 24",
        "okH": 91,
        "errH": 3
      },
      {
        "label": "Day 25",
        "okH": 84,
        "errH": 12
      },
      {
        "label": "Day 26",
        "okH": 50,
        "errH": 8
      },
      {
        "label": "Day 27",
        "okH": 43,
        "errH": 13
      },
      {
        "label": "Day 28",
        "okH": 63,
        "errH": 2
      },
      {
        "label": "Day 29",
        "okH": 90,
        "errH": 3
      },
      {
        "label": "Day 30",
        "okH": 64,
        "errH": 0
      }
    ],
    "calls": 115101,
    "failed": 8847,
    "errRate": 7.686292907967784,
    "spend": 179.28000000000003,
    "wallet": 9108,
    "walletUsd": "91.08",
    "walletSynced": "2 min ago",
    "failedDebits": 0,
    "ledger": [
      {
        "date": "2026-09-11 08:12",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "gpt-4o · 1.2M tokens",
        "credits": "-54",
        "color": "inherit",
        "balance": "9,108"
      },
      {
        "date": "2026-09-10 21:40",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "claude-sonnet-4 · 640k tokens",
        "credits": "-46",
        "color": "inherit",
        "balance": "9,145"
      },
      {
        "date": "2026-09-10 09:02",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "llama-3.3-70b · 2.1M tokens",
        "credits": "-19",
        "color": "inherit",
        "balance": "9,182"
      },
      {
        "date": "2026-09-08 14:30",
        "event": "topup",
        "tag": "tag-accent",
        "detail": "Manual top-up · ops@walkover.in",
        "credits": "+1000",
        "color": "var(--color-accent-700)",
        "balance": "9,219"
      },
      {
        "date": "2026-09-01 00:00",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "Monthly rollup · 18 agents",
        "credits": "-157",
        "color": "inherit",
        "balance": "9,256"
      },
      {
        "date": "2026-08-30 11:00",
        "event": "grant",
        "tag": "tag-accent",
        "detail": "Signup grant · credit_grant",
        "credits": "+500",
        "color": "var(--color-accent-700)",
        "balance": "9,293"
      }
    ],
    "status": "active",
    "statusTag": "tag-neutral",
    "blocked": false,
    "blockReason": "",
    "blockedBy": "",
    "blockedAt": "",
    "created": "2025-09-27",
    "lagoId": "cus_30877_535",
    "errColor": "var(--color-accent-700)"
  },
  {
    "id": "91502",
    "name": "Tandem Labs",
    "owner": "team@tandemlabs.ai",
    "plan": "FREE",
    "planTag": "tag-neutral",
    "planCode": "gtwy_free",
    "planName": "Free",
    "planCache": "gtwy_free",
    "drift": "in sync",
    "driftColor": "var(--color-neutral-700)",
    "planChanged": "2026-08-28",
    "agents": [
      {
        "id": "brg_59g6558",
        "name": "Docs assistant",
        "type": "chatbot",
        "service": "anthropic",
        "model": "claude-sonnet-4",
        "version": "v5 · published",
        "calls": "13,994",
        "err": "13.6",
        "errN": 13.6,
        "failed": 1903,
        "cost": "32.19",
        "status": "degraded",
        "statusTag": "tag-accent"
      },
      {
        "id": "brg_59h4698",
        "name": "Ticket summariser",
        "type": "api",
        "service": "open_router",
        "model": "deepseek-v3",
        "version": "v8 · published",
        "calls": "482",
        "err": "10.8",
        "errN": 10.8,
        "failed": 52,
        "cost": "0.87",
        "status": "degraded",
        "statusTag": "tag-accent"
      },
      {
        "id": "brg_59i6756",
        "name": "SQL helper",
        "type": "api",
        "service": "neev_cloud",
        "model": "llama-3.1-8b",
        "version": "v7 · published",
        "calls": "4,606",
        "err": "6.4",
        "errN": 6.4,
        "failed": 295,
        "cost": "12.90",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_59j6729",
        "name": "Ad copy drafter",
        "type": "chatbot",
        "service": "openai",
        "model": "gpt-4o",
        "version": "v7 · published",
        "calls": "14,498",
        "err": "4.9",
        "errN": 4.9,
        "failed": 710,
        "cost": "10.15",
        "status": "healthy",
        "statusTag": "tag-neutral"
      }
    ],
    "apikeys": [
      {
        "name": "openai-prod",
        "service": "openai",
        "masked": "sk-…74k725",
        "scope": "all agents",
        "usage": "$33 / ∞",
        "reset": "monthly",
        "created": "2026-03-25"
      },
      {
        "name": "anthropic-prod-1",
        "service": "anthropic",
        "masked": "sk-…249166",
        "scope": "3 agents",
        "usage": "$601 / $1434",
        "reset": "monthly",
        "created": "2026-06-26"
      },
      {
        "name": "groq-prod-2",
        "service": "groq",
        "masked": "sk-…s9850",
        "scope": "1 agents",
        "usage": "$161 / $4119",
        "reset": "monthly",
        "created": "2026-01-10"
      }
    ],
    "kbs": [
      {
        "name": "Help centre",
        "resources": 83,
        "chunks": "421",
        "embedding": "text-embedding-3-small",
        "usedBy": "3 agents",
        "updated": "3d ago"
      }
    ],
    "tools": [
      {
        "name": "get_order",
        "endpoint": "https://api.tandemlabs.ai/v1/get/order",
        "auth": "PAuth",
        "attached": "1 agents",
        "calls": "8,407",
        "fail": "4.3"
      },
      {
        "name": "create_ticket",
        "endpoint": "https://api.tandemlabs.ai/v1/create/ticket",
        "auth": "PAuth",
        "attached": "3 agents",
        "calls": "2,831",
        "fail": "2.0"
      },
      {
        "name": "lookup_customer",
        "endpoint": "https://api.tandemlabs.ai/v1/lookup/customer",
        "auth": "PAuth",
        "attached": "2 agents",
        "calls": "2,713",
        "fail": "0.3"
      }
    ],
    "pauth": [
      {
        "name": "Production",
        "masked": "pauth_…5q1",
        "by": "team@tandemlabs.ai",
        "lastUsed": "31h ago",
        "status": "active",
        "statusTag": "tag-neutral"
      },
      {
        "name": "CI / staging",
        "masked": "pauth_…2l9",
        "by": "team@tandemlabs.ai",
        "lastUsed": "2h ago",
        "status": "revoked",
        "statusTag": "tag-neutral"
      }
    ],
    "members": [
      {
        "name": "Priya Nair",
        "role": "admin",
        "email": "team@tandemlabs.ai",
        "lastActive": "1h ago",
        "joined": "2026-07-23"
      },
      {
        "name": "Arjun Mehta",
        "role": "editor",
        "email": "arjun@tandemlabs.ai",
        "lastActive": "2h ago",
        "joined": "2026-06-12"
      },
      {
        "name": "Sara Lin",
        "role": "viewer",
        "email": "sara@tandemlabs.ai",
        "lastActive": "11h ago",
        "joined": "2026-01-15"
      },
      {
        "name": "Dev Patel",
        "role": "editor",
        "email": "dev@tandemlabs.ai",
        "lastActive": "48h ago",
        "joined": "2026-06-21"
      },
      {
        "name": "Ines Costa",
        "role": "admin",
        "email": "ines@tandemlabs.ai",
        "lastActive": "36h ago",
        "joined": "2026-06-20"
      }
    ],
    "usageService": [
      {
        "name": "openai",
        "pct": 100,
        "tokens": "36.1M",
        "cost": "10.15"
      },
      {
        "name": "anthropic",
        "pct": 96,
        "tokens": "34.6M",
        "cost": "32.19"
      },
      {
        "name": "neev_cloud",
        "pct": 24,
        "tokens": "8.5M",
        "cost": "12.90"
      },
      {
        "name": "open_router",
        "pct": 2,
        "tokens": "0.9M",
        "cost": "0.87"
      }
    ],
    "usageModel": [
      {
        "name": "gpt-4o",
        "pct": 100,
        "tokens": "36.1M",
        "cost": "10.15"
      },
      {
        "name": "claude-sonnet-4",
        "pct": 96,
        "tokens": "34.6M",
        "cost": "32.19"
      },
      {
        "name": "llama-3.1-8b",
        "pct": 24,
        "tokens": "8.5M",
        "cost": "12.90"
      },
      {
        "name": "deepseek-v3",
        "pct": 2,
        "tokens": "0.9M",
        "cost": "0.87"
      }
    ],
    "daily": [
      {
        "label": "Day 1",
        "okH": 64,
        "errH": 18
      },
      {
        "label": "Day 2",
        "okH": 31,
        "errH": 12
      },
      {
        "label": "Day 3",
        "okH": 46,
        "errH": 2
      },
      {
        "label": "Day 4",
        "okH": 64,
        "errH": 15
      },
      {
        "label": "Day 5",
        "okH": 32,
        "errH": 5
      },
      {
        "label": "Day 6",
        "okH": 23,
        "errH": 11
      },
      {
        "label": "Day 7",
        "okH": 83,
        "errH": 8
      },
      {
        "label": "Day 8",
        "okH": 16,
        "errH": 15
      },
      {
        "label": "Day 9",
        "okH": 37,
        "errH": 14
      },
      {
        "label": "Day 10",
        "okH": 70,
        "errH": 2
      },
      {
        "label": "Day 11",
        "okH": 38,
        "errH": 10
      },
      {
        "label": "Day 12",
        "okH": 35,
        "errH": 17
      },
      {
        "label": "Day 13",
        "okH": 38,
        "errH": 5
      },
      {
        "label": "Day 14",
        "okH": 24,
        "errH": 16
      },
      {
        "label": "Day 15",
        "okH": 53,
        "errH": 7
      },
      {
        "label": "Day 16",
        "okH": 27,
        "errH": 3
      },
      {
        "label": "Day 17",
        "okH": 32,
        "errH": 0
      },
      {
        "label": "Day 18",
        "okH": 90,
        "errH": 9
      },
      {
        "label": "Day 19",
        "okH": 53,
        "errH": 3
      },
      {
        "label": "Day 20",
        "okH": 40,
        "errH": 7
      },
      {
        "label": "Day 21",
        "okH": 39,
        "errH": 12
      },
      {
        "label": "Day 22",
        "okH": 61,
        "errH": 12
      },
      {
        "label": "Day 23",
        "okH": 31,
        "errH": 6
      },
      {
        "label": "Day 24",
        "okH": 79,
        "errH": 1
      },
      {
        "label": "Day 25",
        "okH": 18,
        "errH": 16
      },
      {
        "label": "Day 26",
        "okH": 96,
        "errH": 2
      },
      {
        "label": "Day 27",
        "okH": 67,
        "errH": 3
      },
      {
        "label": "Day 28",
        "okH": 31,
        "errH": 3
      },
      {
        "label": "Day 29",
        "okH": 37,
        "errH": 3
      },
      {
        "label": "Day 30",
        "okH": 38,
        "errH": 5
      }
    ],
    "calls": 33580,
    "failed": 2960,
    "errRate": 8.81477069684336,
    "spend": 56.10999999999999,
    "wallet": 842,
    "walletUsd": "8.42",
    "walletSynced": "28 min ago",
    "failedDebits": 0,
    "ledger": [
      {
        "date": "2026-09-11 08:12",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "gpt-4o · 1.2M tokens",
        "credits": "-64",
        "color": "inherit",
        "balance": "842"
      },
      {
        "date": "2026-09-10 21:40",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "claude-sonnet-4 · 640k tokens",
        "credits": "-67",
        "color": "inherit",
        "balance": "879"
      },
      {
        "date": "2026-09-10 09:02",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "llama-3.3-70b · 2.1M tokens",
        "credits": "-14",
        "color": "inherit",
        "balance": "916"
      },
      {
        "date": "2026-09-08 14:30",
        "event": "topup",
        "tag": "tag-accent",
        "detail": "Manual top-up · ops@walkover.in",
        "credits": "+1000",
        "color": "var(--color-accent-700)",
        "balance": "953"
      },
      {
        "date": "2026-09-01 00:00",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "Monthly rollup · 18 agents",
        "credits": "-388",
        "color": "inherit",
        "balance": "990"
      },
      {
        "date": "2026-08-30 11:00",
        "event": "grant",
        "tag": "tag-accent",
        "detail": "Signup grant · credit_grant",
        "credits": "+500",
        "color": "var(--color-accent-700)",
        "balance": "1,027"
      }
    ],
    "status": "blocked",
    "statusTag": "tag-accent",
    "blocked": true,
    "blockReason": "Credential stuffing against /public/login",
    "blockedBy": "ops@walkover.in",
    "blockedAt": "2026-09-09 17:22",
    "created": "2025-05-23",
    "lagoId": "cus_91502_480",
    "errColor": "var(--color-accent-700)"
  },
  {
    "id": "47720",
    "name": "Orbit Media",
    "owner": "dev@orbitmedia.in",
    "plan": "FREE",
    "planTag": "tag-neutral",
    "planCode": "gtwy_free",
    "planName": "Free",
    "planCache": "gtwy_free",
    "drift": "in sync",
    "driftColor": "var(--color-neutral-700)",
    "planChanged": "2026-08-18",
    "agents": [
      {
        "id": "brg_5a01268",
        "name": "Ad copy drafter",
        "type": "chatbot",
        "service": "openai",
        "model": "gpt-4o",
        "version": "v4 · published",
        "calls": "8,073",
        "err": "0.1",
        "errN": 0.1,
        "failed": 8,
        "cost": "20.18",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_5a11186",
        "name": "Contract reviewer",
        "type": "api",
        "service": "neev_cloud",
        "model": "llama-3.1-8b",
        "version": "v9 · published",
        "calls": "14,559",
        "err": "1.2",
        "errN": 1.2,
        "failed": 175,
        "cost": "17.47",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_5a21021",
        "name": "Churn predictor",
        "type": "api",
        "service": "neev_cloud",
        "model": "llama-3.1-8b",
        "version": "v4 · published",
        "calls": "7,035",
        "err": "13.1",
        "errN": 13.1,
        "failed": 922,
        "cost": "7.74",
        "status": "degraded",
        "statusTag": "tag-accent"
      },
      {
        "id": "brg_5a33773",
        "name": "Support triage",
        "type": "chatbot",
        "service": "groq",
        "model": "llama-3.3-70b",
        "version": "v1 · published",
        "calls": "9,236",
        "err": "12.4",
        "errN": 12.4,
        "failed": 1145,
        "cost": "3.69",
        "status": "degraded",
        "statusTag": "tag-accent"
      },
      {
        "id": "brg_5a43441",
        "name": "Order lookup",
        "type": "api",
        "service": "anthropic",
        "model": "claude-sonnet-4",
        "version": "v3 · published",
        "calls": "9,294",
        "err": "3.6",
        "errN": 3.6,
        "failed": 335,
        "cost": "26.02",
        "status": "healthy",
        "statusTag": "tag-neutral"
      },
      {
        "id": "brg_5a53026",
        "name": "Refund policy QA",
        "type": "api",
        "service": "anthropic",
        "model": "claude-sonnet-4",
        "version": "v3 · published",
        "calls": "13,143",
        "err": "5.8",
        "errN": 5.8,
        "failed": 762,
        "cost": "10.51",
        "status": "healthy",
        "statusTag": "tag-neutral"
      }
    ],
    "apikeys": [
      {
        "name": "openai-prod",
        "service": "openai",
        "masked": "sk-…1u5726",
        "scope": "all agents",
        "usage": "$706 / ∞",
        "reset": "monthly",
        "created": "2026-06-15"
      },
      {
        "name": "anthropic-prod-1",
        "service": "anthropic",
        "masked": "sk-…3e5577",
        "scope": "2 agents",
        "usage": "$181 / $3194",
        "reset": "monthly",
        "created": "2026-01-22"
      },
      {
        "name": "groq-prod-2",
        "service": "groq",
        "masked": "sk-…35a243",
        "scope": "1 agents",
        "usage": "$302 / $1912",
        "reset": "monthly",
        "created": "2026-01-27"
      }
    ],
    "kbs": [
      {
        "name": "Help centre",
        "resources": 89,
        "chunks": "12,120",
        "embedding": "text-embedding-3-small",
        "usedBy": "1 agents",
        "updated": "4d ago"
      },
      {
        "name": "Product docs",
        "resources": 56,
        "chunks": "13,056",
        "embedding": "text-embedding-3-small",
        "usedBy": "1 agents",
        "updated": "11d ago"
      },
      {
        "name": "Policies",
        "resources": 74,
        "chunks": "1,636",
        "embedding": "text-embedding-3-small",
        "usedBy": "3 agents",
        "updated": "3d ago"
      }
    ],
    "tools": [
      {
        "name": "get_order",
        "endpoint": "https://api.orbitmedia.in/v1/get/order",
        "auth": "Bearer",
        "attached": "4 agents",
        "calls": "1,668",
        "fail": "3.7"
      },
      {
        "name": "create_ticket",
        "endpoint": "https://api.orbitmedia.in/v1/create/ticket",
        "auth": "Bearer",
        "attached": "1 agents",
        "calls": "1,267",
        "fail": "4.2"
      },
      {
        "name": "lookup_customer",
        "endpoint": "https://api.orbitmedia.in/v1/lookup/customer",
        "auth": "Bearer",
        "attached": "3 agents",
        "calls": "4,454",
        "fail": "4.8"
      },
      {
        "name": "send_email",
        "endpoint": "https://api.orbitmedia.in/v1/send/email",
        "auth": "PAuth",
        "attached": "2 agents",
        "calls": "3,540",
        "fail": "0.1"
      }
    ],
    "pauth": [
      {
        "name": "Production",
        "masked": "pauth_…ze",
        "by": "dev@orbitmedia.in",
        "lastUsed": "57h ago",
        "status": "active",
        "statusTag": "tag-neutral"
      },
      {
        "name": "CI / staging",
        "masked": "pauth_…4hf",
        "by": "dev@orbitmedia.in",
        "lastUsed": "11h ago",
        "status": "active",
        "statusTag": "tag-neutral"
      }
    ],
    "members": [
      {
        "name": "Priya Nair",
        "role": "admin",
        "email": "dev@orbitmedia.in",
        "lastActive": "24h ago",
        "joined": "2026-06-19"
      },
      {
        "name": "Arjun Mehta",
        "role": "editor",
        "email": "arjun@orbitmedia.in",
        "lastActive": "30h ago",
        "joined": "2026-02-25"
      }
    ],
    "usageService": [
      {
        "name": "anthropic",
        "pct": 100,
        "tokens": "44.8M",
        "cost": "36.53"
      },
      {
        "name": "neev_cloud",
        "pct": 74,
        "tokens": "33.3M",
        "cost": "25.21"
      },
      {
        "name": "groq",
        "pct": 34,
        "tokens": "15.4M",
        "cost": "3.69"
      },
      {
        "name": "openai",
        "pct": 20,
        "tokens": "9.1M",
        "cost": "20.18"
      }
    ],
    "usageModel": [
      {
        "name": "claude-sonnet-4",
        "pct": 100,
        "tokens": "44.8M",
        "cost": "36.53"
      },
      {
        "name": "llama-3.1-8b",
        "pct": 74,
        "tokens": "33.3M",
        "cost": "25.21"
      },
      {
        "name": "llama-3.3-70b",
        "pct": 34,
        "tokens": "15.4M",
        "cost": "3.69"
      },
      {
        "name": "gpt-4o",
        "pct": 20,
        "tokens": "9.1M",
        "cost": "20.18"
      }
    ],
    "daily": [
      {
        "label": "Day 1",
        "okH": 91,
        "errH": 9
      },
      {
        "label": "Day 2",
        "okH": 54,
        "errH": 1
      },
      {
        "label": "Day 3",
        "okH": 95,
        "errH": 5
      },
      {
        "label": "Day 4",
        "okH": 53,
        "errH": 4
      },
      {
        "label": "Day 5",
        "okH": 72,
        "errH": 1
      },
      {
        "label": "Day 6",
        "okH": 53,
        "errH": 1
      },
      {
        "label": "Day 7",
        "okH": 73,
        "errH": 4
      },
      {
        "label": "Day 8",
        "okH": 61,
        "errH": 6
      },
      {
        "label": "Day 9",
        "okH": 86,
        "errH": 1
      },
      {
        "label": "Day 10",
        "okH": 40,
        "errH": 1
      },
      {
        "label": "Day 11",
        "okH": 49,
        "errH": 10
      },
      {
        "label": "Day 12",
        "okH": 70,
        "errH": 9
      },
      {
        "label": "Day 13",
        "okH": 33,
        "errH": 11
      },
      {
        "label": "Day 14",
        "okH": 70,
        "errH": 5
      },
      {
        "label": "Day 15",
        "okH": 50,
        "errH": 5
      },
      {
        "label": "Day 16",
        "okH": 35,
        "errH": 3
      },
      {
        "label": "Day 17",
        "okH": 61,
        "errH": 6
      },
      {
        "label": "Day 18",
        "okH": 35,
        "errH": 4
      },
      {
        "label": "Day 19",
        "okH": 44,
        "errH": 4
      },
      {
        "label": "Day 20",
        "okH": 51,
        "errH": 6
      },
      {
        "label": "Day 21",
        "okH": 42,
        "errH": 11
      },
      {
        "label": "Day 22",
        "okH": 90,
        "errH": 6
      },
      {
        "label": "Day 23",
        "okH": 62,
        "errH": 9
      },
      {
        "label": "Day 24",
        "okH": 44,
        "errH": 7
      },
      {
        "label": "Day 25",
        "okH": 64,
        "errH": 1
      },
      {
        "label": "Day 26",
        "okH": 55,
        "errH": 6
      },
      {
        "label": "Day 27",
        "okH": 50,
        "errH": 6
      },
      {
        "label": "Day 28",
        "okH": 43,
        "errH": 5
      },
      {
        "label": "Day 29",
        "okH": 49,
        "errH": 1
      },
      {
        "label": "Day 30",
        "okH": 91,
        "errH": 1
      }
    ],
    "calls": 61340,
    "failed": 3347,
    "errRate": 5.45647212259537,
    "spend": 85.61,
    "wallet": 526,
    "walletUsd": "5.26",
    "walletSynced": "21 min ago",
    "failedDebits": 0,
    "ledger": [
      {
        "date": "2026-09-11 08:12",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "gpt-4o · 1.2M tokens",
        "credits": "-30",
        "color": "inherit",
        "balance": "526"
      },
      {
        "date": "2026-09-10 21:40",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "claude-sonnet-4 · 640k tokens",
        "credits": "-65",
        "color": "inherit",
        "balance": "563"
      },
      {
        "date": "2026-09-10 09:02",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "llama-3.3-70b · 2.1M tokens",
        "credits": "-12",
        "color": "inherit",
        "balance": "600"
      },
      {
        "date": "2026-09-08 14:30",
        "event": "topup",
        "tag": "tag-accent",
        "detail": "Manual top-up · ops@walkover.in",
        "credits": "+1000",
        "color": "var(--color-accent-700)",
        "balance": "637"
      },
      {
        "date": "2026-09-01 00:00",
        "event": "debit",
        "tag": "tag-neutral",
        "detail": "Monthly rollup · 18 agents",
        "credits": "-235",
        "color": "inherit",
        "balance": "674"
      },
      {
        "date": "2026-08-30 11:00",
        "event": "grant",
        "tag": "tag-accent",
        "detail": "Signup grant · credit_grant",
        "credits": "+500",
        "color": "var(--color-accent-700)",
        "balance": "711"
      }
    ],
    "status": "active",
    "statusTag": "tag-neutral",
    "blocked": false,
    "blockReason": "",
    "blockedBy": "",
    "blockedAt": "",
    "created": "2025-07-15",
    "lagoId": "cus_47720_524",
    "errColor": "var(--color-accent-700)"
  }
];

export const workspaceRows: WorkspaceRow[] = [
  {
    "id": "74145",
    "name": "Acme Corp",
    "owner": "priya@acme.io",
    "plan": "PAID",
    "planTag": "tag-accent",
    "agents": 7
  },
  {
    "id": "11643",
    "name": "Northwind Retail",
    "owner": "ops@northwind.co",
    "plan": "PAID",
    "planTag": "tag-accent",
    "agents": 12
  },
  {
    "id": "80211",
    "name": "Helix Health",
    "owner": "dev@helix.health",
    "plan": "FREE",
    "planTag": "tag-neutral",
    "agents": 7
  },
  {
    "id": "52930",
    "name": "Kite Logistics",
    "owner": "cto@kite.io",
    "plan": "PAID",
    "planTag": "tag-accent",
    "agents": 4
  },
  {
    "id": "66104",
    "name": "Papercut Studio",
    "owner": "hello@papercut.studio",
    "plan": "FREE",
    "planTag": "tag-neutral",
    "agents": 3
  },
  {
    "id": "30877",
    "name": "Bluefin Capital",
    "owner": "it@bluefin.vc",
    "plan": "PAID",
    "planTag": "tag-accent",
    "agents": 11
  },
  {
    "id": "91502",
    "name": "Tandem Labs",
    "owner": "team@tandemlabs.ai",
    "plan": "FREE",
    "planTag": "tag-neutral",
    "agents": 4
  },
  {
    "id": "47720",
    "name": "Orbit Media",
    "owner": "dev@orbitmedia.in",
    "plan": "FREE",
    "planTag": "tag-neutral",
    "agents": 6
  }
];

export const workspaceDetail: Record<string, { kpis: WorkspaceKpi[]; tabs: WorkspaceTab[] }> = {
  "11643": {
    "kpis": [
      {
        "label": "Calls · 30d",
        "value": "112.8k"
      },
      {
        "label": "Error rate",
        "value": "5.9%"
      },
      {
        "label": "Spend · 30d",
        "value": "$160.64"
      },
      {
        "label": "Wallet",
        "value": "30,006 cr"
      },
      {
        "label": "Members",
        "value": 6
      }
    ],
    "tabs": [
      {
        "label": "Agents",
        "count": 12
      },
      {
        "label": "API keys",
        "count": 2
      },
      {
        "label": "Knowledge bases",
        "count": 2
      },
      {
        "label": "Tools",
        "count": 2
      },
      {
        "label": "PAuth keys",
        "count": 2
      },
      {
        "label": "Members",
        "count": 6
      },
      {
        "label": "Usage",
        "count": ""
      },
      {
        "label": "Billing",
        "count": ""
      },
      {
        "label": "Embeds",
        "count": 1
      }
    ]
  },
  "30877": {
    "kpis": [
      {
        "label": "Calls · 30d",
        "value": "115.1k"
      },
      {
        "label": "Error rate",
        "value": "7.7%"
      },
      {
        "label": "Spend · 30d",
        "value": "$179.28"
      },
      {
        "label": "Wallet",
        "value": "9,108 cr"
      },
      {
        "label": "Members",
        "value": 2
      }
    ],
    "tabs": [
      {
        "label": "Agents",
        "count": 11
      },
      {
        "label": "API keys",
        "count": 3
      },
      {
        "label": "Knowledge bases",
        "count": 4
      },
      {
        "label": "Tools",
        "count": 4
      },
      {
        "label": "PAuth keys",
        "count": 2
      },
      {
        "label": "Members",
        "count": 2
      },
      {
        "label": "Usage",
        "count": ""
      },
      {
        "label": "Billing",
        "count": ""
      },
      {
        "label": "Embeds",
        "count": 0
      }
    ]
  },
  "47720": {
    "kpis": [
      {
        "label": "Calls · 30d",
        "value": "61.3k"
      },
      {
        "label": "Error rate",
        "value": "5.5%"
      },
      {
        "label": "Spend · 30d",
        "value": "$85.61"
      },
      {
        "label": "Wallet",
        "value": "526 cr"
      },
      {
        "label": "Members",
        "value": 2
      }
    ],
    "tabs": [
      {
        "label": "Agents",
        "count": 6
      },
      {
        "label": "API keys",
        "count": 3
      },
      {
        "label": "Knowledge bases",
        "count": 3
      },
      {
        "label": "Tools",
        "count": 4
      },
      {
        "label": "PAuth keys",
        "count": 2
      },
      {
        "label": "Members",
        "count": 2
      },
      {
        "label": "Usage",
        "count": ""
      },
      {
        "label": "Billing",
        "count": ""
      },
      {
        "label": "Embeds",
        "count": 0
      }
    ]
  },
  "52930": {
    "kpis": [
      {
        "label": "Calls · 30d",
        "value": "49.2k"
      },
      {
        "label": "Error rate",
        "value": "6.5%"
      },
      {
        "label": "Spend · 30d",
        "value": "$69.93"
      },
      {
        "label": "Wallet",
        "value": "33,609 cr"
      },
      {
        "label": "Members",
        "value": 2
      }
    ],
    "tabs": [
      {
        "label": "Agents",
        "count": 4
      },
      {
        "label": "API keys",
        "count": 1
      },
      {
        "label": "Knowledge bases",
        "count": 1
      },
      {
        "label": "Tools",
        "count": 2
      },
      {
        "label": "PAuth keys",
        "count": 2
      },
      {
        "label": "Members",
        "count": 2
      },
      {
        "label": "Usage",
        "count": ""
      },
      {
        "label": "Billing",
        "count": ""
      },
      {
        "label": "Embeds",
        "count": 0
      }
    ]
  },
  "66104": {
    "kpis": [
      {
        "label": "Calls · 30d",
        "value": "38.0k"
      },
      {
        "label": "Error rate",
        "value": "7.5%"
      },
      {
        "label": "Spend · 30d",
        "value": "$86.09"
      },
      {
        "label": "Wallet",
        "value": "168 cr"
      },
      {
        "label": "Members",
        "value": 2
      }
    ],
    "tabs": [
      {
        "label": "Agents",
        "count": 3
      },
      {
        "label": "API keys",
        "count": 1
      },
      {
        "label": "Knowledge bases",
        "count": 1
      },
      {
        "label": "Tools",
        "count": 3
      },
      {
        "label": "PAuth keys",
        "count": 1
      },
      {
        "label": "Members",
        "count": 2
      },
      {
        "label": "Usage",
        "count": ""
      },
      {
        "label": "Billing",
        "count": ""
      },
      {
        "label": "Embeds",
        "count": 1
      }
    ]
  },
  "74145": {
    "kpis": [
      {
        "label": "Calls · 30d",
        "value": "48.7k"
      },
      {
        "label": "Error rate",
        "value": "4.6%"
      },
      {
        "label": "Spend · 30d",
        "value": "$85.35"
      },
      {
        "label": "Wallet",
        "value": "7,595 cr"
      },
      {
        "label": "Members",
        "value": 6
      }
    ],
    "tabs": [
      {
        "label": "Agents",
        "count": 7
      },
      {
        "label": "API keys",
        "count": 2
      },
      {
        "label": "Knowledge bases",
        "count": 3
      },
      {
        "label": "Tools",
        "count": 3
      },
      {
        "label": "PAuth keys",
        "count": 1
      },
      {
        "label": "Members",
        "count": 6
      },
      {
        "label": "Usage",
        "count": ""
      },
      {
        "label": "Billing",
        "count": ""
      },
      {
        "label": "Embeds",
        "count": 2
      }
    ]
  },
  "80211": {
    "kpis": [
      {
        "label": "Calls · 30d",
        "value": "78.3k"
      },
      {
        "label": "Error rate",
        "value": "7.7%"
      },
      {
        "label": "Spend · 30d",
        "value": "$76.21"
      },
      {
        "label": "Wallet",
        "value": "752 cr"
      },
      {
        "label": "Members",
        "value": 5
      }
    ],
    "tabs": [
      {
        "label": "Agents",
        "count": 7
      },
      {
        "label": "API keys",
        "count": 2
      },
      {
        "label": "Knowledge bases",
        "count": 1
      },
      {
        "label": "Tools",
        "count": 1
      },
      {
        "label": "PAuth keys",
        "count": 1
      },
      {
        "label": "Members",
        "count": 5
      },
      {
        "label": "Usage",
        "count": ""
      },
      {
        "label": "Billing",
        "count": ""
      },
      {
        "label": "Embeds",
        "count": 1
      }
    ]
  },
  "91502": {
    "kpis": [
      {
        "label": "Calls · 30d",
        "value": "33.6k"
      },
      {
        "label": "Error rate",
        "value": "8.8%"
      },
      {
        "label": "Spend · 30d",
        "value": "$56.11"
      },
      {
        "label": "Wallet",
        "value": "842 cr"
      },
      {
        "label": "Members",
        "value": 5
      }
    ],
    "tabs": [
      {
        "label": "Agents",
        "count": 4
      },
      {
        "label": "API keys",
        "count": 3
      },
      {
        "label": "Knowledge bases",
        "count": 1
      },
      {
        "label": "Tools",
        "count": 3
      },
      {
        "label": "PAuth keys",
        "count": 2
      },
      {
        "label": "Members",
        "count": 5
      },
      {
        "label": "Usage",
        "count": ""
      },
      {
        "label": "Billing",
        "count": ""
      },
      {
        "label": "Embeds",
        "count": 1
      }
    ]
  }
};

export const blockedRows: BlockedRow[] = [
  {
    "id": "91502",
    "name": "Tandem Labs",
    "reason": "Credential stuffing against /public/login",
    "by": "ops@walkover.in",
    "at": "2026-09-09 17:22"
  }
];
