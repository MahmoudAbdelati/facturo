import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut } from "@/auth";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NavLinks } from "@/components/layout/nav-links";

// A top bar on phones, an icon rail on tablets and the full sidebar from lg up.
export function Sidebar() {
  return (
    <div className="flex h-full flex-col gap-4 border-b border-border bg-surface px-3 py-4 md:border-b-0 md:border-r">
      <Link href="/overview" className="flex px-2 md:justify-center md:px-0 lg:justify-start lg:px-2">
        <Logo wordmarkClassName="md:sr-only lg:not-sr-only" />
      </Link>
      <nav className="flex grow flex-row gap-1 md:flex-col">
        <NavLinks />
      </nav>
      <div className="flex items-center justify-between gap-2 px-1 md:flex-col md:px-0 lg:flex-row lg:px-1">
        <ThemeToggle className="md:flex-col lg:flex-row" />
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            title="Log out"
            className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="md:sr-only lg:not-sr-only">Log out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
