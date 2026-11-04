"use client";

import clsx from "clsx";
import Link from "next/link";
import { CircleCheck, Clock, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, menuItemClasses } from "@/components/ui/dropdown-menu";
import { deleteInvoice, setInvoiceStatus } from "@/lib/actions/invoices";
import type { InvoiceStatus } from "@/lib/types";

const iconButton =
  "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

// From lg up, edit and delete sit in the row; below lg they move into the menu.
export function RowActions({ id, status }: { id: string; status: InvoiceStatus }) {
  const editHref = `/invoices/${id}/edit`;
  const remove = deleteInvoice.bind(null, id);
  const nextStatus = status === "paid" ? "pending" : "paid";

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Link
        href={editHref}
        aria-label="Edit invoice"
        title="Edit"
        className={clsx(iconButton, "hidden lg:flex")}
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <form action={remove} className="hidden lg:block">
        <button
          type="submit"
          aria-label="Delete invoice"
          title="Delete"
          className={clsx(iconButton, "hover:text-danger")}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </form>

      <DropdownMenu label="More invoice actions">
        <Link href={editHref} role="menuitem" className={clsx(menuItemClasses, "lg:hidden")}>
          <Pencil className="h-4 w-4 text-muted-foreground" />
          Edit
        </Link>
        <form action={setInvoiceStatus.bind(null, id, nextStatus)}>
          <button type="submit" role="menuitem" className={menuItemClasses}>
            {nextStatus === "paid" ? (
              <CircleCheck className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Clock className="h-4 w-4 text-muted-foreground" />
            )}
            {nextStatus === "paid" ? "Mark as paid" : "Mark as pending"}
          </button>
        </form>
        <form action={remove} className="lg:hidden">
          <button type="submit" role="menuitem" className={clsx(menuItemClasses, "text-danger")}>
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </form>
      </DropdownMenu>
    </div>
  );
}
