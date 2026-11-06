"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button, buttonClasses } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { deleteClient } from "@/lib/actions/clients";

/**
 * Asks before deleting a client. A client with invoices can't be deleted (the invoices
 * are the record of what was billed), so then it explains that instead.
 */
export function DeleteClientDialog({
  id,
  name,
  invoiceCount,
  open,
  onClose,
  onDeleted,
}: {
  id: string;
  name: string;
  /** All of the client's invoices, drafts included. */
  invoiceCount: number;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      const result = await deleteClient(id);
      if (result.ok) {
        toast.success(`${name} deleted`);
        onClose();
        onDeleted?.();
      } else if (result.reason === "has-invoices") {
        toast.error(`${name} has invoices now`, { description: "Delete those first." });
        onClose();
      } else {
        toast.error(`Couldn't delete ${name}`, { description: "Please try again." });
      }
    });

  if (invoiceCount > 0) {
    const invoices = `${invoiceCount} ${invoiceCount === 1 ? "invoice" : "invoices"}`;
    return (
      <Dialog
        open={open}
        onClose={onClose}
        title={`${name} can't be deleted`}
        description={`They have ${invoices}, and invoices are your record of what was billed, so their client stays. Delete the ${invoices} first if you really want them gone.`}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Link href={`/invoices?query=${encodeURIComponent(name)}`} className={buttonClasses("primary")}>
              View invoices
            </Link>
          </>
        }
      />
    );
  }

  return (
    <Dialog
      open={open}
      onClose={() => !isPending && onClose()}
      title={`Delete ${name}?`}
      description="Their contact details are removed for good. This can't be undone."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirm} aria-disabled={isPending} disabled={isPending}>
            {isPending ? "Deleting…" : "Delete client"}
          </Button>
        </>
      }
    />
  );
}
