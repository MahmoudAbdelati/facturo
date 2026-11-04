import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { createInvoice } from "@/lib/actions/invoices";
import { getClientOptions } from "@/lib/queries/clients";

export const metadata: Metadata = {
  title: "New invoice",
};

export default async function NewInvoicePage() {
  const clients = await getClientOptions();

  return (
    <>
      <PageHeader title="New invoice" crumbs={[{ label: "Invoices", href: "/invoices" }]} />
      <InvoiceForm clients={clients} action={createInvoice} submitLabel="Create invoice" />
    </>
  );
}
