// Writes the demo workspace to Postgres. Used by `pnpm db:seed` (plain Node, so only
// relative imports here) and by the nightly reset route.

import bcrypt from "bcrypt";
import type { Sql, TransactionSql } from "postgres";
import { buildDemoWorkspace, demoProfile } from "./demo-data.ts";

/** Drops every table and creates the current schema. Only `pnpm db:seed` does this. */
export async function createSchema(tx: TransactionSql) {
  // Old tables from before the redesign go too.
  await tx`DROP TABLE IF EXISTS invoice_items, invoices, clients, customers, revenue, users CASCADE`;

  await tx`
    CREATE TABLE users (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name         TEXT NOT NULL,
      email        TEXT NOT NULL UNIQUE,
      password     TEXT NOT NULL,
      company_name TEXT,
      currency     CHAR(3) NOT NULL DEFAULT 'USD',
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

  await tx`
    CREATE TABLE clients (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name       TEXT NOT NULL,
      company    TEXT,
      email      TEXT NOT NULL,
      phone      TEXT,
      country    CHAR(2),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

  // "overdue" is not stored: it is a sent invoice whose due date has passed.
  await tx`
    CREATE TABLE invoices (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      number     TEXT NOT NULL UNIQUE,
      client_id  UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
      issue_date DATE NOT NULL,
      due_date   DATE NOT NULL,
      status     TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid')),
      currency   CHAR(3) NOT NULL DEFAULT 'USD',
      notes      TEXT,
      paid_at    DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CHECK (due_date >= issue_date),
      CHECK ((status = 'paid') = (paid_at IS NOT NULL))
    )`;

  // Amounts are integer cents.
  await tx`
    CREATE TABLE invoice_items (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_id  UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      quantity    NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
      unit_price  INTEGER NOT NULL CHECK (unit_price >= 0),
      position    SMALLINT NOT NULL DEFAULT 0
    )`;

  await tx`CREATE INDEX invoices_client_id_idx ON invoices (client_id)`;
  await tx`CREATE INDEX invoices_status_due_idx ON invoices (status, due_date)`;
  await tx`CREATE INDEX invoices_issue_date_idx ON invoices (issue_date)`;
  await tx`CREATE INDEX invoice_items_invoice_id_idx ON invoice_items (invoice_id)`;
}

/**
 * Replaces all clients, invoices and items with fresh demo data and puts the demo user's
 * profile and password back. The workspace is shared (rows aren't owned by a user), so
 * this must only run where the demo is the whole workspace. Other user rows are left alone,
 * and the demo user keeps its id, so signed-in demo sessions stay valid.
 */
export async function writeDemoWorkspace(
  tx: TransactionSql,
  account: { email: string; password: string },
  now: Date = new Date(),
) {
  const { clients, invoices, items } = buildDemoWorkspace(now);
  const passwordHash = await bcrypt.hash(account.password, 10);

  await tx`TRUNCATE invoice_items, invoices, clients`;
  await tx`
    INSERT INTO users (name, email, password, company_name, currency)
    VALUES (${demoProfile.name}, ${account.email}, ${passwordHash}, ${demoProfile.company}, ${demoProfile.currency})
    ON CONFLICT (email) DO UPDATE
    SET name = EXCLUDED.name, password = EXCLUDED.password,
        company_name = EXCLUDED.company_name, currency = EXCLUDED.currency`;
  await tx`INSERT INTO clients ${tx(clients)}`;
  await tx`INSERT INTO invoices ${tx(invoices)}`;
  await tx`INSERT INTO invoice_items ${tx(items)}`;
}

/** Row counts after a seed or reset, for logs and the reset route's response. */
export async function workspaceSummary(sql: Sql) {
  const [summary] = await sql`
    SELECT
      (SELECT count(*) FROM clients)::int AS clients,
      (SELECT count(*) FROM invoices)::int AS invoices,
      (SELECT count(*) FROM invoice_items)::int AS items,
      (SELECT min(issue_date)::text FROM invoices) AS first_issue,
      (SELECT max(issue_date)::text FROM invoices) AS last_issue`;
  return summary as {
    clients: number;
    invoices: number;
    items: number;
    first_issue: string | null;
    last_issue: string | null;
  };
}
