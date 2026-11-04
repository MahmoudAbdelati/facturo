import { Avatar } from "@/components/ui/avatar";
import type { ClientRow } from "@/lib/types";

export function ClientsTable({ clients }: { clients: ClientRow[] }) {
  if (clients.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
        No clients match your search.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <ul className="divide-y divide-border md:hidden">
        {clients.map((client) => (
          <li key={client.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar name={client.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-sm font-medium">{client.name}</p>
                <p className="shrink-0 font-mono text-sm tabular-nums">{client.total_pending}</p>
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
                <span className="truncate">
                  {client.total_invoices} {client.total_invoices === 1 ? "invoice" : "invoices"}
                  {" · "}
                  <span className="font-mono tabular-nums">{client.total_paid}</span> paid
                </span>
                <span className="shrink-0">outstanding</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <table className="hidden min-w-full text-sm md:table">
        <thead className="border-b border-border text-left text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Client</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Invoices</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Outstanding</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Paid</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-muted/40">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={client.name} />
                  <div className="min-w-0 max-w-64">
                    <p className="truncate font-medium">{client.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{client.email}</p>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                {client.total_invoices}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-mono tabular-nums">
                {client.total_pending}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-mono tabular-nums">
                {client.total_paid}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
