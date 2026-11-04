import { Banknote, Clock, FileText, Users } from "lucide-react";
import { getKpis } from "@/lib/queries/overview";

export async function KpiCards() {
  const { collected, outstanding, invoiceCount, clientCount } = await getKpis();

  return (
    <>
      <KpiCard label="Collected" value={collected} icon={Banknote} />
      <KpiCard label="Outstanding" value={outstanding} icon={Clock} />
      <KpiCard label="Invoices" value={invoiceCount} icon={FileText} />
      <KpiCard label="Clients" value={clientCount} icon={Users} />
    </>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 truncate font-mono text-2xl font-medium tabular-nums">{value}</p>
    </div>
  );
}
