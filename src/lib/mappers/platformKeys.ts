import type { PlatformKeyRow } from "@/mocks/types";
import { EM_DASH, istDate, orDash, thousands } from "./primitives";

/**
 * Platform keys (plan §5, page 08).
 *
 * The only non-obvious part of this page is the `billing_plans.services`
 * allowlist, which has two shapes in production. `BillingPlan.model.js:3-4`
 * defines it:
 *
 *   > `services` is an allowlist: "*", or a map of service -> "*" | [model_name],
 *   > where an absent service is denied.
 *
 * and `billingPlan.validation.js:5-16` enforces exactly those two forms. Both
 * are live right now — `free` carries the object, `paid` carries the bare `"*"`.
 *
 * Two questions fall out of that, and they have different answers:
 *
 *   - **Does plan P allow service S?** (the "Plans allowing" column) No universe
 *     needed. `"*"` is "nothing is denied", so a wildcard plan allows whatever
 *     service you name. See {@link planAllowsService}.
 *
 *   - **Which services does plan P allow?** (the missing-key callout, which runs
 *     the diff backwards) A wildcard has to be enumerated against something.
 *     See {@link planEnumeratedServices} for what, and why.
 */

// ------------------------------------------------------------------- raw ---

/** One `platform_apikeys` document, already masked by the route. */
export interface RawPlatformKey {
  service: string;
  /** Masked server-side by `maskStoredKey`. Plaintext never reaches here. */
  masked: string;
  updatedAt: string | null;
  updatedBy: string;
  /**
   * Service-level calls over 24h — see the note on `mapPlatformKeys`. `null`
   * when the metrics plane was unavailable, which renders as an em dash; a
   * service with no traffic is `0` and renders as `"0"`.
   */
  calls24h: number | null;
}

/** One `billing_plans` document, narrowed to what this page reads. */
export interface RawBillingPlanServices {
  planCode: string;
  displayName: string;
  /** Mixed in Mongo: `"*"` or `Record<string, "*" | string[]>`. */
  services: unknown;
}

export interface RawPlatformKeys {
  keys: RawPlatformKey[];
  plans: RawBillingPlanServices[];
  /**
   * The service universe a `"*"` plan expands over: `service_name` of every
   * `services` document with `status: 1`, which is precisely what
   * `loadServicesRegistry.js` loads and `service.controller.js`'s
   * `getAllServiceController` enumerates.
   */
  registryServices: string[];
}

// ------------------------------------------------------------- allowlist ---

function isAllowedValue(value: unknown): boolean {
  if (value === "*") return true;
  return Array.isArray(value) && value.length > 0;
}

/**
 * Does this plan's allowlist permit `service`?
 *
 * `"*"` denies nothing, so it allows any service named — including one absent
 * from the registry. That is the literal reading of the model comment, and it
 * is why `openai_completion` (a `status: 0` service that still holds a platform
 * key) shows the wildcard plan in its row while never appearing in the callout:
 * the row asks "is it denied?", the callout asks "what is allowed?".
 */
export function planAllowsService(services: unknown, service: string): boolean {
  if (services === "*") return true;
  if (!services || typeof services !== "object" || Array.isArray(services)) return false;
  return isAllowedValue((services as Record<string, unknown>)[service]);
}

/**
 * Every service this plan allows, as a concrete list.
 *
 * The object form enumerates itself. The bare `"*"` cannot — it is unbounded —
 * so it expands over the **active service registry**: `services` documents with
 * `status: 1`. That universe is gtwy-node's own, not one invented here;
 * `loadServicesRegistry.js` filters on `status: 1` and every service lookup in
 * gtwy-node goes through the registry it builds.
 *
 * The consequence is deliberate and worth stating: a wildcard plan makes the
 * callout list every registered service without a platform key, because that is
 * the true answer — wallet-billed traffic to any of them runs keyless.
 */
export function planEnumeratedServices(services: unknown, registryServices: string[]): string[] {
  if (services === "*") return [...registryServices];
  if (!services || typeof services !== "object" || Array.isArray(services)) return [];
  return Object.entries(services as Record<string, unknown>)
    .filter(([, value]) => isAllowedValue(value))
    .map(([service]) => service);
}

/**
 * The "Plans allowing" cell: display names of every plan that allows this
 * service, in `billing_plans` order, comma-separated. No plan allows it -> em
 * dash, the design's absent-value form.
 *
 * Every plan document counts, grandfathered ones included — an org still sits
 * on a `status: 0` plan and its traffic still needs a key.
 */
export function plansAllowing(plans: RawBillingPlanServices[], service: string): string {
  const allowing = plans.filter((plan) => planAllowsService(plan.services, service)).map((plan) => plan.displayName);
  return allowing.length > 0 ? allowing.join(", ") : EM_DASH;
}

/**
 * The callout, run backwards: services some plan allows that no platform key
 * covers. Sorted, so the copy is stable between reads.
 */
export function missingKeyServices(
  plans: RawBillingPlanServices[],
  keyedServices: string[],
  registryServices: string[],
): string[] {
  const keyed = new Set(keyedServices);
  const allowed = new Set<string>();
  for (const plan of plans) {
    for (const service of planEnumeratedServices(plan.services, registryServices)) {
      if (!keyed.has(service)) allowed.add(service);
    }
  }
  return [...allowed].sort();
}

// ---------------------------------------------------------------- mapper ---

/**
 * Raw route JSON -> the exact strings `src/mocks/types.ts` declares.
 *
 * `calls24h` is **service-level** traffic from `fifteen_minute_data`: it counts
 * every call to that service, including orgs on their own keys. There is no
 * per-key attribution in the metrics (gap 8). It is a volume indicator and no
 * label on this page says otherwise.
 */
export function mapPlatformKeys(raw: RawPlatformKeys): { rows: PlatformKeyRow[]; missing: string } {
  const rows: PlatformKeyRow[] = raw.keys.map((key) => ({
    service: key.service,
    masked: key.masked,
    updated: istDate(key.updatedAt),
    by: orDash(key.updatedBy),
    calls: key.calls24h === null ? EM_DASH : thousands(key.calls24h),
    plans: plansAllowing(raw.plans, key.service),
  }));

  const missing = missingKeyServices(
    raw.plans,
    raw.keys.map((key) => key.service),
    raw.registryServices,
  );

  // The page renders the callout only when this is a non-empty string.
  return { rows, missing: missing.join(", ") };
}
