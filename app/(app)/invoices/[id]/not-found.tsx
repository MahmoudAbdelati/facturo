import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function InvoiceNotFound() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="Invoice not found"
      description="It may have been deleted."
      action={
        <Link href="/invoices" className={buttonClasses()}>
          Back to invoices
        </Link>
      }
    />
  );
}
