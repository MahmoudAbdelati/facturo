import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientForm } from "@/components/clients/client-form";
import { BackLink } from "@/components/layout/back-link";
import { PageHeader } from "@/components/layout/page-header";
import { updateClient } from "@/lib/actions/clients";
import { getClient } from "@/lib/queries/clients";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const client = await getClient(id);
  return { title: client ? `Edit ${client.name}` : "Client not found" };
}

export default async function EditClientPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const client = await getClient(id);
  if (!client) notFound();

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title={`Edit ${client.name}`}
          back={<BackLink fallback={`/clients/${client.id}`} />}
        />
      </div>
      <ClientForm client={client} action={updateClient.bind(null, id)} />
    </>
  );
}
