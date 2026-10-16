import "server-only";

/**
 * A process-local TTL cache. Plan §4.1 asks for a 5-minute server-side cache in
 * front of msg91 so an admin page-load does not fan out one upstream call per
 * route. There is no Redis (plan §2.3), so this is per-process and cold after a
 * deploy — acceptable for a read cache whose miss path is simply slower.
 *
 * In-flight requests share a promise, so ten concurrent routes asking for the
 * org list issue one upstream call, not ten.
 */

interface Entry<T> {
  value: Promise<T>;
  expiresAt: number;
}

const store = new Map<string, Entry<unknown>>();

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) return hit.value as Promise<T>;

  const value = load();
  store.set(key, { value, expiresAt: now + ttlMs });

  try {
    return await value;
  } catch (err) {
    // A failed load must not be cached for the full TTL.
    if (store.get(key)?.value === value) store.delete(key);
    throw err;
  }
}

/** Test and diagnostics only. */
export function clearCache(): void {
  store.clear();
}
