"use client";

import clsx from "clsx";
import Link from "next/link";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Check } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { DropdownMenu, MenuSeparator, menuItemClasses } from "@/components/ui/dropdown-menu";
import { effectiveSort, invoicesHref, SORT_LABELS } from "@/lib/invoice-filters";
import type { InvoiceFilters, InvoiceSortKey } from "@/lib/types";

// Invoice numbers follow issue dates, so "number" isn't offered separately.
const MENU_KEYS: InvoiceSortKey[] = ["issue_date", "due_date", "client", "total", "status"];

/** Sort picker for the card list on phones, where there are no column headers to click. */
export function SortMenu({ filters }: { filters: InvoiceFilters }) {
  const { sort, dir } = effectiveSort(filters);
  const DirIcon = dir === "asc" ? ArrowUpNarrowWide : ArrowDownWideNarrow;

  return (
    <DropdownMenu
      label={`Sort: ${SORT_LABELS[sort]}, ${dir === "asc" ? "ascending" : "descending"}`}
      trigger={<DirIcon className="h-4 w-4" />}
      triggerClassName={clsx(buttonClasses("secondary", "icon"), "h-10 w-10 aria-expanded:bg-muted")}
      className="w-48"
    >
      {MENU_KEYS.map((key) => (
        <Link
          key={key}
          href={invoicesHref(filters, { sort: key, dir: key === sort ? dir : undefined })}
          role="menuitemradio"
          aria-checked={key === sort}
          scroll={false}
          className={menuItemClasses}
        >
          <Check className={clsx("h-4 w-4", key !== sort && "invisible")} />
          {SORT_LABELS[key]}
        </Link>
      ))}
      <MenuSeparator />
      {(["asc", "desc"] as const).map((value) => (
        <Link
          key={value}
          href={invoicesHref(filters, { sort, dir: value })}
          role="menuitemradio"
          aria-checked={value === dir}
          scroll={false}
          className={menuItemClasses}
        >
          <Check className={clsx("h-4 w-4", value !== dir && "invisible")} />
          {value === "asc" ? "Ascending" : "Descending"}
        </Link>
      ))}
    </DropdownMenu>
  );
}
