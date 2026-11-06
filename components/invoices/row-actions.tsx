"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CircleCheck, Pencil, Send, Trash2, Undo2 } from "lucide-react";
import { DeleteInvoiceDialog } from "@/components/invoices/delete-invoice-dialog";
import { DropdownMenu, MenuSeparator, menuItemClasses } from "@/components/ui/dropdown-menu";
import { setInvoiceStatus } from "@/lib/actions/invoices";
import type { DisplayStatus, InvoiceStatus } from "@/lib/types";

const iconButton =
  "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

type StatusAction = { to: InvoiceStatus; label: string; done: string; icon: typeof Send };

/** What a status can move to next, in the order the menu lists them. */
const STATUS_ACTIONS: Record<DisplayStatus, StatusAction[]> = {
  draft: [
    { to: "sent", label: "Mark as sent", done: "marked as sent", icon: Send },
    { to: "paid", label: "Mark as paid", done: "marked as paid", icon: CircleCheck },
  ],
  sent: [
    { to: "paid", label: "Mark as paid", done: "marked as paid", icon: CircleCheck },
    { to: "draft", label: "Back to draft", done: "moved back to draft", icon: Undo2 },
  ],
  overdue: [{ to: "paid", label: "Mark as paid", done: "marked as paid", icon: CircleCheck }],
  paid: [{ to: "sent", label: "Mark as unpaid", done: "marked as unpaid", icon: Undo2 }],
};

// From xl up, edit and delete sit in the row; below xl they move into the menu.
export function RowActions({
  id,
  number,
  status,
}: {
  id: string;
  number: string;
  status: DisplayStatus;
}) {
  const editHref = `/invoices/${id}/edit`;
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const changeStatus = ({ to, done }: StatusAction) =>
    startTransition(async () => {
      const { ok } = await setInvoiceStatus(id, to);
      if (ok) toast.success(`${number} ${done}`);
      else toast.error(`Couldn't update ${number}`, { description: "Please try again." });
    });

  return (
    <div className="flex items-center justify-end gap-0.5" aria-busy={isPending}>
      <Link
        href={editHref}
        aria-label={`Edit ${number}`}
        title="Edit"
        className={clsx(iconButton, "hidden xl:flex")}
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={() => setConfirmingDelete(true)}
        aria-label={`Delete ${number}`}
        title="Delete"
        className={clsx(iconButton, "hidden hover:text-danger xl:flex")}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <DropdownMenu label={`Actions for ${number}`} className="w-44">
        <Link href={editHref} role="menuitem" className={clsx(menuItemClasses, "xl:hidden")}>
          <Pencil className="h-4 w-4 text-muted-foreground" />
          Edit
        </Link>
        <div className="xl:hidden">
          <MenuSeparator />
        </div>
        {STATUS_ACTIONS[status].map((action) => (
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
        <div className="xl:hidden">
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
        </div>
      </DropdownMenu>

      <DeleteInvoiceDialog
        id={id}
        number={number}
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
