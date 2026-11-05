import Link from "next/link";
import { FilePlus2, FileSearch } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RowActions } from "@/components/invoices/row-actions";
import { SortHeader } from "@/components/invoices/sort-header";
import { StatusBadge } from "@/components/invoices/status-badge";
import { formatCurrency, formatDate, formatShortDate } from "@/lib/format";
import { getInvoices } from "@/lib/queries/invoices";
import type { InvoiceFilters, InvoiceRow } from "@/lib/types";

const DAY = 86_400_000;

function daysOverdue(dueDate: string) {
  const today = new Date(new Date().toISOString().slice(0, 10));
  return Math.round((today.getTime() - new Date(dueDate).getTime()) / DAY);
}

/** "Due 12 Nov", or how late it is for an overdue invoice; nothing once it's paid. */
function DueNote({ invoice, short = false }: { invoice: InvoiceRow; short?: boolean }) {
  const format = short ? formatShortDate : formatDate;
  if (invoice.status === "paid") {
    return invoice.paid_at ? <>Paid {format(invoice.paid_at)}</> : null;
  }
  if (invoice.status === "overdue") {
    const days = daysOverdue(invoice.due_date);
    return (
      <span className="text-danger">
        {short ? `${days}d` : `${days} ${days === 1 ? "day" : "days"}`} late
      </span>
    );
  }
  return <>Due {format(invoice.due_date)}</>;
}

export async function InvoicesTable({
  filters,
  hasInvoices,
}: {
  /** With the sort filled in, as the query runs it. */
  filters: InvoiceFilters;
  /** Whether there are any invoices at all, to tell "none yet" from "none match". */
  hasInvoices: boolean;
}) {
  const invoices = await getInvoices(filters);

  if (invoices.length === 0) {
    return (
      <Card>
        {hasInvoices ? (
          <EmptyState
            icon={FileSearch}
            title="No invoices match"
            description={
              filters.query
                ? `Nothing found for “${filters.query}”. Try another name or invoice number.`
                : "There are no invoices with this status."
            }
            action={
              <Link href="/invoices" className={buttonClasses("secondary", "sm")}>
                Clear filters
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={FilePlus2}
            title="No invoices yet"
            description="Create your first invoice and it will show up here."
            action={
              <Link href="/invoices/new" className={buttonClasses("primary", "sm")}>
                New invoice
              </Link>
            }
          />
        )}
      </Card>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface">
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
                <span className="min-w-0 truncate">
                  <span className="font-mono">{invoice.number}</span> · <DueNote invoice={invoice} short />
                </span>
                <StatusBadge status={invoice.status} compact />
              </div>
            </div>
            <RowActions id={invoice.id} number={invoice.number} status={invoice.status} />
          </li>
        ))}
      </ul>

      {/* Fixed layout: the columns never grow past the container, the client column
          takes what is left and truncates. Widths are in rem so they follow the font size. */}
      <table className="hidden w-full table-fixed text-sm md:table">
        <colgroup>
          <col className="w-36" />
          <col />
          <col className="w-32" />
          <col className="hidden w-32 xl:table-column" />
          <col className="w-32" />
          <col className="w-12 xl:w-32" />
        </colgroup>
        <thead className="border-b border-border text-left text-muted-foreground">
          <tr>
            {/* Numbers follow issue dates, so the column sorts by date (its second line). */}
            <SortHeader filters={filters} sortKey="issue_date">
              Invoice
            </SortHeader>
            <SortHeader filters={filters} sortKey="client">
              Client
            </SortHeader>
            <SortHeader filters={filters} sortKey="total" align="right">
              Amount
            </SortHeader>
            <SortHeader filters={filters} sortKey="due_date" className="hidden xl:table-cell">
              Due
            </SortHeader>
            <SortHeader filters={filters} sortKey="status">
              Status
            </SortHeader>
            <th scope="col" className="px-2 py-2">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="transition-colors hover:bg-muted/40">
              <td className="whitespace-nowrap px-3 py-3">
                <Link
                  href={`/invoices/${invoice.id}/edit`}
                  className="block truncate font-mono hover:text-accent-subtle-foreground hover:underline"
                >
                  {invoice.number}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {formatDate(invoice.issue_date)}
                </p>
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={invoice.client_name} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{invoice.client_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{invoice.client_email}</p>
                  </div>
                </div>
              </td>
              <td className="truncate px-3 py-3 text-right font-mono tabular-nums">
                {formatCurrency(invoice.total, invoice.currency)}
              </td>
              <td className="hidden truncate px-3 py-3 text-muted-foreground xl:table-cell">
                {invoice.status === "paid" ? (
                  <span className="text-muted-foreground/60">—</span>
                ) : invoice.status === "overdue" ? (
                  <DueNote invoice={invoice} />
                ) : (
                  formatDate(invoice.due_date)
                )}
              </td>
              <td className="px-3 py-3">
                <StatusBadge status={invoice.status} />
                <p className="mt-1 truncate text-xs text-muted-foreground xl:hidden">
                  <DueNote invoice={invoice} />
                </p>
              </td>
              <td className="px-2 py-3">
                <RowActions id={invoice.id} number={invoice.number} status={invoice.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
