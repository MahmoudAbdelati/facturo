import { sql } from "@/lib/db";
import type { InvoiceFormData, InvoiceRow } from "@/lib/types";

export const INVOICES_PER_PAGE = 6;

function matches(query: string) {
  const pattern = `%${query}%`;
  return sql`
    customers.name ILIKE ${pattern} OR
    customers.email ILIKE ${pattern} OR
    invoices.amount::text ILIKE ${pattern} OR
    invoices.date::text ILIKE ${pattern} OR
    invoices.status ILIKE ${pattern}`;
}

export async function getInvoices(query: string, page: number) {
  const offset = (page - 1) * INVOICES_PER_PAGE;

  try {
    return await sql<InvoiceRow[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE ${matches(query)}
      ORDER BY invoices.date DESC
      LIMIT ${INVOICES_PER_PAGE} OFFSET ${offset}`;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to load invoices.");
  }
}

export async function getInvoicePageCount(query: string) {
  try {
    const [row] = await sql`
      SELECT COUNT(*)
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE ${matches(query)}`;

    return Math.ceil(Number(row.count) / INVOICES_PER_PAGE);
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to count invoices.");
  }
}

export async function getInvoice(id: string) {
  try {
    const [invoice] = await sql<InvoiceFormData[]>`
      SELECT id, customer_id, amount, status
      FROM invoices
      WHERE id = ${id}`;

    return invoice ? { ...invoice, amount: invoice.amount / 100 } : undefined;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to load invoice.");
  }
}
