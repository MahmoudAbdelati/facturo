import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { InvoicesTable } from "@/components/invoices/invoices-table";
import { InvoicesTableSkeleton } from "@/components/invoices/invoices-table-skeleton";
import { buttonClasses } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Search } from "@/components/ui/search";
import { getInvoicePageCount } from "@/lib/queries/invoices";
import {
  DISPLAY_STATUSES,
  type DisplayStatus,
  type InvoiceFilters,
  type InvoiceSortKey,
} from "@/lib/types";

const SORT_KEYS: InvoiceSortKey[] = [
  "number",
  "client",
  "total",
  "issue_date",
  "due_date",
  "status",
];

function oneOf<T extends string>(value: string | undefined, options: readonly T[]): T | undefined {
  return options.includes(value as T) ? (value as T) : undefined;
}

export const metadata: Metadata = {
  title: "Invoices",
};

export default async function InvoicesPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    status?: string;
    sort?: string;
    dir?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const page = Number(searchParams?.page) || 1;
  const filters: InvoiceFilters = {
    query,
    page,
    status: oneOf<DisplayStatus>(searchParams?.status, DISPLAY_STATUSES),
    sort: oneOf(searchParams?.sort, SORT_KEYS),
    dir: oneOf(searchParams?.dir, ["asc", "desc"] as const),
  };
  const totalPages = await getInvoicePageCount(filters);

  return (
    <>
      <PageHeader title="Invoices" />
      <div className="mb-4 flex items-center gap-3">
        <Search placeholder="Search invoices…" />
        <Link href="/invoices/new" className={buttonClasses()}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New invoice</span>
        </Link>
      </div>
      <Suspense key={JSON.stringify(filters)} fallback={<InvoicesTableSkeleton />}>
        <InvoicesTable filters={filters} />
      </Suspense>
      <div className="mt-5 flex justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </>
  );
}
