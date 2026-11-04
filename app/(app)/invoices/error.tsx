"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function InvoicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
      <h2 className="text-lg font-semibold">We couldn&apos;t load your invoices.</h2>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
