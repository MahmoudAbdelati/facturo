import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/format";
import { getRecentActivity } from "@/lib/queries/overview";

export async function RecentInvoices() {
  const events = await getRecentActivity(5);

  return (
    <section className="rounded-lg border border-border bg-surface p-5 lg:col-span-3">
      <h2 className="text-sm font-medium">Recent activity</h2>
      <ul className="mt-4 divide-y divide-border">
        {events.map((event) => (
          <li
            key={`${event.type}-${event.invoice_id}`}
            className="flex items-center justify-between gap-3 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={event.client_name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{event.client_name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {event.type === "paid" ? "Paid" : "Sent"} {event.number} ·{" "}
                  {formatDate(event.date)}
                </p>
              </div>
            </div>
            <p className="font-mono text-sm tabular-nums">{formatCurrency(event.total)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
