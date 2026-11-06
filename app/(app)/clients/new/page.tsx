import type { Metadata } from "next";
import { ClientForm } from "@/components/clients/client-form";
import { BackLink } from "@/components/layout/back-link";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/actions/clients";

export const metadata: Metadata = {
  title: "New client",
};

export default function NewClientPage() {
  return (
    <>
      <div className="mx-auto max-w-2xl">
        <PageHeader title="New client" back={<BackLink fallback="/clients" />} />
      </div>
      <ClientForm action={createClient} />
    </>
  );
}
