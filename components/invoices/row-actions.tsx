"use client";

import clsx from "clsx";
import Link from "next/link";
import { CircleCheck, Pencil, Send, Trash2, Undo2 } from "lucide-react";
import { DropdownMenu, MenuSeparator, menuItemClasses } from "@/components/ui/dropdown-menu";
import { deleteInvoice, setInvoiceStatus } from "@/lib/actions/invoices";
import type { DisplayStatus, InvoiceStatus } from "@/lib/types";

const iconButton =
  "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

type StatusAction = { to: InvoiceStatus; label: string; icon: typeof Send };

/** What a status can move to next, in the order the menu lists them. */
const STATUS_ACTIONS: Record<DisplayStatus, StatusAction[]> = {
  draft: [
    { to: "sent", label: "Mark as sent", icon: Send },
    { to: "paid", label: "Mark as paid", icon: CircleCheck },
  ],
  sent: [
    { to: "paid", label: "Mark as paid", icon: CircleCheck },
    { to: "draft", label: "Back to draft", icon: Undo2 },
  ],
  overdue: [{ to: "paid", label: "Mark as paid", icon: CircleCheck }],
  paid: [{ to: "sent", label: "Mark as unpaid", icon: Undo2 }],
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
  const remove = deleteInvoice.bind(null, id);

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Link
        href={editHref}
        aria-label={`Edit ${number}`}
        title="Edit"
        className={clsx(iconButton, "hidden xl:flex")}
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <form action={remove} className="hidden xl:block">
        <button
          type="submit"
          aria-label={`Delete ${number}`}
          title="Delete"
          className={clsx(iconButton, "hover:text-danger")}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </form>

      <DropdownMenu label={`Actions for ${number}`} className="w-44">
        <Link href={editHref} role="menuitem" className={clsx(menuItemClasses, "xl:hidden")}>
          <Pencil className="h-4 w-4 text-muted-foreground" />
          Edit
        </Link>
        <div className="xl:hidden">
          <MenuSeparator />
        </div>
        {STATUS_ACTIONS[status].map(({ to, label, icon: Icon }) => (
          <form key={to} action={setInvoiceStatus.bind(null, id, to)}>
            <button type="submit" role="menuitem" className={menuItemClasses}>
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </button>
          </form>
        ))}
        <div className="xl:hidden">
          <MenuSeparator />
          <form action={remove}>
            <button type="submit" role="menuitem" className={clsx(menuItemClasses, "text-danger")}>
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </form>
        </div>
      </DropdownMenu>
    </div>
  );
}
