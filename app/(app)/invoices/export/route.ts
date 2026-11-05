import { auth } from "@/auth";
import { toCsv } from "@/lib/csv";
import { effectiveSort, parseInvoiceFilters } from "@/lib/invoice-filters";
import { getAllInvoices } from "@/lib/queries/invoices";

const STATUS_LABELS = { draft: "Draft", sent: "Sent", overdue: "Overdue", paid: "Paid" } as const;

/** Every invoice matching the list's search, status tab and sort, as a CSV download. */
export async function GET(request: Request) {
  // The proxy already guards /invoices, but a route handler should not rely on that alone.
  const session = await auth();
  if (!session?.user) return new Response("Not signed in", { status: 401 });

  const filters = parseInvoiceFilters(new URL(request.url).searchParams);
  const invoices = await getAllInvoices({ ...filters, ...effectiveSort(filters), page: undefined });

  const csv = toCsv(
    ["Number", "Client", "Company", "Email", "Issue date", "Due date", "Status", "Paid on", "Currency", "Total"],
    invoices.map((invoice) => [
      invoice.number,
      invoice.client_name,
      invoice.client_company,
      invoice.client_email,
      invoice.issue_date,
      invoice.due_date,
      STATUS_LABELS[invoice.status],
      invoice.paid_at,
      invoice.currency,
      (invoice.total / 100).toFixed(2),
    ]),
  );

  const today = new Date().toISOString().slice(0, 10);
  const suffix = filters.status ? `-${filters.status}` : "";
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="facturo-invoices${suffix}-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
