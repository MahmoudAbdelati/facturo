import Link from "next/link";
import { Plus } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { NavLinks, NewInvoiceLink } from "@/components/layout/nav-links";
import { SidebarToggle } from "@/components/layout/sidebar-shell";
import { buttonClasses } from "@/components/ui/button";

// An icon rail on tablets and the full sidebar from lg up, which can be collapsed back
// to the rail (the `expanded:` variant). Phones use MobileNav.
export function Sidebar() {
  return (
    <div className="flex h-full flex-col gap-6 px-3 py-4">
      {/* Open: logo left, toggle top right. Collapsed (lg+): the toggle sits under the logo. */}
      <div className="flex flex-col items-center gap-2 expanded:flex-row expanded:justify-between">
        <Link
          href="/overview"
          aria-label="Facturo home"
          className="flex h-8 items-center justify-center rounded-lg expanded:justify-start expanded:px-2"
        >
          <Logo wordmarkClassName="sr-only expanded:not-sr-only whitespace-nowrap" />
        </Link>
        <SidebarToggle />
      </div>

      <NewInvoiceLink className={buttonClasses("soft", "rail")}>
        <Plus className="h-4 w-4" />
        <span className="sr-only whitespace-nowrap expanded:not-sr-only">New invoice</span>
      </NewInvoiceLink>

      <nav aria-label="Main" className="flex flex-col gap-1">
        <NavLinks />
      </nav>
    </div>
  );
}
