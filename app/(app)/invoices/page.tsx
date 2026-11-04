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

export const metadata: Metadata = {
  title: "Invoices",
};

export default async function InvoicesPage(props: {
  searchParams?: Promise<{ query?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const page = Number(searchParams?.page) || 1;
  const totalPages = await getInvoicePageCount(query);

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
      <Suspense key={query + page} fallback={<InvoicesTableSkeleton />}>
        <InvoicesTable query={query} page={page} />
      </Suspense>
      <div className="mt-5 flex justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </>
  );
}
