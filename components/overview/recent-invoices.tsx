import { Avatar } from "@/components/ui/avatar";
import { Card, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { getRecentActivity } from "@/lib/queries/overview";

export async function RecentInvoices() {
  const events = await getRecentActivity(5);

  return (
    <Card className="lg:col-span-3">
      <CardHeader title="Recent activity" />
      <ul className="mt-2 divide-y divide-border px-5 pb-2">
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
    </Card>
  );
}
