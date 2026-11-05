import Link from "next/link";
import { auth } from "@/auth";
import { Logo } from "@/components/brand/logo";
import { GlobalSearch } from "@/components/layout/global-search";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export async function Topbar() {
  const session = await auth();
  const name = session?.user?.name ?? "Account";
  const email = session?.user?.email ?? "";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6 lg:px-10">
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
    </header>
  );
}
