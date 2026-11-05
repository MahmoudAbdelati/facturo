import { AlertCircle, Banknote, Clock, Timer } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { getKpis } from "@/lib/queries/overview";
import type { Kpi } from "@/lib/types";

export async function KpiCards() {
  const { collected, outstanding, overdue, avgDaysToPay } = await getKpis();
  const days = (n: number) => `${Math.round(n)} days`;

  return (
    <>
      <KpiCard label="Collected" kpi={collected} format={formatCurrency} icon={Banknote} />
      <KpiCard label="Outstanding" kpi={outstanding} format={formatCurrency} icon={Clock} />
      <KpiCard label="Overdue" kpi={overdue} format={formatCurrency} icon={AlertCircle} />
      <KpiCard label="Avg. days to pay" kpi={avgDaysToPay} format={days} icon={Timer} />
    </>
  );
}

// Plain trend text for now; the styled cards come with the overview page.
function KpiCard({
  label,
  kpi,
  format,
  icon: Icon,
}: {
  label: string;
  kpi: Kpi;
  format: (value: number) => string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const change = kpi.previous
    ? Math.round(((kpi.value - kpi.previous) / kpi.previous) * 100)
    : null;

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 truncate font-mono text-2xl font-medium tabular-nums">
        {format(kpi.value)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {change === null
          ? "No data for the 30 days before"
          : `${change > 0 ? "+" : ""}${change}% vs previous 30 days`}
      </p>
    </div>
  );
}
