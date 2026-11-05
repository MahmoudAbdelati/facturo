import { AlertCircle, Check, Clock, FilePen } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { DisplayStatus } from "@/lib/types";

const styles: Record<DisplayStatus, { label: string; tone: BadgeTone; icon: typeof Check }> = {
  draft: { label: "Draft", tone: "neutral", icon: FilePen },
  sent: { label: "Sent", tone: "warning", icon: Clock },
  overdue: { label: "Overdue", tone: "danger", icon: AlertCircle },
  paid: { label: "Paid", tone: "success", icon: Check },
};

export function StatusBadge({ status }: { status: DisplayStatus }) {
  const { label, tone, icon: Icon } = styles[status];
  return (
    <Badge tone={tone}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
