import { Avatar } from "@/components/ui/avatar";
import { RowActions } from "@/components/invoices/row-actions";
import { StatusBadge } from "@/components/invoices/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { getInvoices } from "@/lib/queries/invoices";
import type { InvoiceFilters } from "@/lib/types";

export async function InvoicesTable({ filters }: { filters: InvoiceFilters }) {
  const invoices = await getInvoices(filters);

  if (invoices.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
        No invoices match your search.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <ul className="divide-y divide-border md:hidden">
        {invoices.map((invoice) => (
          <li key={invoice.id} className="flex items-center gap-3 py-3 pl-4 pr-2">
            <Avatar name={invoice.client_name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-sm font-medium">{invoice.client_name}</p>
                <p className="shrink-0 font-mono text-sm tabular-nums">
                  {formatCurrency(invoice.total, invoice.currency)}
                </p>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  <span className="font-mono">{invoice.number}</span> ·{" "}
                  {formatDate(invoice.issue_date)}
                </span>
                <StatusBadge status={invoice.status} />
              </div>
            </div>
            <RowActions id={invoice.id} status={invoice.status} />
          </li>
        ))}
      </ul>

      <table className="hidden min-w-full text-sm md:table">
        <thead className="border-b border-border text-left text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Invoice</th>
            <th scope="col" className="px-4 py-3 font-medium">Client</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Amount</th>
            <th scope="col" className="px-4 py-3 font-medium">Status</th>
            <th scope="col" className="w-12 px-2 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-muted/40">
              <td className="whitespace-nowrap px-4 py-3">
                <p className="font-mono">{invoice.number}</p>
                <p className="text-xs text-muted-foreground">{formatDate(invoice.issue_date)}</p>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={invoice.client_name} />
                  <div className="min-w-0 max-w-56">
                    <p className="truncate font-medium">{invoice.client_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{invoice.client_email}</p>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-mono tabular-nums">
                {formatCurrency(invoice.total, invoice.currency)}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <StatusBadge status={invoice.status} />
              </td>
              <td className="px-2 py-3">
                <RowActions id={invoice.id} status={invoice.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
