import { ok } from "@/lib/api/envelope";
import { withAdmin } from "@/lib/auth/withAdmin";
import { maskStoredKey } from "@/lib/crypto/platformKey";
import { MONGO_MAX_TIME_MS, collection } from "@/lib/db/mongo";
import { queryOrNull } from "@/lib/db/sql";
import type { RawBillingPlanServices, RawPlatformKey, RawPlatformKeys } from "@/lib/mappers/platformKeys";

/**
 * `GET /api/admin/platform-keys` → the Platform keys page (plan §5, page 08).
 *
 * Four reads, one payload:
 *
 *   - `platform_apikeys` — mirrors `platformApiKey.controller.js#listPlatformApiKeys`:
 *     `find({})`, natural order, key decrypted then masked, never returned raw.
 *     Its `try/catch` around the decrypt lives inside `maskStoredKey`, which
 *     yields a fixed placeholder instead of gtwy-node's `<undecryptable>`.
 *   - `billing_plans` — `find({}).sort({ plan_code: 1 })`, the order
 *     `billingPlan.service.js#listPlans` uses, so "Plans allowing" reads
 *     "Free, Pro" rather than whichever order Mongo felt like.
 *   - `services` where `status: 1` — the active registry
 *     (`loadServicesRegistry.js`), which is the universe a `services: "*"` plan
 *     expands over. Only the callout needs it; see the mapper.
 *   - `fifteen_minute_data` — 24h call volume per service (plan §4.3).
 *
 * **`calls24h` is service-level traffic** (plan gap 8 / Q41). It counts every
 * call to that service, including orgs on their own keys, because no metrics
 * table carries per-key attribution. It is a volume indicator and nothing on
 * this page says otherwise.
 *
 * Read-only throughout. Nothing here writes.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** `platform_apikeys`, as stored. `apikey` is ciphertext and stays server-side. */
interface PlatformApiKeyDoc {
  service?: string;
  apikey?: string;
  updated_by?: string;
  updated_at?: Date | string | null;
}

interface BillingPlanDoc {
  plan_code?: string;
  display_name?: string;
  services?: unknown;
}

interface ServiceDoc {
  service_name?: string;
}

/**
 * 24h calls per service. `record_count` is the row count the aggregate rolled
 * up — the same denominator `metrics.controller.js` divides `latency_sum` by —
 * so it is total calls, not successful ones.
 *
 * The service list is bound, not interpolated: plan §4.3 rules out gtwy-node's
 * `buildWhereClause` string-building outright.
 */
const CALLS_24H_SQL = `
  SELECT service, SUM(record_count)::bigint AS calls
    FROM fifteen_minute_data
   WHERE created_at >= NOW() - INTERVAL '24 hours'
     AND service = ANY($1)
   GROUP BY service
`;

async function calls24hByService(services: string[]): Promise<Map<string, number> | null> {
  if (services.length === 0) return new Map();

  // Slow or unavailable metrics degrade this one column rather than the page —
  // the keys themselves are the point of it (plan §4.4's pattern).
  const rows = await queryOrNull<{ service: string; calls: string }>("timescale", CALLS_24H_SQL, [services]);
  if (rows === null) return null;

  return new Map(rows.map((row) => [row.service, Number(row.calls)]));
}

export const GET = withAdmin(async () => {
  const [keyDocs, planDocs, serviceDocs] = await Promise.all([
    (await collection<PlatformApiKeyDoc>("platform_apikeys")).find({}, { maxTimeMS: MONGO_MAX_TIME_MS }).toArray(),
    (await collection<BillingPlanDoc>("billing_plans"))
      .find({}, { maxTimeMS: MONGO_MAX_TIME_MS })
      .sort({ plan_code: 1 })
      .toArray(),
    (await collection<ServiceDoc>("services")).find({ status: 1 }, { maxTimeMS: MONGO_MAX_TIME_MS }).toArray(),
  ]);

  const services = keyDocs.map((doc) => String(doc.service ?? ""));
  const calls = await calls24hByService(services.filter(Boolean));

  const keys: RawPlatformKey[] = keyDocs.map((doc) => {
    const service = String(doc.service ?? "");
    return {
      service,
      // Decrypt-then-mask, exactly as gtwy-node does. Ciphertext and plaintext
      // both stop here.
      masked: maskStoredKey(doc.apikey),
      updatedAt: doc.updated_at ? new Date(doc.updated_at).toISOString() : null,
      updatedBy: doc.updated_by ?? "",
      // A service with no traffic in the window is a real 0; only an
      // unavailable metrics plane is `null`.
      calls24h: calls === null ? null : (calls.get(service) ?? 0),
    };
  });

  const plans: RawBillingPlanServices[] = planDocs.map((doc) => ({
    planCode: String(doc.plan_code ?? ""),
    displayName: String(doc.display_name ?? doc.plan_code ?? ""),
    services: doc.services,
  }));

  const registryServices = serviceDocs.map((doc) => String(doc.service_name ?? "")).filter(Boolean);

  const payload: RawPlatformKeys = { keys, plans, registryServices };
  return ok(payload);
});
