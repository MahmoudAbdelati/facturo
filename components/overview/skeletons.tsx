import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Each skeleton matches the height of the card it stands in for, so nothing jumps when data arrives.

export function KpiCardsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }, (_, i) => (
        <Card key={i} className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="hidden h-8 w-8 sm:block" />
          </div>
          <Skeleton className="mt-2 h-7 w-24 sm:h-8 sm:w-32" />
          <Skeleton className="mt-2 h-5 w-36" />
        </Card>
      ))}
    </>
  );
}

function HeaderSkeleton({ description = true }: { description?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-5">
      <div>
        <Skeleton className="h-4 w-24" />
        {description && <Skeleton className="mt-2 h-4 w-40" />}
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
  );
}

export function CashFlowChartSkeleton() {
  return (
    <Card className="xl:col-span-3">
      <HeaderSkeleton />
      <div className="flex gap-8 px-5 pt-4">
        {[0, 1].map((i) => (
          <div key={i}>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-1.5 h-6 w-28" />
          </div>
        ))}
      </div>
      <div className="px-5 pb-4 pt-4">
        <Skeleton className="h-[228px] w-full" />
      </div>
    </Card>
  );
}

function ListSkeleton({
  rows,
  description = true,
  className,
}: {
  rows: number;
  description?: boolean;
  className?: string;
}) {
  return (
    <Card className={className}>
      <HeaderSkeleton description={description} />
      <div className="mt-3 space-y-1 px-2 pb-3">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export const RecentActivitySkeleton = () => <ListSkeleton rows={6} description={false} className="xl:col-span-2" />;
export const TopClientsSkeleton = () => <ListSkeleton rows={5} />;
export const OverdueInvoicesSkeleton = () => <ListSkeleton rows={5} />;

export function OverviewSkeleton() {
  return (
    <>
      <div className="mb-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <OverviewGrid
        kpis={<KpiCardsSkeleton />}
        chart={<CashFlowChartSkeleton />}
        activity={<RecentActivitySkeleton />}
        topClients={<TopClientsSkeleton />}
        overdue={<OverdueInvoicesSkeleton />}
      />
    </>
  );
}

/** The overview layout, shared by the page and its loading state. */
export function OverviewGrid({
  kpis,
  chart,
  activity,
  topClients,
  overdue,
}: Record<"kpis" | "chart" | "activity" | "topClients" | "overdue", React.ReactNode>) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">{kpis}</div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {chart}
        {activity}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {topClients}
        {overdue}
      </div>
    </div>
  );
}
