import { Suspense } from "react";
import type { Metadata } from "next";
import { CashFlowChart } from "@/components/overview/cash-flow-chart";
import { KpiCards } from "@/components/overview/kpi-cards";
import { OverdueInvoices } from "@/components/overview/overdue-invoices";
import { RecentActivity } from "@/components/overview/recent-activity";
import { TopClients } from "@/components/overview/top-clients";
import {
  CashFlowChartSkeleton,
  KpiCardsSkeleton,
  OverdueInvoicesSkeleton,
  OverviewGrid,
  RecentActivitySkeleton,
  TopClientsSkeleton,
} from "@/components/overview/skeletons";
import { getCurrentUser } from "@/lib/queries/users";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function OverviewPage() {
  const user = await getCurrentUser();
  const firstName = user?.name.split(/\s+/)[0];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {firstName ? `Welcome back, ${firstName}` : "Overview"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s where your money stands today.
        </p>
      </div>
      <OverviewGrid
        kpis={
          <Suspense fallback={<KpiCardsSkeleton />}>
            <KpiCards />
          </Suspense>
        }
        chart={
          <Suspense fallback={<CashFlowChartSkeleton />}>
            <CashFlowChart />
          </Suspense>
        }
        activity={
          <Suspense fallback={<RecentActivitySkeleton />}>
            <RecentActivity />
          </Suspense>
        }
        topClients={
          <Suspense fallback={<TopClientsSkeleton />}>
            <TopClients />
          </Suspense>
        }
        overdue={
          <Suspense fallback={<OverdueInvoicesSkeleton />}>
            <OverdueInvoices />
          </Suspense>
        }
      />
    </>
  );
}
