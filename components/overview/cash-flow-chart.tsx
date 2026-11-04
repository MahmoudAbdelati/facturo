import { getMonthlyRevenue } from "@/lib/queries/overview";

const CHART_HEIGHT = 240;

// Plain bars for now; replaced by an area chart once cash flow comes from invoices.
export async function CashFlowChart() {
  const months = await getMonthlyRevenue();
  const max = Math.max(1, ...months.map((m) => m.revenue));

  return (
    <section className="rounded-lg border border-border bg-surface p-5 lg:col-span-5">
      <h2 className="text-sm font-medium">Cash flow</h2>
      <p className="text-sm text-muted-foreground">Last 12 months</p>
      {months.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No payments yet.</p>
      ) : (
        <div className="mt-6 flex items-end gap-2" style={{ height: CHART_HEIGHT + 24 }}>
          {months.map((m) => (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-accent/80"
                style={{ height: (m.revenue / max) * CHART_HEIGHT }}
                title={`${m.month}: $${m.revenue.toLocaleString("en-US")}`}
              />
              <span className="text-xs text-muted-foreground">{m.month}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
