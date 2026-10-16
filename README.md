# GTWY.ai Admin UI

The platform operations console, built from the design prototype. **UI only** —
no API integration, no backend, no route handlers, no data-fetching server
actions. Every byte the browser loads comes from this app.

```bash
npm install
npm run dev      # http://localhost:3000
```

## Routes

| Route | Screen |
|---|---|
| `/login` | Sign in |
| `/` | Overview — last 24 hours |
| `/workspaces` | Organisations |
| `/workspaces/[orgId]` | Workspace detail — 9 tabs |
| `/blocked` | Blocked organisations |
| `/embeds` | Embeds |
| `/embeds/[embedId]` | Embed detail |
| `/usage` | Usage by service & model |
| `/billing/plans` | Billing plans |
| `/billing/keys` | Platform provider keys |
| `/access/admins` | Admin access |
| `/access/audit` | Login-as & audit log |

Both detail routes are prerendered from `generateStaticParams`, so all 14 routes
are static.

## Page states

Every page reads `?state=`:

- *(absent)* — the page with its mock data
- `?state=loading` — a shimmer that mirrors the real layout, not a spinner
- `?state=empty` — the empty branch
- `?state=error` — the accent-bordered error callout

The chrome — sidebar, header, breadcrumb, page kicker and title — stays rendered
in all four. `?impersonating=<target>` shows the login-as banner.

## Data

`src/mocks` is the only place data lives. Pages import from `@/mocks` and nowhere
else, and every accessor is a plain sync function returning a typed literal, so
swapping in a real client later is a one-file change.

The literals are the exact values the design prototype renders. The prototype
generates its data from a seeded PRNG; that generator was run **once, offline**,
and its output frozen here. The shipped app contains no generator.

## What is interactive

Navigation, tabs, dropdowns, the mobile drawer, the embed config toggles and all
six dialogs work. Search, filters, sort and pagination render as designed and do
**not** change the data. No form submits.

## Design system

`src/app/globals.css` holds every token from the design, already resolved against
its theme override. Nothing outside that file hardcodes a colour. Some things
worth knowing before you change anything:

- The app is light (`#f5f2ee`); the sidebar is a dark island (`#2a211c`). This is
  not a dark theme — there is no dark mode and no toggle.
- `--radius-sm/md/lg` are all `0`. The only round thing is the radio dot.
- Border weights carry meaning: 2px structural, 1px internal, 3px accent on the
  active nav item's left edge. The design's theme block flattens the sidebar
  edge, the header rule and `th` to 1px — that is deliberate, not a slip.
- Headings are Archivo 800 / `-0.015em` / `1.12`. Numbers use `tabular-nums`.
- Archivo is self-hosted from the three woff2 subsets in `public/fonts`, so the
  app makes no third-party requests.
- Every table is wrapped in `.table-wrap` (`overflow-x: auto`). That is how the
  tables survive 375px, so keep it if you add one.

## Responsive

Pixel-correct at 1440; the same components and tokens everywhere else. Above
768px the sidebar is fixed at 232px. At 768 and below it becomes a drawer, the
KPI strip goes 2-up, and dialogs go full-screen at 375.

## Checks

```bash
npx tsc --noEmit
npx next build
npx next lint
```
