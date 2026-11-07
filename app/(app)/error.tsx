"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CloudOff } from "lucide-react";
import { InlineStatus } from "@/components/layout/status-page";
import { Button, buttonClasses } from "@/components/ui/button";

// Inside the shell, so the sidebar and search still work when one page fails.
export default function AppError({
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
    <InlineStatus
      icon={CloudOff}
      title="This page didn't load"
      description="Something went wrong on our side. Your data is safe; try again in a moment."
      actions={
        <>
          <Button onClick={() => reset()}>Try again</Button>
          <Link href="/overview" className={buttonClasses("secondary")}>
            Go to overview
          </Link>
        </>
      }
      footnote={error.digest && `Reference ${error.digest}`}
    />
  );
}
