// Frozen literals — the exact values the design prototype renders.
// Overview KPIs and the platform-wide usage roll-up.
// Generated once from the prototype's own seeded data; never recomputed at runtime.

import type { Kpi, FailingAgent, OrgRate, UsageBar, UsageModelRow } from "./types";

export const kpis: Kpi[] = [
  {
    "label": "Calls",
    "value": "17.9k",
    "delta": "+4.2% vs prior 24h",
    "deltaColor": "var(--color-neutral-700)"
  },
  {
    "label": "Success rate",
    "value": "93.26%",
    "delta": "−0.3 pt",
    "deltaColor": "var(--color-accent-700)"
  },
  {
    "label": "Failed calls",
    "value": "1.2k",
    "delta": "3 agents above 8% error",
    "deltaColor": "var(--color-accent-700)"
  },
  {
    "label": "p95 latency",
    "value": "2.84 s",
    "delta": "−120 ms",
    "deltaColor": "var(--color-neutral-700)"
  }
];

export const failingAgents: FailingAgent[] = [
  {
    "name": "Onboarding guide",
    "ws": "Bluefin Capital",
    "wsId": "30877",
    "model": "llama-3.3-70b",
    "calls": "16,846",
    "failed": "2,005",
    "rate": "11.9%",
    "pct": 71.4
  },
  {
    "name": "Contract reviewer",
    "ws": "Helix Health",
    "wsId": "80211",
    "model": "gpt-4o",
    "calls": "17,395",
    "failed": "1,948",
    "rate": "11.2%",
    "pct": 67.19999999999999
  },
  {
    "name": "Docs assistant",
    "ws": "Tandem Labs",
    "wsId": "91502",
    "model": "claude-sonnet-4",
    "calls": "13,994",
    "failed": "1,903",
    "rate": "13.6%",
    "pct": 81.6
  },
  {
    "name": "Refund policy QA",
    "ws": "Papercut Studio",
    "wsId": "66104",
    "model": "llama-3.1-8b",
    "calls": "13,261",
    "failed": "1,737",
    "rate": "13.1%",
    "pct": 78.6
  },
  {
    "name": "Support triage",
    "ws": "Kite Logistics",
    "wsId": "52930",
    "model": "claude-sonnet-4",
    "calls": "15,764",
    "failed": "1,608",
    "rate": "10.2%",
    "pct": 61.199999999999996
  },
  {
    "name": "Invoice extractor",
    "ws": "Northwind Retail",
    "wsId": "11643",
    "model": "claude-sonnet-4",
    "calls": "15,908",
    "failed": "1,607",
    "rate": "10.1%",
    "pct": 60.599999999999994
  },
  {
    "name": "Churn predictor",
    "ws": "Helix Health",
    "wsId": "80211",
    "model": "claude-sonnet-4",
    "calls": "16,327",
    "failed": "1,584",
    "rate": "9.7%",
    "pct": 58.199999999999996
  }
];

export const orgRates: OrgRate[] = [
  {
    "id": "91502",
    "name": "Tandem Labs",
    "calls": "33.6k",
    "success": "91.2"
  },
  {
    "id": "80211",
    "name": "Helix Health",
    "calls": "78.3k",
    "success": "92.3"
  },
  {
    "id": "30877",
    "name": "Bluefin Capital",
    "calls": "115.1k",
    "success": "92.3"
  },
  {
    "id": "66104",
    "name": "Papercut Studio",
    "calls": "38.0k",
    "success": "92.5"
  },
  {
    "id": "52930",
    "name": "Kite Logistics",
    "calls": "49.2k",
    "success": "93.5"
  },
  {
    "id": "11643",
    "name": "Northwind Retail",
    "calls": "112.8k",
    "success": "94.1"
  },
  {
    "id": "47720",
    "name": "Orbit Media",
    "calls": "61.3k",
    "success": "94.5"
  }
];

export const usageServices: UsageBar[] = [
  {
    "name": "openai",
    "pct": 100,
    "tokens": "252.5M",
    "cost": "224.02"
  },
  {
    "name": "anthropic",
    "pct": 100,
    "tokens": "251.3M",
    "cost": "244.62"
  },
  {
    "name": "neev_cloud",
    "pct": 54,
    "tokens": "137.2M",
    "cost": "132.40"
  },
  {
    "name": "groq",
    "pct": 36,
    "tokens": "89.7M",
    "cost": "103.32"
  },
  {
    "name": "open_router",
    "pct": 30,
    "tokens": "74.9M",
    "cost": "94.86"
  }
];

export const usageModels: UsageModelRow[] = [
  {
    "name": "claude-sonnet-4",
    "service": "anthropic",
    "calls": "167.6k",
    "tokens": "251.3M",
    "latency": "1.35 s",
    "success": "92.9",
    "color": "var(--color-accent-700)",
    "cost": "244.62"
  },
  {
    "name": "llama-3.1-8b",
    "service": "neev_cloud",
    "calls": "91.4k",
    "tokens": "137.2M",
    "latency": "1.20 s",
    "success": "93.4",
    "color": "inherit",
    "cost": "132.40"
  },
  {
    "name": "gpt-4o",
    "service": "openai",
    "calls": "84.9k",
    "tokens": "127.4M",
    "latency": "0.90 s",
    "success": "95.4",
    "color": "inherit",
    "cost": "96.07"
  },
  {
    "name": "gpt-4o-mini",
    "service": "openai",
    "calls": "83.4k",
    "tokens": "125.1M",
    "latency": "1.15 s",
    "success": "92.6",
    "color": "var(--color-accent-700)",
    "cost": "127.95"
  },
  {
    "name": "llama-3.3-70b",
    "service": "groq",
    "calls": "59.8k",
    "tokens": "89.7M",
    "latency": "1.25 s",
    "success": "92.9",
    "color": "var(--color-accent-700)",
    "cost": "103.32"
  },
  {
    "name": "deepseek-v3",
    "service": "open_router",
    "calls": "49.9k",
    "tokens": "74.9M",
    "latency": "1.15 s",
    "success": "92.4",
    "color": "var(--color-accent-700)",
    "cost": "94.86"
  }
];
