import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CalendarDays, Globe, Mail, Phone } from "lucide-react";
import { ClientActions } from "@/components/clients/client-actions";
import { ClientInvoices } from "@/components/clients/client-invoices";
import { BackLink } from "@/components/layout/back-link";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { countryName } from "@/lib/countries";
import { formatCurrency, formatDate, formatWholeCurrency } from "@/lib/format";
import { getClient } from "@/lib/queries/clients";
import { INVOICES_PER_PAGE } from "@/lib/queries/invoices";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const client = await getClient(id);
  return { title: client ? client.name : "Client not found" };
}

function Stat({
  label,
  value,
  title,
  note,
}: {
  label: string;
  value: string;
  title?: string;
  note?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 px-4 py-3 sm:px-5 sm:py-4">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-mono text-base font-semibold tabular-nums sm:text-lg" title={title}>
        {value}
      </p>
      <p className="mt-0.5 h-4 truncate text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="sr-only">{label}</dt>
        <dd className="break-words text-sm">{children}</dd>
      </div>
    </div>
  );
}

export default async function ClientPage(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const [{ id }, searchParams] = await Promise.all([props.params, props.searchParams]);
  const client = await getClient(id);
  if (!client) notFound();

  const allInvoices = client.invoice_count + client.draft_count;
  const lastPage = Math.max(1, Math.ceil(allInvoices / INVOICES_PER_PAGE));
  const page = Math.min(Math.max(1, Number(searchParams?.page) || 1), lastPage);
  const avgDays = client.avg_days_to_pay === null ? null : Math.round(client.avg_days_to_pay);
  const country = client.country?.trim();

  return (
    <>
      <PageHeader
        title={client.name}
        subtitle={client.company}
        back={<BackLink fallback="/clients" skip={[`/clients/${client.id}`]} />}
        actions={
          <ClientActions id={client.id} name={client.name} email={client.email} invoiceCount={allInvoices} />
        }
      />

      {/* 2×2 on phones, one row from sm. */}
      <Card className="mb-6 grid grid-cols-2 sm:grid-cols-4 [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(odd)]:border-r [&>*]:border-border sm:[&>*:nth-child(-n+2)]:border-b-0 sm:[&>*:not(:last-child)]:border-r">
        <Stat label="Paid to date" value={formatWholeCurrency(client.paid)} title={formatCurrency(client.paid)} />
        <Stat
          label="Outstanding"
          value={formatWholeCurrency(client.outstanding)}
          title={formatCurrency(client.outstanding)}
          note={
            client.overdue > 0 ? (
              <span className="font-medium text-danger">
                <span className="font-mono tabular-nums">{formatWholeCurrency(client.overdue)}</span> overdue
              </span>
            ) : client.outstanding > 0 ? (
              "Nothing overdue"
            ) : undefined
          }
        />
        <Stat
          label="Invoices"
          value={String(client.invoice_count)}
          note={
            client.draft_count > 0
              ? `+ ${client.draft_count} ${client.draft_count === 1 ? "draft" : "drafts"}`
              : undefined
          }
        />
        <Stat
          label="Avg. days to pay"
          value={avgDays === null ? "—" : `${avgDays} ${avgDays === 1 ? "day" : "days"}`}
          note={avgDays === null ? "Nothing paid yet" : undefined}
        />
      </Card>

      <div className="grid grid-cols-1 items-start gap-6 @page-xl:grid-cols-[minmax(0,1fr)_18rem]">
        {/* Contact comes first on small screens; in a wide page it sits to the right. */}
        <Card className="@page-xl:sticky @page-xl:top-20 @page-xl:col-start-2 @page-xl:row-start-1">
          <CardHeader title="Contact" />
          <dl className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 @page-xl:grid-cols-1">
            <ContactRow icon={Mail} label="Email">
              <a href={`mailto:${client.email}`} className="hover:text-accent-subtle-foreground hover:underline">
                {client.email}
              </a>
            </ContactRow>
            <ContactRow icon={Phone} label="Phone">
              {client.phone ? (
                <a href={`tel:${client.phone.replace(/[^\d+]/g, "")}`} className="hover:underline">
                  {client.phone}
                </a>
              ) : (
                <span className="text-muted-foreground">No phone number</span>
              )}
            </ContactRow>
            <ContactRow icon={Globe} label="Country">
              {country ? countryName(country) : <span className="text-muted-foreground">No country set</span>}
            </ContactRow>
            <ContactRow icon={CalendarDays} label="Client since">
              Client since {formatDate(client.created_at)}
            </ContactRow>
          </dl>
        </Card>

        <div className="min-w-0 @page-xl:col-start-1 @page-xl:row-start-1">
          <Suspense key={page} fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
            <ClientInvoices clientId={client.id} total={allInvoices} page={page} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
