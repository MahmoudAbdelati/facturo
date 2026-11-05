"use client";

import clsx from "clsx";
import Link from "next/link";
import { Plus } from "lucide-react";
import { appNav, useIsActive } from "@/components/layout/nav-links";

const [overview, invoices, clients] = appNav;

// Bottom tab bar on phones, with "New invoice" in the middle.
export function MobileNav() {
  const isActive = useIsActive();

  const tab = ({ name, href, icon: Icon }: (typeof appNav)[number]) => {
    const active = isActive(href);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={clsx(
          "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <Icon className={clsx("h-5 w-5", active && "text-accent")} />
        {name}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/85 pb-[env(safe-area-inset-bottom)] backdrop-blur backdrop-saturate-150 md:hidden"
    >
      <div className="flex h-16 items-stretch">
        {tab(overview)}
        {tab(invoices)}
        <div className="flex flex-1 items-center justify-center">
          <Link
            href="/invoices/new"
            aria-label="New invoice"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md transition-colors hover:bg-accent-hover"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>
        {tab(clients)}
      </div>
    </nav>
  );
}
