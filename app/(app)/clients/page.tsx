import type { Metadata } from "next";
import { ClientsTable } from "@/components/clients/clients-table";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { formatCurrency, formatWholeCurrency } from "@/lib/format";
import { getClients } from "@/lib/queries/clients";

export const metadata: Metadata = {
  title: "Clients",
};

export default async function ClientsPage(props: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const searchParams = await props.searchParams;
  const clients = await getClients(searchParams?.query || "");

  const sum = (key: "outstanding" | "overdue" | "paid") =>
    clients.reduce((total, client) => total + client[key], 0);
  const totals = [
    { label: "Outstanding", value: sum("outstanding") },
    { label: "Overdue", value: sum("overdue"), danger: true },
    { label: "Paid to date", value: sum("paid") },
  ];

  return (
    <>
      <PageHeader title="Clients" />
      {/* The totals follow the search, so they always add up to the rows below. */}
      <Card className="mb-4 grid grid-cols-3 divide-x divide-border">
        {totals.map((total) => (
          <div key={total.label} className="min-w-0 px-3 py-3 sm:px-5 sm:py-4">
            <p className="truncate text-xs text-muted-foreground">{total.label}</p>
            <p
              className={
                total.danger && total.value > 0
                  ? "mt-1 truncate font-mono text-sm font-semibold tabular-nums text-danger sm:text-lg"
                  : "mt-1 truncate font-mono text-sm font-semibold tabular-nums sm:text-lg"
              }
              title={formatCurrency(total.value)}
            >
              {formatWholeCurrency(total.value)}
            </p>
          </div>
        ))}
      </Card>
      <div className="mb-4">
        <Search placeholder="Search clients…" />
      </div>
      <ClientsTable clients={clients} />
    </>
  );
}
