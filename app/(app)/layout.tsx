import { cookies } from "next/headers";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { SIDEBAR_COOKIE } from "@/components/layout/sidebar-cookie";
import { SidebarShell } from "@/components/layout/sidebar-shell";
import { VisitTracker } from "@/components/layout/return-link";
import { Topbar } from "@/components/layout/topbar";

// Every page in here shows the signed-in user's live data.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const collapsed = (await cookies()).get(SIDEBAR_COOKIE)?.value === "collapsed";

  return (
    <SidebarShell initialCollapsed={collapsed} className="flex h-dvh print:block print:h-auto">
      <aside className="hidden w-16 flex-none overflow-x-hidden border-r border-border bg-surface transition-[width] duration-200 ease-out motion-reduce:transition-none md:block expanded:w-60 print:hidden">
        <Sidebar />
      </aside>
      <div className="flex min-w-0 grow flex-col overflow-y-auto print:block print:overflow-visible">
        <div className="contents print:hidden">
          <Topbar />
        </div>
        {/* Bottom padding keeps content clear of the phone tab bar. */}
        <main className="grow p-4 pb-24 sm:p-6 sm:pb-24 md:pb-6 lg:p-10 print:p-0">
          {/* Capped and centred on wide screens; pages size themselves to this box (`@page-*:`). */}
          <div className="@container mx-auto w-full max-w-[88rem] print:max-w-none">{children}</div>
        </main>
      </div>
      <VisitTracker />
      <div className="print:hidden">
        <MobileNav />
      </div>
    </SidebarShell>
  );
}
