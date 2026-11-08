// Resets the database and fills it with the demo workspace.
// Run with `pnpm db:seed`. It drops and recreates every table, so point POSTGRES_URL at a
// database that holds nothing else. The live demo is refreshed nightly by
// /api/cron/reset-demo instead, which keeps the schema and only replaces the data.

import postgres from "postgres";
import { sslFor } from "../lib/db-ssl.ts";
import { createSchema, workspaceSummary, writeDemoWorkspace } from "../lib/demo-seed.ts";

const url = process.env.POSTGRES_URL;
if (!url) throw new Error("POSTGRES_URL is not set.");

const account = {
  email: process.env.DEMO_EMAIL ?? "demo@facturo.app",
  password: process.env.DEMO_PASSWORD ?? "facturo-demo",
};

const sql = postgres(url, { ssl: sslFor(url), max: 1, onnotice: () => {} });

try {
  await sql.begin(async (tx) => {
    await createSchema(tx);
    await writeDemoWorkspace(tx, account);
  });

  const byStatus = await sql`
    SELECT
      CASE WHEN status = 'sent' AND due_date < CURRENT_DATE THEN 'overdue' ELSE status END AS status,
      count(*)::int AS count
    FROM invoices GROUP BY 1 ORDER BY 1`;

  console.log("Seeded:", await workspaceSummary(sql));
  console.log("By status:", Object.fromEntries(byStatus.map((r) => [r.status, r.count])));
  console.log(`Demo login: ${account.email}`);
} finally {
  await sql.end();
}
