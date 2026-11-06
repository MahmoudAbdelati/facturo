import Link from "next/link";
import { Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/format";
import { getTopClients } from "@/lib/queries/overview";
import { CardLink } from "./card-link";

export async function TopClients() {
  const clients = await getTopClients(5);
  const max = Math.max(1, ...clients.map((c) => c.collected));

  return (
    <Card>
      <CardHeader
        title="Top clients"
        description="By money collected, last 12 months"
        actions={<CardLink href="/clients">All clients</CardLink>}
      />
      {clients.length === 0 ? (
        <EmptyState icon={Users} title="No payments yet" description="Clients who pay you show up here." />
      ) : (
        <ol className="mt-3 space-y-1 px-2 pb-3">
          {clients.map((client) => (
            <li key={client.id}>
              <Link
                href={`/clients/${client.id}`}
                className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted/60"
              >
                <Avatar name={client.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-medium">{client.name}</p>
                    <p className="shrink-0 font-mono text-sm tabular-nums">
                      {formatCurrency(client.collected)}
                    </p>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${(client.collected / max) * 100}%` }}
                      />
                    </div>
                    <p className="w-16 shrink-0 text-right text-xs text-muted-foreground">
                      {client.invoice_count} {client.invoice_count === 1 ? "invoice" : "invoices"}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
