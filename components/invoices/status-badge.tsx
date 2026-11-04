import clsx from "clsx";
import { Check, Clock } from "lucide-react";
import type { InvoiceStatus } from "@/lib/types";

const styles: Record<InvoiceStatus, { label: string; className: string; icon: typeof Check }> = {
  paid: { label: "Paid", className: "bg-success/10 text-success", icon: Check },
  pending: { label: "Pending", className: "bg-warning/10 text-warning", icon: Clock },
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { label, className, icon: Icon } = styles[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
