// src/server/db/index.ts
import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import pg, { Pool } from "pg";
import { relations } from "./relations";

// Send Dates to Postgres as UTC. By default pg uses the server's local time,
// which `timestamp` columns without a time zone (the Better Auth tables) store
// without the offset. Drizzle reads them back as UTC, so token expiry times
// were shifted by the local offset (2 hours in Germany).
pg.defaults.parseInputDatesAsUTC = true;

const globalForDb = globalThis as unknown as { pool?: Pool };

const pool =
  globalForDb.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle({ client: pool, relations });
