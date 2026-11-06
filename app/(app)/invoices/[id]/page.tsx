import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { InvoiceDocument } from "@/components/invoices/invoice-document";
import { InvoiceSummary } from "@/components/invoices/invoice-summary";
import { StatusBadge } from "@/components/invoices/status-badge";
import { BackLink } from "@/components/layout/back-link";
import { PageHeader } from "@/components/layout/page-header";
import { getInvoice } from "@/lib/queries/invoices";
import { getUserProfile } from "@/lib/queries/users";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const invoice = await getInvoice(id);
  return { title: invoice ? `${invoice.number} · ${invoice.client_name}` : "Invoice not found" };
}

export default async function InvoicePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await auth();
  const [invoice, from] = await Promise.all([getInvoice(id), getUserProfile(session?.user?.email)]);

  if (!invoice) notFound();

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title={invoice.number}
          back={<BackLink fallback="/invoices" skip={[`/invoices/${invoice.id}`]} />}
          actions={
            <InvoiceActions
              id={invoice.id}
              number={invoice.number}
              clientName={invoice.client_name}
              status={invoice.status}
            />
          }
        />
        <div className="-mt-4 mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <StatusBadge status={invoice.status} />
          <span>
            for{" "}
            <Link
              href={`/clients/${invoice.client_id}`}
              className="font-medium text-foreground hover:underline"
            >
              {invoice.client_name}
            </Link>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 @page-xl:grid-cols-[minmax(0,1fr)_18rem]">
        {/* The summary comes first on small screens; in a wide page it sits to the right. */}
        <InvoiceSummary invoice={invoice} className="@page-xl:col-start-2 @page-xl:row-start-1" />
        <div className="mx-auto w-full max-w-3xl @page-xl:col-start-1 @page-xl:row-start-1 print:max-w-none">
          <InvoiceDocument invoice={invoice} from={from} />
        </div>
      </div>
    </>
  );
}
