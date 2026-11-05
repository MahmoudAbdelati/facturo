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

// Icon-only on the md rail, icon and label from lg up.
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
              "flex h-10 items-center justify-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors lg:justify-start",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className={clsx("h-4 w-4", active && "text-accent")} />
            <span className="sr-only lg:not-sr-only">{name}</span>
          </Link>
        );
      })}
    </>
  );
}
