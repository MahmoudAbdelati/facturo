import Link from "next/link";
import { UserX } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ClientNotFound() {
  return (
    <EmptyState
      icon={UserX}
      title="Client not found"
      description="They may have been deleted."
      action={
        <Link href="/clients" className={buttonClasses()}>
          Back to clients
        </Link>
      }
    />
  );
}
