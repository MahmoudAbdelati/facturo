import clsx from "clsx";
import { AlertCircle, Check, Clock, FilePen } from "lucide-react";
import type { DisplayStatus } from "@/lib/types";

const styles: Record<DisplayStatus, { label: string; className: string; icon: typeof Check }> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
    icon: FilePen,
  },
  sent: { label: "Sent", className: "bg-warning/10 text-warning", icon: Clock },
  overdue: {
    label: "Overdue",
    className: "bg-danger/10 text-danger",
    icon: AlertCircle,
  },
  paid: { label: "Paid", className: "bg-success/10 text-success", icon: Check },
};

export function StatusBadge({ status }: { status: DisplayStatus }) {
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
