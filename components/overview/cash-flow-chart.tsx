import { Card } from "@/components/ui/card";
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
    <Card className="p-5 lg:col-span-5">
      <h2 className="text-sm font-medium">Cash flow</h2>
      <p className="text-sm text-muted-foreground">Collected, last 12 months</p>
      <div className="mt-6 flex items-end gap-1 sm:gap-2" style={{ height: CHART_HEIGHT + 24 }}>
        {months.map((m) => {
          const label = monthLabel.format(new Date(m.month));
          return (
            <div key={m.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-accent/80"
                style={{ height: (m.collected / max) * CHART_HEIGHT }}
                title={`${label}: ${formatCurrency(m.collected)}`}
              />
              {/* Twelve three-letter months don't fit on a phone, so show initials there. */}
              <span className="text-xs text-muted-foreground">
                <span className="sm:hidden" aria-hidden="true">
                  {label[0]}
                </span>
                <span className="sr-only sm:not-sr-only">{label}</span>
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
