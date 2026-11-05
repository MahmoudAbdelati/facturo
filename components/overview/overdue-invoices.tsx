import Link from "next/link";
import { PartyPopper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/format";
import { getOverdueInvoices } from "@/lib/queries/overview";
import { CardLink } from "./card-link";

export async function OverdueInvoices() {
  const invoices = await getOverdueInvoices(5);

  return (
    <Card>
      <CardHeader
        title="Needs a nudge"
        description="Overdue, longest first"
        actions={<CardLink href="/invoices?status=overdue">All overdue</CardLink>}
      />
      {invoices.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title="Nothing overdue"
          description="Every sent invoice is still within its payment terms."
          className="py-10"
        />
      ) : (
        <ul className="mt-3 space-y-1 px-2 pb-3">
          {invoices.map((invoice) => (
            <li key={invoice.id}>
              <Link
                href={`/invoices/${invoice.id}/edit`}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{invoice.client_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="font-mono">{invoice.number}</span> · due {formatDate(invoice.due_date)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <p className="font-mono text-sm tabular-nums">{formatCurrency(invoice.total)}</p>
                  <Badge tone="danger">
                    {invoice.days_overdue} {invoice.days_overdue === 1 ? "day" : "days"} late
                  </Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
