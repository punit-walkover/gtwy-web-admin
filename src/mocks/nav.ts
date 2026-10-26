/** Sidebar sections, labels and indices — the design numbers 01–09 across three sections. */

export interface NavItem {
  kind: "item";
  idx: string;
  label: string;
  href: string;
  /** Routes that keep this item active (detail pages keep their list page lit). */
  match: string[];
}

export interface NavSection {
  kind: "section";
  label: string;
}

export type NavEntry = NavSection | NavItem;

export const navEntries: NavEntry[] = [
  { kind: "section", label: "Operate" },
  { kind: "item", idx: "01", label: "Overview", href: "/", match: ["/"] },
  {
    kind: "item",
    idx: "02",
    label: "Workspaces",
    href: "/workspaces",
    match: ["/workspaces"],
  },
  { kind: "item", idx: "03", label: "Blocked orgs", href: "/blocked", match: ["/blocked"] },
  { kind: "item", idx: "04", label: "Embeds", href: "/embeds", match: ["/embeds"] },
  {
    kind: "item",
    idx: "05",
    label: "Usage by service / model",
    href: "/usage",
    match: ["/usage"],
  },
  { kind: "section", label: "Billing" },
  {
    kind: "item",
    idx: "06",
    label: "Billing plans",
    href: "/billing/plans",
    match: ["/billing/plans"],
  },
  {
    kind: "item",
    idx: "07",
    label: "Platform keys",
    href: "/billing/keys",
    match: ["/billing/keys"],
  },
  { kind: "section", label: "Access" },
  {
    kind: "item",
    idx: "08",
    label: "Admin access",
    href: "/access/admins",
    match: ["/access/admins"],
  },
  {
    kind: "item",
    idx: "09",
    label: "Login-as & audit log",
    href: "/access/audit",
    match: ["/access/audit"],
  },
];

/** Exact breadcrumb strings from the design's `crumbMap`. */
export const breadcrumbs: Record<string, string> = {
  "/": "Overview",
  "/workspaces": "Workspaces",
  "/blocked": "Blocked orgs",
  "/embeds": "Embeds",
  "/usage": "Usage",
  "/billing/plans": "Billing / Plans",
  "/billing/keys": "Billing / Platform keys",
  "/access/admins": "Platform / Admin access",
  "/access/audit": "Access / Audit log",
};

export const headerSearchPlaceholder =
  "Search workspace by name, org id or member e-mail";

/** Routes whose header box searches something other than workspaces. */
export const headerSearchPlaceholders: Record<string, string> = {
  "/usage": "Search models by name or service",
  "/billing/keys": "Search keys by service or plan",
};
