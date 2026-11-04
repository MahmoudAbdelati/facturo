import { sql } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import type { ClientOption, ClientRow } from "@/lib/types";

export async function getClientOptions() {
  try {
    return await sql<ClientOption[]>`
      SELECT id, name
      FROM customers
      ORDER BY name ASC`;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to load clients.");
  }
}

export async function getClients(query: string) {
  const pattern = `%${query}%`;

  try {
    const rows = await sql`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        COUNT(invoices.id) AS total_invoices,
        COALESCE(SUM(invoices.amount) FILTER (WHERE invoices.status = 'pending'), 0) AS total_pending,
        COALESCE(SUM(invoices.amount) FILTER (WHERE invoices.status = 'paid'), 0) AS total_paid
      FROM customers
      LEFT JOIN invoices ON customers.id = invoices.customer_id
      WHERE customers.name ILIKE ${pattern} OR customers.email ILIKE ${pattern}
      GROUP BY customers.id, customers.name, customers.email
      ORDER BY customers.name ASC`;

    return rows.map(
      (row): ClientRow => ({
        id: row.id,
        name: row.name,
        email: row.email,
        total_invoices: Number(row.total_invoices),
        total_pending: formatCurrency(Number(row.total_pending)),
        total_paid: formatCurrency(Number(row.total_paid)),
      }),
    );
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to load clients.");
  }
}
