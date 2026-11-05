"use client";

import clsx from "clsx";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { getPageItems } from "@/lib/pagination";

const itemClasses =
  "flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm tabular-nums transition-colors";

/**
 * "Showing 11–20 of 148" plus page links. On phones the numbers collapse to
 * "3 / 15" between the arrows, so the row always fits.
 */
export function Pagination({
  totalItems,
  pageSize,
  noun = "results",
}: {
  totalItems: number;
  pageSize: number;
  noun?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, Number(searchParams.get("page")) || 1), totalPages);

  const pageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) params.set("page", page.toString());
    else params.delete("page");
    const search = params.toString();
    return search ? `${pathname}?${search}` : pathname;
  };

  if (totalItems === 0) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium tabular-nums text-foreground">
          {from}–{to}
        </span>{" "}
        of <span className="font-medium tabular-nums text-foreground">{totalItems}</span> {noun}
      </p>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <PageArrow direction="previous" href={pageUrl(currentPage - 1)} disabled={currentPage <= 1} />
          <span className={clsx(itemClasses, "text-muted-foreground sm:hidden")}>
            <span className="font-medium text-foreground">{currentPage}</span>&nbsp;/ {totalPages}
          </span>
          {getPageItems(currentPage, totalPages).map((item, index) =>
            item === "..." ? (
              <span
                key={`gap-${index}`}
                aria-hidden
                className={clsx(itemClasses, "hidden text-muted-foreground sm:flex")}
              >
                …
              </span>
            ) : item === currentPage ? (
              <span
                key={item}
                aria-current="page"
                className={clsx(itemClasses, "hidden bg-foreground/10 font-medium sm:flex")}
              >
                {item}
              </span>
            ) : (
              <Link
                key={item}
                href={pageUrl(item)}
                aria-label={`Page ${item}`}
                className={clsx(itemClasses, "hidden text-muted-foreground hover:bg-muted hover:text-foreground sm:flex")}
              >
                {item}
              </Link>
            ),
          )}
          <PageArrow
            direction="next"
            href={pageUrl(currentPage + 1)}
            disabled={currentPage >= totalPages}
          />
        </nav>
      )}
    </div>
  );
}

function PageArrow({
  href,
  direction,
  disabled,
}: {
  href: string;
  direction: "previous" | "next";
  disabled: boolean;
}) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
  const label = direction === "previous" ? "Previous page" : "Next page";
  const className = clsx(
    itemClasses,
    "border border-border",
    disabled ? "pointer-events-none text-muted-foreground/50" : "hover:bg-muted",
  );

  return disabled ? (
    <span className={className} aria-disabled="true" aria-label={label} role="link">
      <Icon className="h-4 w-4" />
    </span>
  ) : (
    <Link href={href} className={className} aria-label={label}>
      <Icon className="h-4 w-4" />
    </Link>
  );
}
