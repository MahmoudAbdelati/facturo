import type { Metadata } from "next";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/page-header";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { createInvoice } from "@/lib/actions/invoices";
import { getClientOptions } from "@/lib/queries/clients";
import { getNextInvoiceNumber } from "@/lib/queries/invoices";
import { getUserCurrency } from "@/lib/queries/users";

export const metadata: Metadata = {
  title: "New invoice",
};

const PAYMENT_TERMS_DAYS = 30;

/** YYYY-MM-DD in the server's time zone. */
function localIsoDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default async function NewInvoicePage() {
  const session = await auth();
  const [clients, number, currency] = await Promise.all([
    getClientOptions(),
    getNextInvoiceNumber(),
    getUserCurrency(session?.user?.email),
  ]);

  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + PAYMENT_TERMS_DAYS);

  return (
    <>
      <PageHeader title="New invoice" crumbs={[{ label: "Invoices", href: "/invoices" }]} />
      <InvoiceForm
        clients={clients}
        defaults={{ number, currency, issueDate: localIsoDate(today), dueDate: localIsoDate(due) }}
        action={createInvoice}
      />
    </>
  );
}
