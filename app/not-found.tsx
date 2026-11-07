import type { Metadata } from "next";
import Link from "next/link";
import { StatusPage } from "@/components/layout/status-page";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="This page doesn't exist"
      description="The link may be old, or the address has a typo. Everything else is where you left it."
      actions={
        <>
          <Link href="/overview" className={buttonClasses()}>
            Go to overview
          </Link>
          <Link href="/" className={buttonClasses("secondary")}>
            Facturo home
          </Link>
        </>
      }
    />
  );
}
