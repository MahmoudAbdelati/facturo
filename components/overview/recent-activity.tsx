import Link from "next/link";
import clsx from "clsx";
import { CircleCheck, Inbox, Send } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/format";
import { getRecentActivity } from "@/lib/queries/overview";
import { CardLink } from "./card-link";

export async function RecentActivity() {
  const events = await getRecentActivity(6);

  return (
    <Card className="xl:col-span-2">
      <CardHeader title="Recent activity" actions={<CardLink href="/invoices">All invoices</CardLink>} />
      {events.length === 0 ? (
        <EmptyState icon={Inbox} title="Nothing yet" description="Sent invoices and payments show up here." />
      ) : (
        <ul className="mt-2 px-2 pb-2">
          {events.map((event) => {
            const paid = event.type === "paid";
            const Icon = paid ? CircleCheck : Send;
            return (
              <li key={`${event.type}-${event.invoice_id}`}>
                {/* The edit page stands in until invoices get their own detail page. */}
                <Link
                  href={`/invoices/${event.invoice_id}/edit`}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted/60"
                >
                  <span
                    className={clsx(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      paid ? "bg-accent-subtle text-accent-subtle-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      <span className="font-medium">{event.client_name}</span>
                      <span className="text-muted-foreground"> {paid ? "paid" : "was sent"}</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      <span className="font-mono">{event.number}</span> · {formatDate(event.date)}
                    </p>
                  </div>
                  <p
                    className={clsx(
                      "shrink-0 font-mono text-sm tabular-nums",
                      paid && "text-accent-subtle-foreground",
                    )}
                  >
                    {paid && "+"}
                    {formatCurrency(event.total)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
