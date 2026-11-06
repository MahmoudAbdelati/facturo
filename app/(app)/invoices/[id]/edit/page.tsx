import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/layout/back-link";
import { PageHeader } from "@/components/layout/page-header";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { updateInvoice } from "@/lib/actions/invoices";
import { getClientOptions } from "@/lib/queries/clients";
import { getInvoice } from "@/lib/queries/invoices";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const invoice = await getInvoice(id);
  return { title: invoice ? `Edit ${invoice.number}` : "Invoice not found" };
}

export default async function EditInvoicePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [invoice, clients] = await Promise.all([getInvoice(id), getClientOptions()]);

  if (!invoice) notFound();

  return (
    <>
      <PageHeader
        title={`Edit ${invoice.number}`}
        back={<BackLink fallback={`/invoices/${invoice.id}`} />}
      />
      <InvoiceForm
        clients={clients}
        invoice={invoice}
        defaults={{
          number: invoice.number,
          currency: invoice.currency,
          issueDate: invoice.issue_date,
          dueDate: invoice.due_date,
        }}
        action={updateInvoice.bind(null, id)}
      />
    </>
  );
}
