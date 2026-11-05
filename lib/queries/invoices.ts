import { sql } from "@/lib/db";
import type {
  DisplayStatus,
  InvoiceDetail,
  InvoiceFilters,
  InvoiceRow,
  InvoiceSortKey,
  StatusCounts,
} from "@/lib/types";
import { displayStatus, hasStatus, invoicesWithTotals, isUuid, withErrorMessage } from "./shared";

export const INVOICES_PER_PAGE = 10;

// Status sorts by how urgent it is, not alphabetically.
const sortColumns: Record<InvoiceSortKey, string> = {
  number: "i.number",
  client: "c.name",
  total: "i.total",
  issue_date: "i.issue_date",
  due_date: "i.due_date",
  status: `CASE WHEN i.status = 'sent' AND i.due_date < CURRENT_DATE THEN 0
                WHEN i.status = 'sent' THEN 1
                WHEN i.status = 'draft' THEN 2
                ELSE 3 END`,
};

function invoiceColumns() {
  return sql`
    i.id,
    i.number,
    i.client_id,
    c.name AS client_name,
    c.company AS client_company,
    c.email AS client_email,
    i.issue_date::text AS issue_date,
    i.due_date::text AS due_date,
    i.paid_at::text AS paid_at,
    ${displayStatus()} AS status,
    i.currency,
    i.total`;
}

/** Search and client filters; the status filter is applied separately so tab counts can share this. */
function baseConditions({ query, clientId }: Pick<InvoiceFilters, "query" | "clientId">) {
  const pattern = `%${query?.trim() ?? ""}%`;
  return sql`
    (c.name ILIKE ${pattern} OR c.company ILIKE ${pattern} OR c.email ILIKE ${pattern} OR i.number ILIKE ${pattern})
    ${clientId ? sql`AND i.client_id = ${isUuid(clientId) ? clientId : null}` : sql``}`;
}

function conditions(filters: InvoiceFilters) {
  return sql`${baseConditions(filters)} ${filters.status ? sql`AND ${hasStatus(filters.status)}` : sql``}`;
}

function toRow(row: Record<string, unknown>): InvoiceRow {
  return { ...(row as InvoiceRow), total: Number(row.total) };
}

/** One page of invoices matching the filters. Newest first unless a sort is given. */
export function getInvoices(filters: InvoiceFilters = {}): Promise<InvoiceRow[]> {
  const page = Math.max(1, filters.page ?? 1);
  const sort = filters.sort && filters.sort in sortColumns ? filters.sort : "issue_date";
  const dir = filters.dir === "asc" ? "ASC" : "DESC";

  return withErrorMessage("Failed to load invoices.", async () => {
    const rows = await sql`
      SELECT ${invoiceColumns()}
      FROM ${invoicesWithTotals()} i
      JOIN clients c ON c.id = i.client_id
      WHERE ${conditions(filters)}
      ORDER BY ${sql.unsafe(sortColumns[sort])} ${sql.unsafe(dir)}, i.number DESC
      LIMIT ${INVOICES_PER_PAGE} OFFSET ${(page - 1) * INVOICES_PER_PAGE}`;

    return rows.map(toRow);
  });
}

export function getInvoicePageCount(filters: InvoiceFilters = {}): Promise<number> {
  return withErrorMessage("Failed to count invoices.", async () => {
    const [row] = await sql`
      SELECT COUNT(*) AS count
      FROM invoices i
      JOIN clients c ON c.id = i.client_id
      WHERE ${conditions(filters)}`;

    return Math.ceil(Number(row.count) / INVOICES_PER_PAGE);
  });
}

/** Counts for the status tabs. They follow the search, not the selected tab. */
export function getInvoiceStatusCounts(
  filters: Pick<InvoiceFilters, "query" | "clientId"> = {},
): Promise<StatusCounts> {
  return withErrorMessage("Failed to count invoices.", async () => {
    const rows = await sql`
      SELECT ${displayStatus()} AS status, COUNT(*) AS count
      FROM invoices i
      JOIN clients c ON c.id = i.client_id
      WHERE ${baseConditions(filters)}
      GROUP BY 1`;

    const counts: StatusCounts = {
      all: 0,
      draft: 0,
      sent: 0,
      overdue: 0,
      paid: 0,
    };
    for (const row of rows) {
      counts[row.status as DisplayStatus] = Number(row.count);
      counts.all += Number(row.count);
    }
    return counts;
  });
}

/** One invoice with its client and line items, or undefined if there is no such invoice. */
export function getInvoice(id: string): Promise<InvoiceDetail | undefined> {
  if (!isUuid(id)) return Promise.resolve(undefined);

  return withErrorMessage("Failed to load invoice.", async () => {
    const [invoice] = await sql`
      SELECT
        ${invoiceColumns()},
        i.status AS stored_status,
        i.notes,
        c.phone AS client_phone,
        c.country AS client_country
      FROM ${invoicesWithTotals()} i
      JOIN clients c ON c.id = i.client_id
      WHERE i.id = ${id}`;

    if (!invoice) return undefined;

    const items = await sql`
      SELECT
        id,
        description,
        quantity::float AS quantity,
        unit_price,
        ROUND(quantity * unit_price)::int AS amount
      FROM invoice_items
      WHERE invoice_id = ${id}
      ORDER BY position, id`;

    return {
      ...(invoice as unknown as InvoiceDetail),
      total: Number(invoice.total),
      items: items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.amount,
      })),
    };
  });
}

/** The next free invoice number for this year, e.g. INV-2026-0042. */
export function getNextInvoiceNumber(): Promise<string> {
  return withErrorMessage("Failed to pick an invoice number.", async () => {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    const [row] = await sql`
      SELECT COALESCE(MAX(split_part(number, '-', 3)::int), 0) AS last
      FROM invoices
      WHERE number LIKE ${prefix + "%"}`;

    return prefix + String(Number(row.last) + 1).padStart(4, "0");
  });
}
