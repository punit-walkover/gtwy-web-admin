// Frozen literals — the exact values the design prototype renders.
// Embeds and their folder config.
// Generated once from the prototype's own seeded data; never recomputed at runtime.

import type { Embed, EmbedFlag, EmbedKpi, EmbedRow } from "./types";

export const embeds: Embed[] = [
  {
    "id": "fld_5h8307",
    "embedId": "emb_10652",
    "name": "Customer portal · Acme",
    "ws": "Acme Corp",
    "wsId": "74145",
    "agentsN": 3,
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
      }
    ],
    "users": 2544,
    "calls": 22021,
    "limit": "$247 / $4145 · monthly",
    "theme": "light",
    "slide": "right",
    "redirect": "https://app.acme.io/ai",
    "flags": {
      "showHomeButton": true,
      "showAgentTypeOnCreateAgent": false,
      "showHistory": false,
      "showConfigType": false,
      "showAdvancedParameters": true,
      "showCreateManuallyButton": true,
      "showAdvancedConfigurations": true,
      "showPreTool": true,
      "defaultOpen": false,
      "showFullScreenButton": true,
      "showCloseButton": true,
      "showHeader": true,
      "addDefaultApiKeys": false,
      "showResponseType": false,
      "showVariables": false,
      "showAgentName": false,
      "showGuide": false,
      "showPromptHelper": true,
      "showReviewAgent": false,
      "showMcp": false
    },
    "endUsers": [
      {
        "name": "user_4112@acme.io",
        "sessions": 75,
        "calls": 66,
        "last": "1h ago"
      },
      {
        "name": "user_7567@acme.io",
        "sessions": 22,
        "calls": 98,
        "last": "2h ago"
      },
      {
        "name": "user_7985@acme.io",
        "sessions": 78,
        "calls": 302,
        "last": "2h ago"
      },
      {
        "name": "user_1588@acme.io",
        "sessions": 77,
        "calls": 437,
        "last": "24h ago"
      },
      {
        "name": "user_4265@acme.io",
        "sessions": 41,
        "calls": 524,
        "last": "29h ago"
      }
    ]
  },
  {
    "id": "fld_5h9557",
    "embedId": "emb_84759",
    "name": "Internal console · Acme",
    "ws": "Acme Corp",
    "wsId": "74145",
    "agentsN": 3,
    "agents": [
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
      }
    ],
    "users": 695,
    "calls": 29622,
    "limit": "$845 / $4881 · monthly",
    "theme": "dark",
    "slide": "right",
    "redirect": "",
    "flags": {
      "showHomeButton": true,
      "showAgentTypeOnCreateAgent": false,
      "showHistory": false,
      "showConfigType": false,
      "showAdvancedParameters": true,
      "showCreateManuallyButton": true,
      "showAdvancedConfigurations": true,
      "showPreTool": true,
      "defaultOpen": false,
      "showFullScreenButton": true,
      "showCloseButton": true,
      "showHeader": true,
      "addDefaultApiKeys": false,
      "showResponseType": false,
      "showVariables": false,
      "showAgentName": false,
      "showGuide": false,
      "showPromptHelper": true,
      "showReviewAgent": false,
      "showMcp": false
    },
    "endUsers": [
      {
        "name": "user_4569@acme.io",
        "sessions": 18,
        "calls": 377,
        "last": "3h ago"
      },
      {
        "name": "user_7292@acme.io",
        "sessions": 47,
        "calls": 546,
        "last": "27h ago"
      },
      {
        "name": "user_8868@acme.io",
        "sessions": 34,
        "calls": 117,
        "last": "22h ago"
      },
      {
        "name": "user_9183@acme.io",
        "sessions": 70,
        "calls": 498,
        "last": "16h ago"
      },
      {
        "name": "user_5796@acme.io",
        "sessions": 62,
        "calls": 590,
        "last": "16h ago"
      }
    ]
  },
  {
    "id": "fld_5hi792",
    "embedId": "emb_75509",
    "name": "Customer portal · Northwind",
    "ws": "Northwind Retail",
    "wsId": "11643",
    "agentsN": 3,
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
      }
    ],
    "users": 1106,
    "calls": 39647,
    "limit": "$51 / $1651 · monthly",
    "theme": "light",
    "slide": "right",
    "redirect": "https://app.northwind.co/ai",
    "flags": {
      "showHomeButton": true,
      "showAgentTypeOnCreateAgent": false,
      "showHistory": false,
      "showConfigType": false,
      "showAdvancedParameters": true,
      "showCreateManuallyButton": true,
      "showAdvancedConfigurations": true,
      "showPreTool": true,
      "defaultOpen": false,
      "showFullScreenButton": true,
      "showCloseButton": true,
      "showHeader": true,
      "addDefaultApiKeys": false,
      "showResponseType": false,
      "showVariables": false,
      "showAgentName": false,
      "showGuide": false,
      "showPromptHelper": true,
      "showReviewAgent": false,
      "showMcp": false
    },
    "endUsers": [
      {
        "name": "user_2579@northwind.co",
        "sessions": 70,
        "calls": 342,
        "last": "20h ago"
      },
      {
        "name": "user_8127@northwind.co",
        "sessions": 63,
        "calls": 141,
        "last": "6h ago"
      },
      {
        "name": "user_8081@northwind.co",
        "sessions": 6,
        "calls": 421,
        "last": "25h ago"
      },
      {
        "name": "user_7999@northwind.co",
        "sessions": 6,
        "calls": 279,
        "last": "23h ago"
      },
      {
        "name": "user_4102@northwind.co",
        "sessions": 52,
        "calls": 364,
        "last": "24h ago"
      }
    ]
  },
  {
    "id": "fld_5hs327",
    "embedId": "emb_20959",
    "name": "Customer portal · Helix",
    "ws": "Helix Health",
    "wsId": "80211",
    "agentsN": 3,
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
      }
    ],
    "users": 3105,
    "calls": 40866,
    "limit": "$525 / $2372 · monthly",
    "theme": "light",
    "slide": "right",
    "redirect": "https://app.helix.health/ai",
    "flags": {
      "showHomeButton": true,
      "showAgentTypeOnCreateAgent": false,
      "showHistory": false,
      "showConfigType": false,
      "showAdvancedParameters": true,
      "showCreateManuallyButton": true,
      "showAdvancedConfigurations": true,
      "showPreTool": true,
      "defaultOpen": false,
      "showFullScreenButton": true,
      "showCloseButton": true,
      "showHeader": true,
      "addDefaultApiKeys": false,
      "showResponseType": false,
      "showVariables": false,
      "showAgentName": false,
      "showGuide": false,
      "showPromptHelper": true,
      "showReviewAgent": false,
      "showMcp": false
    },
    "endUsers": [
      {
        "name": "user_7615@helix.health",
        "sessions": 78,
        "calls": 436,
        "last": "3h ago"
      },
      {
        "name": "user_9209@helix.health",
        "sessions": 76,
        "calls": 218,
        "last": "24h ago"
      },
      {
        "name": "user_2432@helix.health",
        "sessions": 50,
        "calls": 40,
        "last": "17h ago"
      },
      {
        "name": "user_6507@helix.health",
        "sessions": 6,
        "calls": 453,
        "last": "21h ago"
      },
      {
        "name": "user_3323@helix.health",
        "sessions": 38,
        "calls": 191,
        "last": "3h ago"
      }
    ]
  },
  {
    "id": "fld_5ic843",
    "embedId": "emb_65829",
    "name": "Customer portal · Papercut",
    "ws": "Papercut Studio",
    "wsId": "66104",
    "agentsN": 3,
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
    "users": 3673,
    "calls": 38043,
    "limit": "$74 / $2363 · monthly",
    "theme": "light",
    "slide": "right",
    "redirect": "https://app.papercut.studio/ai",
    "flags": {
      "showHomeButton": true,
      "showAgentTypeOnCreateAgent": false,
      "showHistory": false,
      "showConfigType": false,
      "showAdvancedParameters": true,
      "showCreateManuallyButton": true,
      "showAdvancedConfigurations": true,
      "showPreTool": true,
      "defaultOpen": false,
      "showFullScreenButton": true,
      "showCloseButton": true,
      "showHeader": true,
      "addDefaultApiKeys": false,
      "showResponseType": false,
      "showVariables": false,
      "showAgentName": false,
      "showGuide": false,
      "showPromptHelper": true,
      "showReviewAgent": false,
      "showMcp": false
    },
    "endUsers": [
      {
        "name": "user_2815@papercut.studio",
        "sessions": 40,
        "calls": 705,
        "last": "11h ago"
      },
      {
        "name": "user_6344@papercut.studio",
        "sessions": 30,
        "calls": 690,
        "last": "24h ago"
      },
      {
        "name": "user_5391@papercut.studio",
        "sessions": 71,
        "calls": 440,
        "last": "18h ago"
      },
      {
        "name": "user_1846@papercut.studio",
        "sessions": 10,
        "calls": 76,
        "last": "26h ago"
      },
      {
        "name": "user_1264@papercut.studio",
        "sessions": 31,
        "calls": 478,
        "last": "22h ago"
      }
    ]
  },
  {
    "id": "fld_5iw886",
    "embedId": "emb_61510",
    "name": "Customer portal · Tandem",
    "ws": "Tandem Labs",
    "wsId": "91502",
    "agentsN": 3,
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
      }
    ],
    "users": 2284,
    "calls": 19082,
    "limit": "$67 / $2575 · monthly",
    "theme": "light",
    "slide": "right",
    "redirect": "https://app.tandemlabs.ai/ai",
    "flags": {
      "showHomeButton": true,
      "showAgentTypeOnCreateAgent": false,
      "showHistory": false,
      "showConfigType": false,
      "showAdvancedParameters": true,
      "showCreateManuallyButton": true,
      "showAdvancedConfigurations": true,
      "showPreTool": true,
      "defaultOpen": false,
      "showFullScreenButton": true,
      "showCloseButton": true,
      "showHeader": true,
      "addDefaultApiKeys": false,
      "showResponseType": false,
      "showVariables": false,
      "showAgentName": false,
      "showGuide": false,
      "showPromptHelper": true,
      "showReviewAgent": false,
      "showMcp": false
    },
    "endUsers": [
      {
        "name": "user_9985@tandemlabs.ai",
        "sessions": 20,
        "calls": 372,
        "last": "13h ago"
      },
      {
        "name": "user_9005@tandemlabs.ai",
        "sessions": 5,
        "calls": 252,
        "last": "14h ago"
      },
      {
        "name": "user_7098@tandemlabs.ai",
        "sessions": 76,
        "calls": 281,
        "last": "24h ago"
      },
      {
        "name": "user_8822@tandemlabs.ai",
        "sessions": 71,
        "calls": 648,
        "last": "14h ago"
      },
      {
        "name": "user_6397@tandemlabs.ai",
        "sessions": 76,
        "calls": 120,
        "last": "27h ago"
      }
    ]
  }
];

export const embedRows: EmbedRow[] = [
  {
    "id": "fld_5h8307",
    "name": "Customer portal · Acme",
    "ws": "Acme Corp",
    "wsId": "74145",
    "agents": 3,
    "users": "2,544",
    "limit": "$247 / $4145 · monthly",
    "theme": "light"
  },
  {
    "id": "fld_5h9557",
    "name": "Internal console · Acme",
    "ws": "Acme Corp",
    "wsId": "74145",
    "agents": 3,
    "users": "695",
    "limit": "$845 / $4881 · monthly",
    "theme": "dark"
  },
  {
    "id": "fld_5hi792",
    "name": "Customer portal · Northwind",
    "ws": "Northwind Retail",
    "wsId": "11643",
    "agents": 3,
    "users": "1,106",
    "limit": "$51 / $1651 · monthly",
    "theme": "light"
  },
  {
    "id": "fld_5hs327",
    "name": "Customer portal · Helix",
    "ws": "Helix Health",
    "wsId": "80211",
    "agents": 3,
    "users": "3,105",
    "limit": "$525 / $2372 · monthly",
    "theme": "light"
  },
  {
    "id": "fld_5ic843",
    "name": "Customer portal · Papercut",
    "ws": "Papercut Studio",
    "wsId": "66104",
    "agents": 3,
    "users": "3,673",
    "limit": "$74 / $2363 · monthly",
    "theme": "light"
  },
  {
    "id": "fld_5iw886",
    "name": "Customer portal · Tandem",
    "ws": "Tandem Labs",
    "wsId": "91502",
    "agents": 3,
    "users": "2,284",
    "limit": "$67 / $2575 · monthly",
    "theme": "light"
  }
];

export const embedDetail: Record<string, { kpis: EmbedKpi[]; flagOrder: EmbedFlag[] }> = {
  "fld_5h8307": {
    "kpis": [
      {
        "label": "Agents",
        "value": 3
      },
      {
        "label": "End users",
        "value": "2,544"
      },
      {
        "label": "Calls · 30d",
        "value": "22.0k"
      },
      {
        "label": "Error rate",
        "value": "4.1%"
      }
    ],
    "flagOrder": [
      "showHomeButton",
      "showAgentTypeOnCreateAgent",
      "showHistory",
      "showConfigType",
      "showAdvancedParameters",
      "showCreateManuallyButton",
      "showAdvancedConfigurations",
      "showPreTool",
      "defaultOpen",
      "showFullScreenButton",
      "showCloseButton",
      "showHeader",
      "addDefaultApiKeys",
      "showResponseType",
      "showVariables",
      "showAgentName",
      "showGuide",
      "showPromptHelper",
      "showReviewAgent",
      "showMcp"
    ]
  },
  "fld_5h9557": {
    "kpis": [
      {
        "label": "Agents",
        "value": 3
      },
      {
        "label": "End users",
        "value": "695"
      },
      {
        "label": "Calls · 30d",
        "value": "29.6k"
      },
      {
        "label": "Error rate",
        "value": "2.2%"
      }
    ],
    "flagOrder": [
      "showHomeButton",
      "showAgentTypeOnCreateAgent",
      "showHistory",
      "showConfigType",
      "showAdvancedParameters",
      "showCreateManuallyButton",
      "showAdvancedConfigurations",
      "showPreTool",
      "defaultOpen",
      "showFullScreenButton",
      "showCloseButton",
      "showHeader",
      "addDefaultApiKeys",
      "showResponseType",
      "showVariables",
      "showAgentName",
      "showGuide",
      "showPromptHelper",
      "showReviewAgent",
      "showMcp"
    ]
  },
  "fld_5hi792": {
    "kpis": [
      {
        "label": "Agents",
        "value": 3
      },
      {
        "label": "End users",
        "value": "1,106"
      },
      {
        "label": "Calls · 30d",
        "value": "39.6k"
      },
      {
        "label": "Error rate",
        "value": "5.9%"
      }
    ],
    "flagOrder": [
      "showHomeButton",
      "showAgentTypeOnCreateAgent",
      "showHistory",
      "showConfigType",
      "showAdvancedParameters",
      "showCreateManuallyButton",
      "showAdvancedConfigurations",
      "showPreTool",
      "defaultOpen",
      "showFullScreenButton",
      "showCloseButton",
      "showHeader",
      "addDefaultApiKeys",
      "showResponseType",
      "showVariables",
      "showAgentName",
      "showGuide",
      "showPromptHelper",
      "showReviewAgent",
      "showMcp"
    ]
  },
  "fld_5hs327": {
    "kpis": [
      {
        "label": "Agents",
        "value": 3
      },
      {
        "label": "End users",
        "value": "3,105"
      },
      {
        "label": "Calls · 30d",
        "value": "40.9k"
      },
      {
        "label": "Error rate",
        "value": "5.0%"
      }
    ],
    "flagOrder": [
      "showHomeButton",
      "showAgentTypeOnCreateAgent",
      "showHistory",
      "showConfigType",
      "showAdvancedParameters",
      "showCreateManuallyButton",
      "showAdvancedConfigurations",
      "showPreTool",
      "defaultOpen",
      "showFullScreenButton",
      "showCloseButton",
      "showHeader",
      "addDefaultApiKeys",
      "showResponseType",
      "showVariables",
      "showAgentName",
      "showGuide",
      "showPromptHelper",
      "showReviewAgent",
      "showMcp"
    ]
  },
  "fld_5ic843": {
    "kpis": [
      {
        "label": "Agents",
        "value": 3
      },
      {
        "label": "End users",
        "value": "3,673"
      },
      {
        "label": "Calls · 30d",
        "value": "38.0k"
      },
      {
        "label": "Error rate",
        "value": "7.0%"
      }
    ],
    "flagOrder": [
      "showHomeButton",
      "showAgentTypeOnCreateAgent",
      "showHistory",
      "showConfigType",
      "showAdvancedParameters",
      "showCreateManuallyButton",
      "showAdvancedConfigurations",
      "showPreTool",
      "defaultOpen",
      "showFullScreenButton",
      "showCloseButton",
      "showHeader",
      "addDefaultApiKeys",
      "showResponseType",
      "showVariables",
      "showAgentName",
      "showGuide",
      "showPromptHelper",
      "showReviewAgent",
      "showMcp"
    ]
  },
  "fld_5iw886": {
    "kpis": [
      {
        "label": "Agents",
        "value": 3
      },
      {
        "label": "End users",
        "value": "2,284"
      },
      {
        "label": "Calls · 30d",
        "value": "19.1k"
      },
      {
        "label": "Error rate",
        "value": "10.3%"
      }
    ],
    "flagOrder": [
      "showHomeButton",
      "showAgentTypeOnCreateAgent",
      "showHistory",
      "showConfigType",
      "showAdvancedParameters",
      "showCreateManuallyButton",
      "showAdvancedConfigurations",
      "showPreTool",
      "defaultOpen",
      "showFullScreenButton",
      "showCloseButton",
      "showHeader",
      "addDefaultApiKeys",
      "showResponseType",
      "showVariables",
      "showAgentName",
      "showGuide",
      "showPromptHelper",
      "showReviewAgent",
      "showMcp"
    ]
  }
};

export const wsEmbedRows: Record<string, EmbedRow[]> = {
  "11643": [
    {
      "id": "fld_5hi792",
      "name": "Customer portal · Northwind",
      "ws": "Northwind Retail",
      "wsId": "11643",
      "agents": 3,
      "users": "1,106",
      "limit": "$51 / $1651 · monthly",
      "theme": "light"
    }
  ],
  "30877": [],
  "47720": [],
  "52930": [],
  "66104": [
    {
      "id": "fld_5ic843",
      "name": "Customer portal · Papercut",
      "ws": "Papercut Studio",
      "wsId": "66104",
      "agents": 3,
      "users": "3,673",
      "limit": "$74 / $2363 · monthly",
      "theme": "light"
    }
  ],
  "74145": [
    {
      "id": "fld_5h8307",
      "name": "Customer portal · Acme",
      "ws": "Acme Corp",
      "wsId": "74145",
      "agents": 3,
      "users": "2,544",
      "limit": "$247 / $4145 · monthly",
      "theme": "light"
    },
    {
      "id": "fld_5h9557",
      "name": "Internal console · Acme",
      "ws": "Acme Corp",
      "wsId": "74145",
      "agents": 3,
      "users": "695",
      "limit": "$845 / $4881 · monthly",
      "theme": "dark"
    }
  ],
  "80211": [
    {
      "id": "fld_5hs327",
      "name": "Customer portal · Helix",
      "ws": "Helix Health",
      "wsId": "80211",
      "agents": 3,
      "users": "3,105",
      "limit": "$525 / $2372 · monthly",
      "theme": "light"
    }
  ],
  "91502": [
    {
      "id": "fld_5iw886",
      "name": "Customer portal · Tandem",
      "ws": "Tandem Labs",
      "wsId": "91502",
      "agents": 3,
      "users": "2,284",
      "limit": "$67 / $2575 · monthly",
      "theme": "light"
    }
  ]
};
