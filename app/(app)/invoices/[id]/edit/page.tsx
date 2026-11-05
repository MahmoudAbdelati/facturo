import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { updateInvoice } from "@/lib/actions/invoices";
import { getClientOptions } from "@/lib/queries/clients";
import { getInvoice } from "@/lib/queries/invoices";

export const metadata: Metadata = {
  title: "Edit invoice",
};

export default async function EditInvoicePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [invoice, clients] = await Promise.all([getInvoice(id), getClientOptions()]);

  if (!invoice) notFound();

  return (
    <>
      <PageHeader title="Edit invoice" crumbs={[{ label: "Invoices", href: "/invoices" }]} />
      <InvoiceForm
        clients={clients}
        invoice={{ ...invoice, status: invoice.stored_status }}
        action={updateInvoice.bind(null, id)}
        submitLabel="Save changes"
      />
    </>
  );
}
