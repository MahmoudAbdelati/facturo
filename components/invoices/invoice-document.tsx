import { LogoMark } from "@/components/brand/logo";
import { formatCurrency, formatDate } from "@/lib/format";
import type { InvoiceDetail } from "@/lib/types";
import type { UserProfile } from "@/lib/queries/users";

const quantityFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{children}</dd>
    </div>
  );
}

/**
 * The invoice as the client sees it: a light sheet of paper in both themes,
 * and the only thing on the page when it's printed.
 * Avoid `dark:` classes in here; the sheet stays light inside a dark page.
 */
export function InvoiceDocument({
  invoice,
  from,
}: {
  invoice: InvoiceDetail;
  from: UserProfile | undefined;
}) {
  const money = (cents: number) => formatCurrency(cents, invoice.currency);
  const paid = invoice.status === "paid";
  const sender = from?.company_name || from?.name;

  return (
    <article
      aria-label={`Invoice ${invoice.number}`}
      className="theme-light rounded-lg border border-border bg-background text-foreground shadow-sm print:rounded-none print:border-0 print:shadow-none"
    >
      <div className="p-5 sm:p-10 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xl font-semibold tracking-tight">{sender ?? "Your company"}</p>
            {from && (
              <p className="mt-1 text-sm text-muted-foreground">
                {from.company_name && from.name !== from.company_name && <>{from.name} · </>}
                {from.email}
              </p>
            )}
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Invoice
            </p>
            <p className="mt-1 font-mono text-lg font-medium">{invoice.number}</p>
            {paid && (
              <p className="mt-2 inline-flex rounded border-2 border-accent px-2 py-0.5 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Paid
              </p>
            )}
          </div>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-[1fr_auto]">
          <section aria-labelledby="bill-to">
            <h2 id="bill-to" className="text-xs text-muted-foreground">
              Bill to
            </h2>
            <p className="mt-1 font-medium">{invoice.client_name}</p>
            <address className="text-sm not-italic leading-6 text-muted-foreground">
              {invoice.client_company && <span className="block">{invoice.client_company}</span>}
              <span className="block break-all">{invoice.client_email}</span>
              {invoice.client_phone && <span className="block">{invoice.client_phone}</span>}
              {invoice.client_country && <span className="block">{invoice.client_country}</span>}
            </address>
          </section>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-1 sm:text-right">
            <Meta label="Issued">{formatDate(invoice.issue_date)}</Meta>
            <Meta label="Due">{formatDate(invoice.due_date)}</Meta>
            {invoice.paid_at && <Meta label="Paid">{formatDate(invoice.paid_at)}</Meta>}
          </dl>
        </div>

        <section aria-label="Line items" className="mt-10">
          {/* A table from sm up (printed pages are wider than sm); stacked rows on phones. */}
          <div
            aria-hidden="true"
            className="hidden grid-cols-[1fr_4rem_7rem_7rem] gap-4 border-b border-foreground/80 pb-2 text-xs font-medium text-muted-foreground sm:grid"
          >
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Unit price</span>
            <span className="text-right">Amount</span>
          </div>
          <ul className="divide-y divide-border border-t border-foreground/80 sm:border-t-0">
            {invoice.items.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 py-3 text-sm sm:grid-cols-[1fr_4rem_7rem_7rem] sm:gap-4 print:break-inside-avoid"
              >
                <span className="min-w-0 break-words">{item.description}</span>
                <span className="col-start-1 row-start-2 text-xs text-muted-foreground sm:hidden">
                  {quantityFormat.format(item.quantity)} × {money(item.unit_price)}
                </span>
                <span className="hidden text-right tabular-nums sm:block">
                  <span className="sr-only">Quantity </span>
                  {quantityFormat.format(item.quantity)}
                </span>
                <span className="hidden text-right font-mono tabular-nums sm:block">
                  <span className="sr-only">Unit price </span>
                  {money(item.unit_price)}
                </span>
                <span className="col-start-2 row-start-1 text-right font-mono tabular-nums sm:col-auto sm:row-auto">
                  {money(item.amount)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="ml-auto mt-2 w-full max-w-xs border-t border-border pt-3 text-sm print:break-inside-avoid">
            <div className="flex justify-between gap-4 py-1">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-mono tabular-nums">{money(invoice.total)}</dd>
            </div>
            {paid && (
              <div className="flex justify-between gap-4 py-1">
                <dt className="text-muted-foreground">Paid</dt>
                <dd className="font-mono tabular-nums">−{money(invoice.total)}</dd>
              </div>
            )}
            <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-foreground/80 pt-3">
              <dt className="font-medium">Amount due</dt>
              <dd className="font-mono text-lg font-semibold tabular-nums">
                {money(paid ? 0 : invoice.total)}
              </dd>
            </div>
            <p className="mt-1 text-right text-xs text-muted-foreground">{invoice.currency}</p>
          </dl>
        </section>

        {invoice.notes && (
          <section aria-labelledby="notes" className="mt-10 print:break-inside-avoid">
            <h2 id="notes" className="text-xs text-muted-foreground">
              Notes
            </h2>
            <p className="mt-1 whitespace-pre-line text-sm leading-6">{invoice.notes}</p>
          </section>
        )}

        <footer className="mt-12 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <LogoMark className="h-4 w-4" />
          Sent with Facturo
        </footer>
      </div>
    </article>
  );
}
