import "server-only";

// `Document` must come from the driver: the DOM lib declares one too, and
// without this import `collection<T>` constrains T to the *browser's* Document.
import { MongoClient, type Db, type Document } from "mongodb";

import { env, SQL_STATEMENT_TIMEOUT_MS } from "@/lib/env";

/**
 * One pooled Mongo connection for the whole process (plan §4.5, Q49).
 *
 * Reads go through `collection()`. The single write in this codebase is
 * `src/lib/audit/writeAudit.ts`; no other module may call an insert, update or
 * delete — see the guard test in `tests/no-writes.test.ts`.
 *
 * Next dev hot-reloads modules, so the client is parked on `globalThis` to stop
 * every edit opening a new pool.
 */

const globalForMongo = globalThis as typeof globalThis & {
  __adminMongo?: Promise<MongoClient>;
};

function connect(): Promise<MongoClient> {
  const client = new MongoClient(env.mongoUri(), {
    maxPoolSize: 10,
    minPoolSize: 0,
    // Mirrors the 5 s ceiling the SQL pools use, so one slow plane cannot hold
    // a page open past its budget.
    serverSelectionTimeoutMS: SQL_STATEMENT_TIMEOUT_MS,
    connectTimeoutMS: SQL_STATEMENT_TIMEOUT_MS,
    socketTimeoutMS: 30_000,
  });
  return client.connect();
}

export function mongoClient(): Promise<MongoClient> {
  globalForMongo.__adminMongo ??= connect();
  return globalForMongo.__adminMongo;
}

export async function mongoDb(): Promise<Db> {
  const client = await mongoClient();
  return client.db(env.mongoDbName());
}

/**
 * A typed handle on one collection, with the 5 s budget applied to the query
 * itself. Pass `maxTimeMS: MONGO_MAX_TIME_MS` on every find/aggregate.
 */
export async function collection<T extends Document = Document>(name: string) {
  const db = await mongoDb();
  return db.collection<T>(name);
}

export const MONGO_MAX_TIME_MS = SQL_STATEMENT_TIMEOUT_MS;

export async function closeMongo(): Promise<void> {
  const pending = globalForMongo.__adminMongo;
  if (!pending) return;
  globalForMongo.__adminMongo = undefined;
  await (await pending).close();
}
