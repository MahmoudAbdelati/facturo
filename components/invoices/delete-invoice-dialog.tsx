"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { deleteInvoice } from "@/lib/actions/invoices";

/** Asks before deleting an invoice, then reports the result in a toast. */
export function DeleteInvoiceDialog({
  id,
  number,
  open,
  onClose,
  onDeleted,
}: {
  id: string;
  number: string;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      const { ok } = await deleteInvoice(id);
      if (!ok) {
        toast.error(`Couldn't delete ${number}`, { description: "Please try again." });
        return;
      }
      toast.success(`${number} deleted`);
      onClose();
      onDeleted?.();
    });

  return (
    <Dialog
      open={open}
      onClose={() => !isPending && onClose()}
      title={`Delete ${number}?`}
      description="The invoice and its line items are removed for good. This can't be undone."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirm} aria-disabled={isPending} disabled={isPending}>
            {isPending ? "Deleting…" : "Delete invoice"}
          </Button>
        </>
      }
    />
  );
}
