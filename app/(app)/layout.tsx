import { Sidebar } from "@/components/layout/sidebar";

// Every page in here shows the signed-in user's live data.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <aside className="w-full flex-none md:w-16 lg:w-60">
        <Sidebar />
      </aside>
      <main className="min-w-0 grow p-4 sm:p-6 md:overflow-y-auto lg:p-10">{children}</main>
    </div>
  );
}
