import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function KpiCardsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }, (_, i) => (
        <Card key={i} className="p-5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-4 h-7 w-28" />
        </Card>
      ))}
    </>
  );
}

export function CashFlowChartSkeleton() {
  return (
    <Card className="p-5 lg:col-span-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-4 w-28" />
      <Skeleton className="mt-6 h-[264px] w-full" />
    </Card>
  );
}

export function RecentInvoicesSkeleton() {
  return (
    <Card className="p-5 lg:col-span-3">
      <Skeleton className="h-4 w-32" />
      <div className="mt-4 space-y-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function OverviewSkeleton() {
  return (
    <>
      <Skeleton className="mb-6 h-8 w-36" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCardsSkeleton />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-8">
        <CashFlowChartSkeleton />
        <RecentInvoicesSkeleton />
      </div>
    </>
  );
}
