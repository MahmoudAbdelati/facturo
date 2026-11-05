import clsx from "clsx";
import Link from "next/link";
import { invoicesHref } from "@/lib/invoice-filters";
import type { DisplayStatus, InvoiceFilters, StatusCounts } from "@/lib/types";

const TABS: { status: DisplayStatus | undefined; label: string }[] = [
  { status: undefined, label: "All" },
  { status: "draft", label: "Drafts" },
  { status: "sent", label: "Sent" },
  { status: "overdue", label: "Overdue" },
  { status: "paid", label: "Paid" },
];

/**
 * Links that filter the list by status. The counts follow the search, not the selected tab.
 * On phones the five tabs share the width as a grid, count above label, so nothing scrolls.
 */
export function StatusTabs({ filters, counts }: { filters: InvoiceFilters; counts: StatusCounts }) {
  return (
    <nav aria-label="Filter by status">
      <ul className="grid grid-cols-5 border-b border-border sm:flex sm:gap-1">
        {TABS.map(({ status, label }) => {
          const active = filters.status === status;
          const count = counts[status ?? "all"];
          const alert = status === "overdue" && count > 0;
          return (
            <li key={label} className="min-w-0">
              <Link
                href={invoicesHref(filters, { status })}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "-mb-px flex flex-col-reverse items-center gap-0.5 border-b-2 px-1 pb-2 pt-1 font-medium transition-colors",
                  "sm:flex-row sm:gap-2 sm:px-3 sm:pb-2.5",
                  active
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <span className="max-w-full truncate text-xs sm:text-sm">{label}</span>
                <span
                  className={clsx(
                    "rounded-full text-center tabular-nums",
                    // Phones: a plain number. From sm: a small pill beside the label.
                    "text-base sm:min-w-6 sm:px-1.5 sm:py-0.5 sm:text-xs",
                    active
                      ? "sm:bg-accent-subtle sm:text-accent-subtle-foreground"
                      : alert
                        ? "text-danger sm:bg-danger/10"
                        : "sm:bg-muted",
                  )}
                >
                  {count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
