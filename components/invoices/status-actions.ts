import { CircleCheck, Send, Undo2 } from "lucide-react";
import type { DisplayStatus, InvoiceStatus } from "@/lib/types";

export type StatusAction = { to: InvoiceStatus; label: string; done: string; icon: typeof Send };

/** What a status can move to next, most likely first. */
export const STATUS_ACTIONS: Record<DisplayStatus, StatusAction[]> = {
  draft: [
    { to: "sent", label: "Mark as sent", done: "marked as sent", icon: Send },
    { to: "paid", label: "Mark as paid", done: "marked as paid", icon: CircleCheck },
  ],
  sent: [
    { to: "paid", label: "Mark as paid", done: "marked as paid", icon: CircleCheck },
    { to: "draft", label: "Back to draft", done: "moved back to draft", icon: Undo2 },
  ],
  overdue: [{ to: "paid", label: "Mark as paid", done: "marked as paid", icon: CircleCheck }],
  paid: [{ to: "sent", label: "Mark as unpaid", done: "marked as unpaid", icon: Undo2 }],
};
