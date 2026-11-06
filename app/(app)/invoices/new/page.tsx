import type { Metadata } from "next";
import { auth } from "@/auth";
import { BackLink } from "@/components/layout/back-link";
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

export default async function NewInvoicePage(props: { searchParams?: Promise<{ client?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await auth();
  const [clients, number, currency] = await Promise.all([
    getClientOptions(),
    getNextInvoiceNumber(),
    getUserCurrency(session?.user?.email),
  ]);

  const today = new Date();
  // Opened from a client's page: start with that client chosen.
  const clientId = clients.some((client) => client.id === searchParams?.client) ? searchParams?.client : undefined;
  const due = new Date(today);
  due.setDate(due.getDate() + PAYMENT_TERMS_DAYS);

  return (
    <>
      <PageHeader
        title="New invoice"
        back={<BackLink fallback={clientId ? `/clients/${clientId}` : "/invoices"} />}
      />
      <InvoiceForm
        // A new key when the preselected client changes, so the form starts over.
        key={clientId ?? "blank"}
        clients={clients}
        defaults={{ number, currency, clientId, issueDate: localIsoDate(today), dueDate: localIsoDate(due) }}
        action={createInvoice}
      />
    </>
  );
}
