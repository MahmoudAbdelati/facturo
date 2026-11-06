import { Suspense } from "react";
import clsx from "clsx";
import Link from "next/link";
import type { Metadata } from "next";
import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { InvoicesTable } from "@/components/invoices/invoices-table";
import { InvoicesTableSkeleton } from "@/components/invoices/invoices-table-skeleton";
import { SortMenu } from "@/components/invoices/sort-menu";
import { StatusTabs } from "@/components/invoices/status-tabs";
import { buttonClasses } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Search } from "@/components/ui/search";
import { effectiveSort, invoicesSearch, parseInvoiceFilters } from "@/lib/invoice-filters";
import { getInvoiceStatusCounts, INVOICES_PER_PAGE } from "@/lib/queries/invoices";

export const metadata: Metadata = {
  title: "Invoices",
};

export default async function InvoicesPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseInvoiceFilters((await props.searchParams) ?? {});
  // The tab counts double as the total for the pagination.
  const counts = await getInvoiceStatusCounts(filters);
  const total = counts[filters.status ?? "all"];
  // A page past the end (after a delete, or an edited URL) shows the last page instead.
  const lastPage = Math.max(1, Math.ceil(total / INVOICES_PER_PAGE));
  if (filters.page && filters.page > lastPage) filters.page = lastPage;
  const exportHref = `/invoices/export${invoicesSearch({ ...filters, page: undefined })}`;

  return (
    <>
      <PageHeader
        title="Invoices"
        actions={
          <div className="flex items-center gap-2">
            <a
              href={exportHref}
              download
              aria-disabled={total === 0 || undefined}
              title="Download the invoices in this view as CSV"
              className={buttonClasses("secondary")}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sr-only sm:hidden">Export CSV</span>
            </a>
            {/* Phones have the + in the bottom bar. */}
            <Link href="/invoices/new" className={clsx(buttonClasses(), "hidden md:inline-flex")}>
              <Plus className="h-4 w-4" />
              New invoice
            </Link>
          </div>
        }
      />

      <StatusTabs filters={filters} counts={counts} />

      <div className="my-4 flex items-center gap-2">
        <Search placeholder="Filter by client or number…" label="Filter invoices" />
        <div className="@page-xl:hidden">
          <SortMenu filters={filters} />
        </div>
      </div>

      <Suspense key={JSON.stringify(filters)} fallback={<InvoicesTableSkeleton />}>
        <InvoicesTable
          filters={{ ...filters, ...effectiveSort(filters) }}
          hasInvoices={counts.all > 0 || !!filters.query}
        />
      </Suspense>

      <div className="mt-4">
        <Pagination totalItems={total} pageSize={INVOICES_PER_PAGE} noun="invoices" />
      </div>
    </>
  );
}
