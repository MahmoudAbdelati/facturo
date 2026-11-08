import postgres from "postgres";
import { sslFor } from "@/lib/db-ssl";

const url = process.env.POSTGRES_URL!;

// One client for the whole app. In dev, reuse it across hot reloads so
// connections don't pile up.
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

export const sql = globalForDb.sql ?? postgres(url, { ssl: sslFor(url ?? "") });

if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;
