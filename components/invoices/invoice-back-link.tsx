"use client";

import { ArrowLeft } from "lucide-react";
import { labelFor, ReturnLink } from "@/components/layout/return-link";

/**
 * "← Invoices" (or wherever the user came from) on an invoice's page. It skips this
 * invoice's own pages and the invoice forms, so after saving an edit it still goes
 * back to the list rather than into the form.
 */
export function InvoiceBackLink({ id }: { id: string }) {
  const skip = (path: string) =>
    path.startsWith(`/invoices/${id}`) || path === "/invoices/new" || path.endsWith("/edit");

  return (
    <ReturnLink
      fallback="/invoices"
      skip={skip}
      className="-ml-1 mb-1 inline-flex items-center gap-1 rounded-md px-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {(url) => (
        <>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {labelFor(url)}
        </>
      )}
    </ReturnLink>
  );
}
