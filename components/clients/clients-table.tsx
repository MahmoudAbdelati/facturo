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
import { formatCurrency } from "@/lib/format";
import type { ClientRow } from "@/lib/types";

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
          <li key={client.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar name={client.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-sm font-medium">{client.name}</p>
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
                <span className="shrink-0">outstanding</span>
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
          <col className="w-32 lg:w-36" />
          <col className="w-32 lg:w-36" />
        </colgroup>
        <TableHead>
          <tr>
            <TableHeader className="px-4">Client</TableHeader>
            <TableHeader className="px-4 text-right">Invoices</TableHeader>
            <TableHeader className="px-4 text-right">Outstanding</TableHeader>
            <TableHeader className="px-4 text-right">Paid</TableHeader>
          </tr>
        </TableHead>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="px-4">
                <div className="flex items-center gap-3">
                  <Avatar name={client.name} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{client.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{client.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="truncate px-4 text-right tabular-nums">
                {client.invoice_count}
              </TableCell>
              <TableCell className="truncate px-4 text-right font-mono tabular-nums">
                {formatCurrency(client.outstanding)}
              </TableCell>
              <TableCell className="truncate px-4 text-right font-mono tabular-nums">
                {formatCurrency(client.paid)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
