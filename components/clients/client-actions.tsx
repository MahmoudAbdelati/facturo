"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Pencil, Plus, Trash2 } from "lucide-react";
import { DeleteClientDialog } from "@/components/clients/delete-client-dialog";
import { buttonClasses } from "@/components/ui/button";
import { DropdownMenu, MenuSeparator, menuItemClasses } from "@/components/ui/dropdown-menu";

/** The client page's toolbar: billing them again is the one solid button. */
export function ClientActions({
  id,
  name,
  email,
  invoiceCount,
}: {
  id: string;
  name: string;
  email: string;
  invoiceCount: number;
}) {
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Link href={`/clients/${id}/edit`} className={clsx(buttonClasses("secondary"), "hidden sm:inline-flex")}>
        <Pencil className="h-4 w-4" />
        Edit
      </Link>
      <Link href={`/invoices/new?client=${id}`} className={buttonClasses()}>
        <Plus className="h-4 w-4" />
        New invoice
      </Link>

      <DropdownMenu
        label={`More actions for ${name}`}
        className="w-48"
        triggerClassName={clsx(buttonClasses("secondary", "icon"), "h-10 w-10")}
      >
        <Link href={`/clients/${id}/edit`} role="menuitem" className={clsx(menuItemClasses, "sm:hidden")}>
          <Pencil className="h-4 w-4 text-muted-foreground" />
          Edit
        </Link>
        <a href={`mailto:${email}`} role="menuitem" className={menuItemClasses}>
          <Mail className="h-4 w-4 text-muted-foreground" />
          Email {name.split(" ")[0]}
        </a>
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

      <DeleteClientDialog
        id={id}
        name={name}
        invoiceCount={invoiceCount}
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onDeleted={() => router.push("/clients")}
      />
    </div>
  );
}
