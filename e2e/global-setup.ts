import postgres from "postgres";
import { sslFor } from "../lib/db-ssl.ts";
import { createSchema, writeDemoWorkspace } from "../lib/demo-seed.ts";

/** Starts every run from the seeded demo workspace (the same as `pnpm db:seed`). */
export default async function globalSetup() {
  const url = process.env.POSTGRES_URL!;
  const sql = postgres(url, { ssl: sslFor(url), max: 1, onnotice: () => {} });
  try {
    await sql.begin(async (tx) => {
      await createSchema(tx);
      await writeDemoWorkspace(tx, {
        email: process.env.DEMO_EMAIL!,
        password: process.env.DEMO_PASSWORD!,
      });
    });
  } finally {
    await sql.end();
  }
}
