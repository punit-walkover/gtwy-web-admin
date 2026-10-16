import "server-only";

import { Pool, type PoolConfig, type QueryResultRow } from "pg";

import { env, SQL_STATEMENT_TIMEOUT_MS } from "@/lib/env";
import { UpstreamError } from "@/lib/clients/http";

/**
 * Postgres (`conversation_logs`) and Timescale (`metrics_raw_data`,
 * `fifteen_minute_data`, `daily_data`) — pooled, read-only, 5 s statement
 * timeout.
 *
 * **Every value is a bind parameter.** gtwy-node's
 * `metrics.utils.js#buildWhereClause` interpolates values straight into the SQL
 * string; plan §4.3 says explicitly that we do not copy that pattern. `query()`
 * below takes `(text, params)` and there is no string-building helper in this
 * module for a caller to reach for instead.
 *
 * `statement_timeout` is set per-pool rather than per-query so a query that
 * forgets it still cannot run long. Postgres cancels the statement server-side,
 * which is what we want for the p95-over-`conversation_logs` case in plan §4.4:
 * it returns an error we map to `null`, it does not hold a connection.
 */

const globalForSql = globalThis as typeof globalThis & {
  __adminPgPool?: Pool;
  __adminTimescalePool?: Pool;
};

/** Postgres error code for a statement cancelled by `statement_timeout`. */
export const QUERY_CANCELED = "57014";

function basePoolConfig(): PoolConfig {
  return {
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: SQL_STATEMENT_TIMEOUT_MS,
    // Applied by the driver on every connection in the pool.
    statement_timeout: SQL_STATEMENT_TIMEOUT_MS,
    query_timeout: SQL_STATEMENT_TIMEOUT_MS,
  };
}

function postgresPool(): Pool {
  globalForSql.__adminPgPool ??= new Pool({ ...basePoolConfig(), ...env.postgres() });
  return globalForSql.__adminPgPool;
}

function timescalePool(): Pool {
  if (!globalForSql.__adminTimescalePool) {
    const url = env.timescaleUrl();
    if (url) {
      // gtwy-node's config/timescale_config.js connects by URL with SSL
      // required and `rejectUnauthorized: false` (managed cert).
      globalForSql.__adminTimescalePool = new Pool({
        ...basePoolConfig(),
        connectionString: url,
        ssl: { rejectUnauthorized: false },
      });
    } else {
      const parts = env.timescaleParts();
      if (!parts.host || !parts.database || !parts.user) {
        throw new Error("Missing Timescale configuration: set TIMESCALE_SERVICE_URL, or TIMESCALE_HOST/TIMESCALE_DB/TIMESCALE_USER/TIMESCALE_PASSWORD");
      }
      globalForSql.__adminTimescalePool = new Pool({
        ...basePoolConfig(),
        host: parts.host,
        port: parts.port,
        database: parts.database,
        user: parts.user,
        password: parts.password,
        ssl: { rejectUnauthorized: false },
      });
    }
  }
  return globalForSql.__adminTimescalePool;
}

export type SqlPlane = "postgres" | "timescale";

function poolFor(plane: SqlPlane): Pool {
  return plane === "postgres" ? postgresPool() : timescalePool();
}

/**
 * The only way to run SQL in this codebase.
 *
 * @param text   parameterised SQL — `$1`, `$2`, … Never interpolate a value.
 * @param params bind parameters, in order.
 */
export async function query<R extends QueryResultRow = QueryResultRow>(
  plane: SqlPlane,
  text: string,
  params: ReadonlyArray<unknown> = [],
): Promise<R[]> {
  try {
    const result = await poolFor(plane).query<R>(text, params as unknown[]);
    return result.rows;
  } catch (cause) {
    if (isTimeout(cause)) {
      throw new UpstreamError(plane, null, `statement exceeded ${SQL_STATEMENT_TIMEOUT_MS}ms`, { cause });
    }
    throw new UpstreamError(plane, null, "query failed", { cause });
  }
}

/** True when the failure was the 5 s statement timeout rather than a bad query. */
export function isTimeout(err: unknown): boolean {
  if (err instanceof UpstreamError) return err.message.includes("exceeded");
  const code = (err as { code?: string } | null)?.code;
  if (code === QUERY_CANCELED) return true;
  const message = err instanceof Error ? err.message : "";
  return message.includes("timeout") || message.includes("Query read timeout");
}

/**
 * Runs a query that is allowed to be too slow. Plan §4.4: if the 7d/30d p95 over
 * `conversation_logs` exceeds the statement timeout the KPI returns `null` and
 * the page renders "—" — we may not add an index to an existing table.
 */
export async function queryOrNull<R extends QueryResultRow = QueryResultRow>(
  plane: SqlPlane,
  text: string,
  params: ReadonlyArray<unknown> = [],
): Promise<R[] | null> {
  try {
    return await query<R>(plane, text, params);
  } catch (err) {
    if (isTimeout(err)) {
      console.warn(`[admin-api] ${plane} query timed out, degrading to null`);
      return null;
    }
    throw err;
  }
}

export async function closeSql(): Promise<void> {
  const pools = [globalForSql.__adminPgPool, globalForSql.__adminTimescalePool];
  globalForSql.__adminPgPool = undefined;
  globalForSql.__adminTimescalePool = undefined;
  await Promise.all(pools.map((p) => p?.end()));
}
