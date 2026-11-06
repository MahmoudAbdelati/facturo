import { Skeleton } from "@/components/ui/skeleton";

const ROWS = 10;

/** Same shape as the table: cards in a narrow page, the column layout from page-md. */
export function InvoicesTableSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface" aria-busy="true" aria-label="Loading invoices">
      <ul className="divide-y divide-border @page-md:hidden">
        {Array.from({ length: ROWS }, (_, i) => (
          <li key={i} className="flex items-center gap-3 py-3 pl-4 pr-2">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex justify-between gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between gap-3">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-4 w-14 rounded-full" />
              </div>
            </div>
            <div className="h-8 w-8 shrink-0" />
          </li>
        ))}
      </ul>

      <div className="hidden @page-md:block">
        <div className="flex h-11 items-center gap-6 border-b border-border px-3">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="ml-auto h-3 w-14" />
          <Skeleton className="h-3 w-12" />
          <div className="w-12 @page-xl:w-32" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: ROWS }, (_, i) => (
            <div key={i} className="flex h-[3.8rem] items-center gap-6 px-3">
              <div className="w-[7.5rem] space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                <div className="min-w-0 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-44 max-w-full" />
                </div>
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <div className="w-12 @page-xl:w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
