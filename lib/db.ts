import postgres from "postgres";

// One client for the whole app. In dev, reuse it across hot reloads so
// connections don't pile up.
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

export const sql =
  globalForDb.sql ?? postgres(process.env.POSTGRES_URL!, { ssl: "require" });

if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;
