import { sql } from "@/lib/db";
import type { ClientDetail, ClientOption, ClientRow } from "@/lib/types";
import { invoicesWithTotals, isUuid, withErrorMessage } from "./shared";

export function getClientOptions(): Promise<ClientOption[]> {
  return withErrorMessage("Failed to load clients.", async () => {
    const rows = await sql`SELECT id, name FROM clients ORDER BY name ASC`;
    return rows.map((row) => ({ id: row.id, name: row.name }));
  });
}

function clientTotals() {
  return sql`
    c.id,
    c.name,
    c.company,
    c.email,
    c.country,
    COUNT(i.id) FILTER (WHERE i.status <> 'draft') AS invoice_count,
    COALESCE(SUM(i.total) FILTER (WHERE i.status = 'sent'), 0) AS outstanding,
    COALESCE(SUM(i.total) FILTER (WHERE i.status = 'sent' AND i.due_date < CURRENT_DATE), 0) AS overdue,
    COALESCE(SUM(i.total) FILTER (WHERE i.status = 'paid'), 0) AS paid,
    MAX(i.issue_date) FILTER (WHERE i.status <> 'draft')::text AS last_issue_date`;
}

function toRow(row: Record<string, unknown>): ClientRow {
  return {
    id: row.id as string,
    name: row.name as string,
    company: row.company as string | null,
    email: row.email as string,
    country: row.country as string | null,
    invoice_count: Number(row.invoice_count),
    outstanding: Number(row.outstanding),
    overdue: Number(row.overdue),
    paid: Number(row.paid),
    last_issue_date: row.last_issue_date as string | null,
  };
}

/** Clients matching the search, with invoice totals in cents. Drafts don't count. */
export function getClients(query = ""): Promise<ClientRow[]> {
  const pattern = `%${query.trim()}%`;

  return withErrorMessage("Failed to load clients.", async () => {
    const rows = await sql`
      SELECT ${clientTotals()}
      FROM clients c
      LEFT JOIN ${invoicesWithTotals()} i ON i.client_id = c.id
      WHERE c.name ILIKE ${pattern} OR c.company ILIKE ${pattern} OR c.email ILIKE ${pattern}
      GROUP BY c.id
      ORDER BY c.name ASC`;

    return rows.map(toRow);
  });
}

export function getClient(id: string): Promise<ClientDetail | undefined> {
  if (!isUuid(id)) return Promise.resolve(undefined);

  return withErrorMessage("Failed to load client.", async () => {
    const [row] = await sql`
      SELECT
        ${clientTotals()},
        c.phone,
        c.created_at::text AS created_at,
        COUNT(i.id) FILTER (WHERE i.status = 'draft') AS draft_count,
        AVG(i.paid_at - i.issue_date)::float AS avg_days_to_pay
      FROM clients c
      LEFT JOIN ${invoicesWithTotals()} i ON i.client_id = c.id
      WHERE c.id = ${id}
      GROUP BY c.id`;

    if (!row) return undefined;

    return {
      ...toRow(row),
      phone: row.phone,
      draft_count: Number(row.draft_count),
      created_at: row.created_at,
      avg_days_to_pay: row.avg_days_to_pay,
    };
  });
}
