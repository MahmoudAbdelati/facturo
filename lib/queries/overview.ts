import { sql } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import type { MonthlyRevenue, RecentInvoice } from "@/lib/types";

export async function getMonthlyRevenue() {
  try {
    return await sql<MonthlyRevenue[]>`SELECT * FROM revenue`;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to load monthly revenue.");
  }
}

export async function getRecentInvoices() {
  try {
    const rows = await sql<(Omit<RecentInvoice, "amount"> & { amount: number })[]>`
      SELECT invoices.id, invoices.amount, customers.name, customers.email
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    return rows.map((row) => ({ ...row, amount: formatCurrency(row.amount) }));
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to load recent invoices.");
  }
}

export async function getKpis() {
  try {
    const [row] = await sql`
      SELECT
        (SELECT COUNT(*) FROM invoices) AS invoice_count,
        (SELECT COUNT(*) FROM customers) AS client_count,
        COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0) AS paid,
        COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) AS pending
      FROM invoices`;

    return {
      invoiceCount: Number(row.invoice_count),
      clientCount: Number(row.client_count),
      collected: formatCurrency(Number(row.paid)),
      outstanding: formatCurrency(Number(row.pending)),
    };
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to load overview totals.");
  }
}
