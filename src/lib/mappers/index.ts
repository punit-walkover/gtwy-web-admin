/**
 * The mapper layer (plan §1.3).
 *
 * Shape of the contract, which every page task from D1 on follows:
 *
 *   route  →  raw JSON      (numbers, ISO-8601 dates, enum codes)
 *   mapper →  `src/mocks/types.ts` shape   (the strings the design renders)
 *   page   →  unchanged
 *
 * A page never sees a raw number and a route never emits a formatted string;
 * `primitives.ts` is the only place a `"17.9k"` or a `"tag-accent"` is produced.
 *
 * One file per page area goes here — `workspaces.ts`, `overview.ts`, … — each
 * exporting `mapX(raw): X` for the types in `@/mocks/types`. They are added by
 * the task that owns the page, so this file grows one re-export at a time.
 */

export * from "./primitives";
export * from "./platformKeys";
export * from "./workspaces";
export * from "./admins";
export * from "./usage";
export * from "./billing";
export * from "./overview";
export * from "./embeds";
export * from "./blocked";
export * from "./audit";
