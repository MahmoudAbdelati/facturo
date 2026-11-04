import type { Metadata } from "next";
import { ClientsTable } from "@/components/clients/clients-table";
import { PageHeader } from "@/components/layout/page-header";
import { Search } from "@/components/ui/search";
import { getClients } from "@/lib/queries/clients";

export const metadata: Metadata = {
  title: "Clients",
};

export default async function ClientsPage(props: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const searchParams = await props.searchParams;
  const clients = await getClients(searchParams?.query || "");

  return (
    <>
      <PageHeader title="Clients" />
      <div className="mb-4">
        <Search placeholder="Search clients…" />
      </div>
      <ClientsTable clients={clients} />
    </>
  );
}
