import { sql } from "@/lib/db";
import type { DisplayStatus } from "@/lib/types";

/**
 * Invoices with their total in cents, the sum of their line items.
 * Use as `FROM ${invoicesWithTotals()} i`.
 */
export function invoicesWithTotals() {
  return sql`(
    SELECT invoices.*, COALESCE(items.total, 0)::bigint AS total
    FROM invoices
    LEFT JOIN (
      SELECT invoice_id, SUM(ROUND(quantity * unit_price)) AS total
      FROM invoice_items
      GROUP BY invoice_id
    ) items ON items.invoice_id = invoices.id
  )`;
}

/** Status as shown in the app, for an invoice aliased as `i`. */
export function displayStatus() {
  return sql`CASE WHEN i.status = 'sent' AND i.due_date < CURRENT_DATE THEN 'overdue' ELSE i.status END`;
}

/** WHERE condition matching one display status, for an invoice aliased as `i`. */
export function hasStatus(status: DisplayStatus) {
  switch (status) {
    case "overdue":
      return sql`i.status = 'sent' AND i.due_date < CURRENT_DATE`;
    case "sent":
      return sql`i.status = 'sent' AND i.due_date >= CURRENT_DATE`;
    default:
      return sql`i.status = ${status}`;
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Postgres rejects malformed UUIDs with an error; treat them as "not found" instead. */
export function isUuid(value: string) {
  return UUID.test(value);
}

export async function withErrorMessage<T>(
  message: string,
  run: () => Promise<T>,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error("Database error:", error);
    throw new Error(message);
  }
}
