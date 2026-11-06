import clsx from "clsx";
import { CalendarCheck, CalendarClock, CalendarPlus, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { daysBetween, formatCurrency, formatDate, todayIso } from "@/lib/format";
import type { InvoiceDetail } from "@/lib/types";

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** One line on where the invoice stands, and its tone. */
function standing(invoice: InvoiceDetail): { text: string; tone: "muted" | "danger" | "accent" } {
  const today = todayIso();
  switch (invoice.status) {
    case "draft":
      return { text: "Not sent yet", tone: "muted" };
    case "paid": {
      const days = invoice.paid_at ? daysBetween(invoice.issue_date, invoice.paid_at) : null;
      return {
        text: days === null ? "Paid in full" : days === 0 ? "Paid the day it was issued" : `Paid ${plural(days, "day")} after issue`,
        tone: "accent",
      };
    }
    case "overdue":
      return { text: `${plural(daysBetween(invoice.due_date, today), "day")} overdue`, tone: "danger" };
    default: {
      const days = daysBetween(today, invoice.due_date);
      return { text: days === 0 ? "Due today" : `Due in ${plural(days, "day")}`, tone: "muted" };
    }
  }
}

function Step({
  icon: Icon,
  label,
  date,
  note,
  done,
}: {
  icon: typeof CalendarPlus;
  label: string;
  date: string | null;
  note?: string;
  done: boolean;
}) {
  return (
    <li className="flex gap-3">
      <span
        className={clsx(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          done ? "bg-accent-subtle text-accent-subtle-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <div className="min-w-0 text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          {date ? formatDate(date) : "Not yet"}
          {note && <> · {note}</>}
        </p>
      </div>
    </li>
  );
}

/** Where the invoice stands, next to the sheet. Not printed. */
export function InvoiceSummary({ invoice, className }: { invoice: InvoiceDetail; className?: string }) {
  const { text, tone } = standing(invoice);
  const paid = invoice.status === "paid";
  const terms = daysBetween(invoice.issue_date, invoice.due_date);

  return (
    <Card className={clsx("divide-y divide-border xl:sticky xl:top-20 print:hidden", className)}>
      <div className="p-5">
        <p className="text-xs text-muted-foreground">{paid ? "Total paid" : "Amount due"}</p>
        <p className="mt-1 font-mono text-2xl font-semibold tabular-nums tracking-tight">
          {formatCurrency(invoice.total, invoice.currency)}
        </p>
        <p
          className={clsx(
            "mt-1 text-sm",
            tone === "danger" && "font-medium text-danger",
            tone === "accent" && "text-accent-subtle-foreground",
            tone === "muted" && "text-muted-foreground",
          )}
        >
          {text}
        </p>
      </div>

      {/* Below xl the sheet right under this already shows the dates and the client. */}
      <ol aria-label="Timeline" className="hidden space-y-4 p-5 xl:block">
        <Step icon={CalendarPlus} label="Issued" date={invoice.issue_date} done />
        <Step
          icon={CalendarClock}
          label="Due"
          date={invoice.due_date}
          note={terms <= 0 ? "on receipt" : `net ${terms}`}
          done={paid}
        />
        <Step icon={CalendarCheck} label="Paid" date={invoice.paid_at} done={paid} />
      </ol>

      <div className="hidden p-5 text-sm xl:block">
        <p className="text-xs text-muted-foreground">Client</p>
        <p className="mt-1 truncate font-medium">{invoice.client_name}</p>
        {invoice.client_company && (
          <p className="truncate text-muted-foreground">{invoice.client_company}</p>
        )}
        <a
          href={`mailto:${invoice.client_email}?subject=${encodeURIComponent(`Invoice ${invoice.number}`)}`}
          className="mt-2 inline-flex max-w-full items-center gap-1.5 text-accent-subtle-foreground hover:underline"
        >
          <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{invoice.client_email}</span>
        </a>
      </div>
    </Card>
  );
}
