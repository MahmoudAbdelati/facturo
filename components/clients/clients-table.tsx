import Link from "next/link";
import { UserSearch } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatWholeCurrency } from "@/lib/format";
import type { ClientRow } from "@/lib/types";

// Until clients get their own page (Day 10), a client links to their invoices.
const clientHref = (client: ClientRow) => `/invoices?query=${encodeURIComponent(client.name)}`;

function OverdueNote({ cents }: { cents: number }) {
  if (cents <= 0) return null;
  return (
    <span className="block truncate text-xs font-medium text-danger" title={`${formatCurrency(cents)} overdue`}>
      <span className="font-mono tabular-nums">{formatWholeCurrency(cents)}</span> overdue
    </span>
  );
}

export function ClientsTable({ clients }: { clients: ClientRow[] }) {
  if (clients.length === 0) {
    return (
      <Card>
        <EmptyState icon={UserSearch} title="No clients found" description="Try a different search." />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <ul className="divide-y divide-border md:hidden">
        {clients.map((client) => (
          <li key={client.id} className="relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
            <Avatar name={client.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <Link
                  href={clientHref(client)}
                  className="truncate text-sm font-medium after:absolute after:inset-0 focus-visible:ring-0 after:focus-visible:ring-2 after:focus-visible:ring-inset after:focus-visible:ring-ring"
                >
                  {client.name}
                </Link>
                <p className="shrink-0 font-mono text-sm tabular-nums">
                  {formatCurrency(client.outstanding)}
                </p>
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
                <span className="truncate">
                  {client.invoice_count} {client.invoice_count === 1 ? "invoice" : "invoices"}
                  {" · "}
                  <span className="font-mono tabular-nums">{formatCurrency(client.paid)}</span> paid
                </span>
                {client.overdue > 0 ? (
                  <span className="shrink-0 font-medium text-danger">
                    <span className="font-mono tabular-nums">{formatWholeCurrency(client.overdue)}</span> overdue
                  </span>
                ) : (
                  <span className="shrink-0">outstanding</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Fixed layout like the invoices table: the client column truncates, nothing scrolls sideways. */}
      <Table className="hidden table-fixed md:table">
        <colgroup>
          <col />
          <col className="w-24" />
          <col className="w-36 lg:w-44" />
          <col className="w-32 lg:w-36" />
          <col className="hidden w-32 xl:table-column" />
        </colgroup>
        <TableHead>
          <tr>
            <TableHeader className="px-4">Client</TableHeader>
            <TableHeader className="px-4 text-right">Invoices</TableHeader>
            <TableHeader className="px-4 text-right">Outstanding</TableHeader>
            <TableHeader className="px-4 text-right">Paid</TableHeader>
            <TableHeader className="hidden px-4 text-right xl:table-cell">Last invoice</TableHeader>
          </tr>
        </TableHead>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="px-4">
                <div className="flex items-center gap-3">
                  <Avatar name={client.name} />
                  <div className="min-w-0">
                    <Link
                      href={clientHref(client)}
                      className="block truncate font-medium hover:text-accent-subtle-foreground hover:underline"
                    >
                      {client.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{client.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="truncate px-4 text-right tabular-nums">
                {client.invoice_count}
              </TableCell>
              <TableCell className="px-4 text-right">
                <span
                  className={
                    client.outstanding > 0
                      ? "block truncate font-mono tabular-nums"
                      : "block truncate font-mono tabular-nums text-muted-foreground"
                  }
                >
                  {formatCurrency(client.outstanding)}
                </span>
                <OverdueNote cents={client.overdue} />
              </TableCell>
              <TableCell className="truncate px-4 text-right font-mono tabular-nums">
                {formatCurrency(client.paid)}
              </TableCell>
              <TableCell className="hidden truncate px-4 text-right text-muted-foreground xl:table-cell">
                {client.last_issue_date ? formatDate(client.last_issue_date) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
