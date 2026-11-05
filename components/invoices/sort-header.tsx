import clsx from "clsx";
import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { effectiveSort, sortHref, SORT_LABELS } from "@/lib/invoice-filters";
import type { InvoiceFilters, InvoiceSortKey } from "@/lib/types";

/** A table header that sorts by its column; click again to flip the direction. */
export function SortHeader({
  filters,
  sortKey,
  align = "left",
  className,
  children,
}: {
  filters: InvoiceFilters;
  sortKey: InvoiceSortKey;
  align?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}) {
  const { sort, dir } = effectiveSort(filters);
  const active = sort === sortKey;
  const Icon = !active ? ChevronsUpDown : dir === "asc" ? ArrowUp : ArrowDown;

  return (
    <th
      scope="col"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : undefined}
      className={clsx("px-3 py-2 font-medium", align === "right" && "text-right", className)}
    >
      <Link
        href={sortHref(filters, sortKey)}
        scroll={false}
        title={`Sort by ${SORT_LABELS[sortKey].toLowerCase()}`}
        className={clsx(
          "group -mx-1.5 inline-flex max-w-full items-center gap-1 rounded px-1.5 py-1 transition-colors hover:text-foreground",
          align === "right" && "flex-row-reverse",
          active && "text-foreground",
        )}
      >
        <span className="truncate">{children}</span>
        <Icon
          aria-hidden
          className={clsx(
            "h-3.5 w-3.5 shrink-0",
            !active && "opacity-0 transition-opacity group-hover:opacity-60 group-focus-visible:opacity-60",
          )}
        />
      </Link>
    </th>
  );
}
