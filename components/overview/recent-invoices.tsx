import { Avatar } from "@/components/ui/avatar";
import { getRecentInvoices } from "@/lib/queries/overview";

export async function RecentInvoices() {
  const invoices = await getRecentInvoices();

  return (
    <section className="rounded-lg border border-border bg-surface p-5 lg:col-span-3">
      <h2 className="text-sm font-medium">Recent invoices</h2>
      <ul className="mt-4 divide-y divide-border">
        {invoices.map((invoice) => (
          <li key={invoice.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={invoice.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{invoice.name}</p>
                <p className="hidden truncate text-sm text-muted-foreground sm:block">
                  {invoice.email}
                </p>
              </div>
            </div>
            <p className="font-mono text-sm tabular-nums">{invoice.amount}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
