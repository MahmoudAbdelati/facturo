import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { GlobalSearch } from "@/components/layout/global-search";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getCurrentUser } from "@/lib/queries/users";

export async function Topbar() {
  // From the database, not the session, so a renamed user sees the new name at once.
  const user = await getCurrentUser();
  const name = user?.name ?? "Account";
  const email = user?.email ?? "";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur backdrop-saturate-150 sm:px-6 lg:px-10">
      {/* Same width as the page content below, so the edges line up on wide screens. */}
      <div className="mx-auto flex w-full max-w-[88rem] items-center gap-3">
        {/* On phones the sidebar is gone, so the logo moves up here. */}
        <Link href="/overview" aria-label="Facturo home" className="md:hidden">
          <Logo />
        </Link>
        <div className="hidden flex-1 sm:block">
          <GlobalSearch />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle className="hidden sm:inline-flex" />
          <UserMenu name={name} email={email} />
        </div>
      </div>
    </header>
  );
}
