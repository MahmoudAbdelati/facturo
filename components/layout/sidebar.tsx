import Link from "next/link";
import { Plus } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { NavLinks } from "@/components/layout/nav-links";
import { buttonClasses } from "@/components/ui/button";

// An icon rail on tablets and the full sidebar from lg up. Phones use MobileNav.
export function Sidebar() {
  return (
    <div className="flex h-full flex-col gap-6 px-3 py-4">
      <Link
        href="/overview"
        aria-label="Facturo home"
        className="flex h-8 items-center justify-center rounded-lg lg:justify-start lg:px-2"
      >
        <Logo wordmarkClassName="sr-only lg:not-sr-only" />
      </Link>

      <Link href="/invoices/new" title="New invoice" className={`${buttonClasses()} w-full px-0 lg:px-4`}>
        <Plus className="h-4 w-4" />
        <span className="sr-only lg:not-sr-only">New invoice</span>
      </Link>

      <nav aria-label="Main" className="flex flex-col gap-1">
        <NavLinks />
      </nav>
    </div>
  );
}
