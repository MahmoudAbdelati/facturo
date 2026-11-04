"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Users } from "lucide-react";

const links = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Clients", href: "/clients", icon: Users },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map(({ name, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={name}
            href={href}
            aria-current={active ? "page" : undefined}
            title={name}
            className={clsx(
              "flex h-10 grow items-center justify-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors md:flex-none lg:justify-start",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only lg:not-sr-only">{name}</span>
          </Link>
        );
      })}
    </>
  );
}
