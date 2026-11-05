import { formatCurrency } from "@/lib/format";
import { getCashFlow } from "@/lib/queries/overview";

const CHART_HEIGHT = 240;

const monthLabel = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});

// Plain bars for now; the Recharts area chart replaces this on the overview day.
export async function CashFlowChart() {
  const months = await getCashFlow(12);
  const max = Math.max(1, ...months.map((m) => m.collected));

  return (
    <section className="rounded-lg border border-border bg-surface p-5 lg:col-span-5">
      <h2 className="text-sm font-medium">Cash flow</h2>
      <p className="text-sm text-muted-foreground">Collected, last 12 months</p>
      <div className="mt-6 flex items-end gap-2" style={{ height: CHART_HEIGHT + 24 }}>
        {months.map((m) => {
          const label = monthLabel.format(new Date(m.month));
          return (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-accent/80"
                style={{ height: (m.collected / max) * CHART_HEIGHT }}
                title={`${label}: ${formatCurrency(m.collected)}`}
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
