"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, Pencil, Printer, Trash2 } from "lucide-react";
import { DeleteInvoiceDialog } from "@/components/invoices/delete-invoice-dialog";
import { STATUS_ACTIONS, type StatusAction } from "@/components/invoices/status-actions";
import { Button, buttonClasses } from "@/components/ui/button";
import { DropdownMenu, MenuSeparator, menuItemClasses } from "@/components/ui/dropdown-menu";
import { duplicateInvoice, setInvoiceStatus } from "@/lib/actions/invoices";
import type { DisplayStatus } from "@/lib/types";

/** Opens the print dialog with a file name that says which invoice it is. */
function printInvoice(fileName: string) {
  const title = document.title;
  document.title = fileName;
  window.addEventListener("afterprint", () => (document.title = title), { once: true });
  window.print();
}

/**
 * The detail page's toolbar. The next step for the invoice (send it, get it paid)
 * is the one solid button; once it's paid, printing is.
 */
export function InvoiceActions({
  id,
  number,
  clientName,
  status,
}: {
  id: string;
  number: string;
  clientName: string;
  status: DisplayStatus;
}) {
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [primary, ...others] = status === "paid" ? [] : STATUS_ACTIONS[status];
  const menuStatusActions = status === "paid" ? STATUS_ACTIONS.paid : others;
  const print = () => printInvoice(`${number} ${clientName}`);

  const changeStatus = ({ to, done }: StatusAction) =>
    startTransition(async () => {
      const { ok } = await setInvoiceStatus(id, to);
      if (ok) {
        toast.success(`${number} ${done}`);
        router.refresh();
      } else toast.error(`Couldn't update ${number}`, { description: "Please try again." });
    });

  const duplicate = () =>
    startTransition(async () => {
      const result = await duplicateInvoice(id);
      if (!result.ok) {
        toast.error(`Couldn't duplicate ${number}`, { description: "Please try again." });
        return;
      }
      toast.success(`Copied ${number} as ${result.invoice.number}`, {
        description: "It's a draft dated today.",
      });
      router.push(`/invoices/${result.invoice.id}/edit`);
    });

  return (
    <div className="flex items-center gap-2 print:hidden" aria-busy={isPending}>
      <Button
        variant={primary ? "secondary" : "primary"}
        onClick={print}
        title="Print, or save as PDF"
        className="hidden sm:inline-flex"
      >
        <Printer className="h-4 w-4" />
        Print
      </Button>
      <Link href={`/invoices/${id}/edit`} className={clsx(buttonClasses("secondary"), "hidden sm:inline-flex")}>
        <Pencil className="h-4 w-4" />
        Edit
      </Link>
      {primary && (
        <Button onClick={() => changeStatus(primary)} disabled={isPending}>
          <primary.icon className="h-4 w-4" />
          {primary.label}
        </Button>
      )}

      <DropdownMenu
        label={`More actions for ${number}`}
        className="w-48"
        triggerClassName={clsx(buttonClasses("secondary", "icon"), "h-10 w-10")}
      >
        <button type="button" role="menuitem" onClick={print} className={clsx(menuItemClasses, "sm:hidden")}>
          <Printer className="h-4 w-4 text-muted-foreground" />
          Print or save PDF
        </button>
        <Link href={`/invoices/${id}/edit`} role="menuitem" className={clsx(menuItemClasses, "sm:hidden")}>
          <Pencil className="h-4 w-4 text-muted-foreground" />
          Edit
        </Link>
        <button
          type="button"
          role="menuitem"
          onClick={duplicate}
          disabled={isPending}
          className={menuItemClasses}
        >
          <Copy className="h-4 w-4 text-muted-foreground" />
          Duplicate
        </button>
        {menuStatusActions.length > 0 && <MenuSeparator />}
        {menuStatusActions.map((action) => (
          <button
            key={action.to}
            type="button"
            role="menuitem"
            disabled={isPending}
            onClick={() => changeStatus(action)}
            className={menuItemClasses}
          >
            <action.icon className="h-4 w-4 text-muted-foreground" />
            {action.label}
          </button>
        ))}
        <MenuSeparator />
        <button
          type="button"
          role="menuitem"
          onClick={() => setConfirmingDelete(true)}
          className={clsx(menuItemClasses, "text-danger")}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </DropdownMenu>

      <DeleteInvoiceDialog
        id={id}
        number={number}
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onDeleted={() => router.push("/invoices")}
      />
    </div>
  );
}
