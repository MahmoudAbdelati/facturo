import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { DueNote } from "@/components/invoices/invoices-table";
import { RowActions } from "@/components/invoices/row-actions";
import { StatusBadge } from "@/components/invoices/status-badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ClickableRow } from "@/components/ui/clickable-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { formatCurrency, formatDate, formatShortDate } from "@/lib/format";
import { getInvoices, INVOICES_PER_PAGE } from "@/lib/queries/invoices";

/** One client's invoices, newest first, paged with `?page=`. */
export async function ClientInvoices({
  clientId,
  total,
  page,
}: {
  clientId: string;
  /** All of the client's invoices, drafts included. */
  total: number;
  page: number;
}) {
  const invoices = total > 0 ? await getInvoices({ clientId, page }) : [];

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Invoices"
        description={total > 0 ? `${total} in total, newest first` : undefined}
        className="pb-4"
      />

      {invoices.length === 0 ? (
        <EmptyState
          icon={FilePlus2}
          title="No invoices yet"
          description="Bill this client and their invoices will show up here."
          action={
            <Link href={`/invoices/new?client=${clientId}`} className={buttonClasses("secondary", "sm")}>
              New invoice
            </Link>
          }
          className="border-t border-border"
        />
      ) : (
        <>
          <ul className="divide-y divide-border border-t border-border @page-md:hidden">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="relative flex items-center gap-3 py-3 pl-4 pr-2 transition-colors hover:bg-muted/40">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="truncate font-mono text-sm after:absolute after:inset-0 focus-visible:ring-0 after:focus-visible:rounded-sm after:focus-visible:ring-2 after:focus-visible:ring-inset after:focus-visible:ring-ring"
                    >
                      {invoice.number}
                    </Link>
                    <p className="shrink-0 font-mono text-sm tabular-nums">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="min-w-0 truncate">
                      {formatShortDate(invoice.issue_date)} · <DueNote invoice={invoice} short />
                    </span>
                    <StatusBadge status={invoice.status} compact />
                  </div>
                </div>
                <div className="relative">
                  <RowActions id={invoice.id} number={invoice.number} status={invoice.status} menuOnly />
                </div>
              </li>
            ))}
          </ul>

          <table className="hidden w-full table-fixed border-t border-border text-sm @page-md:table">
            {/* The number never truncates; the payment note takes what's left. */}
            <colgroup>
              <col className="w-40" />
              <col className="w-32" />
              <col />
              <col className="w-28" />
              <col className="w-12" />
            </colgroup>
            <thead className="border-b border-border text-left text-xs font-medium text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">Invoice</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Amount</th>
                <th scope="col" className="px-3 py-2 font-medium">Payment</th>
                <th scope="col" className="px-3 py-2 font-medium">Status</th>
                <th scope="col" className="px-2 py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((invoice) => (
                <ClickableRow
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="block truncate font-mono hover:text-accent-subtle-foreground hover:underline"
                    >
                      {invoice.number}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{formatDate(invoice.issue_date)}</p>
                  </td>
                  <td className="truncate px-3 py-3 text-right font-mono tabular-nums">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </td>
                  <td className="truncate px-3 py-3 text-muted-foreground">
                    <DueNote invoice={invoice} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-2 py-3">
                    <RowActions id={invoice.id} number={invoice.number} status={invoice.status} menuOnly />
                  </td>
                </ClickableRow>
              ))}
            </tbody>
          </table>

          {total > INVOICES_PER_PAGE && (
            <div className="border-t border-border px-4 py-3">
              <Pagination totalItems={total} pageSize={INVOICES_PER_PAGE} noun="invoices" />
            </div>
          )}
        </>
      )}
    </Card>
  );
}
