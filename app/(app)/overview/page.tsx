import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CashFlowChart } from "@/components/overview/cash-flow-chart";
import { KpiCards } from "@/components/overview/kpi-cards";
import { RecentInvoices } from "@/components/overview/recent-invoices";
import {
  CashFlowChartSkeleton,
  KpiCardsSkeleton,
  RecentInvoicesSkeleton,
} from "@/components/overview/skeletons";

export const metadata: Metadata = {
  title: "Overview",
};

export default function OverviewPage() {
  return (
    <>
      <PageHeader title="Overview" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<KpiCardsSkeleton />}>
          <KpiCards />
        </Suspense>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-8">
        <Suspense fallback={<CashFlowChartSkeleton />}>
          <CashFlowChart />
        </Suspense>
        <Suspense fallback={<RecentInvoicesSkeleton />}>
          <RecentInvoices />
        </Suspense>
      </div>
    </>
  );
}
