import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export default function InvoiceNotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
      <FileQuestion className="h-10 w-10 text-muted-foreground" />
      <h2 className="text-lg font-semibold">Invoice not found</h2>
      <p className="text-sm text-muted-foreground">It may have been deleted.</p>
      <Link href="/invoices" className={`${buttonClasses()} mt-2`}>
        Back to invoices
      </Link>
    </div>
  );
}
