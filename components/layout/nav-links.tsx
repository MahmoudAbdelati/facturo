"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Users } from "lucide-react";

export const appNav = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Clients", href: "/clients", icon: Users },
];

export function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

const CLIENT_PAGE = /^\/clients\/([0-9a-f-]{36})$/i;

/** "New invoice" for the client whose page is open, or a blank one anywhere else. */
export function useNewInvoiceHref() {
  const clientId = usePathname().match(CLIENT_PAGE)?.[1];
  return clientId ? `/invoices/new?client=${clientId}` : "/invoices/new";
}

/** The sidebar's New invoice button; a client component so it can follow the page. */
export function NewInvoiceLink({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Link href={useNewInvoiceHref()} title="New invoice" className={className}>
      {children}
    </Link>
  );
}

// Icon-only on the rail, icon and label when the sidebar is open (lg and up).
export function NavLinks() {
  const isActive = useIsActive();

  return (
    <>
      {appNav.map(({ name, href, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={name}
            href={href}
            aria-current={active ? "page" : undefined}
            title={name}
            className={clsx(
              "flex h-10 items-center justify-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors expanded:justify-start",
              active
                ? // bg-muted is almost the sidebar's own colour in light mode
                  "bg-foreground/10 text-foreground dark:bg-muted"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground dark:hover:bg-muted",
            )}
          >
            <Icon className={clsx("h-4 w-4", active && "text-accent")} />
            <span className="sr-only whitespace-nowrap expanded:not-sr-only">{name}</span>
          </Link>
        );
      })}
    </>
  );
}
