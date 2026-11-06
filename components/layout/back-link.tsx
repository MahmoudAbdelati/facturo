"use client";

import { ArrowLeft } from "lucide-react";
import { labelFor, ReturnLink } from "@/components/layout/return-link";

/** Forms are never a place to go back to. */
export const isFormPath = (path: string) => path.endsWith("/new") || path.endsWith("/edit");

/**
 * "← Invoices", "← Client", … : a link back to the last page visited before this one.
 * It never leads into a form (a path ending in /new or /edit) or to a path under one of
 * `skip`, so after saving it doesn't send the user back into what they just finished.
 * Opened from a bookmark or a new tab, it goes to `fallback`.
 */
export function BackLink({ fallback, skip = [] }: { fallback: string; skip?: string[] }) {
  const skipped = (path: string) => isFormPath(path) || skip.some((prefix) => path.startsWith(prefix));

  return (
    <ReturnLink
      fallback={fallback}
      skip={skipped}
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
