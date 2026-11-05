import Link from "next/link";
import clsx from "clsx";
import { AlertCircle, ArrowDownRight, ArrowUpRight, Banknote, Clock, Minus, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { getKpis } from "@/lib/queries/overview";
import type { Kpi } from "@/lib/types";

/** Which direction of change is good news for a measure. */
type Better = "up" | "down" | "either";

export async function KpiCards() {
  const { collected, outstanding, overdue, avgDaysToPay } = await getKpis();

  return (
    <>
      <KpiCard
        label="Collected"
        hint="last 30 days"
        kpi={collected}
        format={formatCurrency}
        icon={Banknote}
        better="up"
        href="/invoices?status=paid"
      />
      <KpiCard
        label="Outstanding"
        hint="sent, not paid yet"
        kpi={outstanding}
        format={formatCurrency}
        icon={Clock}
        better="either"
        href="/invoices?status=sent"
      />
      <KpiCard
        label="Overdue"
        hint="past their due date"
        kpi={overdue}
        format={formatCurrency}
        icon={AlertCircle}
        better="down"
        href="/invoices?status=overdue"
        alert={overdue.value > 0}
      />
      <KpiCard
        label="Avg. days to pay"
        hint="last 30 days"
        kpi={avgDaysToPay}
        format={(n) => `${Math.round(n)} ${Math.round(n) === 1 ? "day" : "days"}`}
        icon={Timer}
        better="down"
        // Days compare better as a difference than as a percentage.
        absoluteChange
      />
    </>
  );
}

function KpiCard({
  label,
  hint,
  kpi,
  format,
  icon: Icon,
  better,
  href,
  alert = false,
  absoluteChange = false,
}: {
  label: string;
  hint: string;
  kpi: Kpi;
  format: (value: number) => string;
  icon: React.ComponentType<{ className?: string }>;
  better: Better;
  href?: string;
  alert?: boolean;
  absoluteChange?: boolean;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-muted-foreground">{label}</span>
        <span
          className={clsx(
            "hidden h-8 w-8 shrink-0 items-center justify-center rounded-md sm:flex",
            alert ? "bg-danger/10 text-danger" : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 truncate font-mono text-lg font-semibold sm:text-2xl tracking-tight tabular-nums">
        {format(kpi.value)}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <Trend kpi={kpi} better={better} absolute={absoluteChange} />
        <span className="hidden text-muted-foreground sm:inline">{hint}</span>
      </div>
    </>
  );

  if (!href) return <Card className="p-4 sm:p-5">{body}</Card>;

  return (
    <Link
      href={href}
      className="block rounded-lg border border-border bg-surface p-4 transition-colors sm:p-5 hover:border-foreground/20 hover:bg-surface-raised"
    >
      {body}
    </Link>
  );
}

function Trend({ kpi, better, absolute }: { kpi: Kpi; better: Better; absolute: boolean }) {
  if (kpi.previous === null || (!absolute && kpi.previous === 0)) {
    return <span className="text-muted-foreground">No earlier data</span>;
  }

  const diff = kpi.value - kpi.previous;
  const amount = absolute ? Math.round(diff) : Math.round((diff / kpi.previous) * 100);
  const direction = amount > 0 ? "up" : amount < 0 ? "down" : "flat";
  const tone =
    direction === "flat" || better === "either"
      ? "neutral"
      : direction === better
        ? "good"
        : "bad";
  const Arrow = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;
  const text = absolute ? `${Math.abs(amount)}d` : `${Math.abs(amount)}%`;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium tabular-nums",
        tone === "good" && "bg-success/10 text-accent-subtle-foreground",
        tone === "bad" && "bg-danger/10 text-danger",
        tone === "neutral" && "bg-muted text-muted-foreground",
      )}
      title="Compared with the 30 days before"
    >
      <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">{direction === "flat" ? "No change" : direction === "up" ? "Up" : "Down"}</span>
      {direction !== "flat" && text}
    </span>
  );
}
