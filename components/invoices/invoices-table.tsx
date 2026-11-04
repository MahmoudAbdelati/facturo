import { Avatar } from "@/components/ui/avatar";
import { RowActions } from "@/components/invoices/row-actions";
import { StatusBadge } from "@/components/invoices/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { getInvoices } from "@/lib/queries/invoices";

export async function InvoicesTable({ query, page }: { query: string; page: number }) {
  const invoices = await getInvoices(query, page);

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
            <Avatar name={invoice.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-sm font-medium">{invoice.name}</p>
                <p className="shrink-0 font-mono text-sm tabular-nums">
                  {formatCurrency(invoice.amount)}
                </p>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>{formatDate(invoice.date)}</span>
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
            <th scope="col" className="px-4 py-3 font-medium">Client</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Amount</th>
            <th scope="col" className="px-4 py-3 font-medium">Date</th>
            <th scope="col" className="px-4 py-3 font-medium">Status</th>
            <th scope="col" className="w-12 px-2 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-muted/40">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={invoice.name} />
                  <div className="min-w-0 max-w-56">
                    <p className="truncate font-medium">{invoice.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{invoice.email}</p>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-mono tabular-nums">
                {formatCurrency(invoice.amount)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {formatDate(invoice.date)}
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
