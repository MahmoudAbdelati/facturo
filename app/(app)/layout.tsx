import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

// Every page in here shows the signed-in user's live data.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh">
      <aside className="hidden w-16 flex-none border-r border-border bg-surface md:block lg:w-60">
        <Sidebar />
      </aside>
      <div className="flex min-w-0 grow flex-col overflow-y-auto">
        <Topbar />
        {/* Bottom padding keeps content clear of the phone tab bar. */}
        <main className="grow p-4 pb-24 sm:p-6 sm:pb-24 md:pb-6 lg:p-10">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
