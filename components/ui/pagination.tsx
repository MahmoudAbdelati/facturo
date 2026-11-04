"use client";

import clsx from "clsx";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { getPageItems } from "@/lib/pagination";

const itemClasses =
  "flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm tabular-nums";

export function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const pageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <PageArrow
        direction="previous"
        href={pageUrl(currentPage - 1)}
        disabled={currentPage <= 1}
      />
      {getPageItems(currentPage, totalPages).map((item, index) =>
        item === "..." ? (
          <span key={`gap-${index}`} className={clsx(itemClasses, "text-muted-foreground")}>
            …
          </span>
        ) : item === currentPage ? (
          <span
            key={item}
            aria-current="page"
            className={clsx(itemClasses, "bg-accent font-medium text-accent-foreground")}
          >
            {item}
          </span>
        ) : (
          <Link key={item} href={pageUrl(item)} className={clsx(itemClasses, "hover:bg-muted")}>
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
    <span className={className} aria-disabled="true">
      <Icon className="h-4 w-4" aria-label={label} />
    </span>
  ) : (
    <Link href={href} className={className} aria-label={label}>
      <Icon className="h-4 w-4" />
    </Link>
  );
}
