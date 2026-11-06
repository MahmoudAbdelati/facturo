"use client";

import clsx from "clsx";
import { createContext, useCallback, useContext, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { SIDEBAR_COOKIE } from "@/components/layout/sidebar-cookie";

// From lg up the sidebar can be collapsed to the icon rail tablets use. The choice is
// kept in a cookie so the server renders the right width and nothing jumps on load.

const SidebarContext = createContext<{ collapsed: boolean; toggle: () => void }>({
  collapsed: false,
  toggle: () => {},
});

/**
 * The app's outer frame. `data-sidebar` drives the `expanded:` Tailwind variant
 * (lg and up, sidebar open), which the sidebar's parts use instead of `lg:`.
 */
export function SidebarShell({
  initialCollapsed,
  className,
  children,
}: {
  initialCollapsed: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const toggle = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }, []);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      <div data-sidebar={collapsed ? "collapsed" : "expanded"} className={className}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

/** Collapses or expands the sidebar. Only shown from lg; below that the rail is fixed. */
export function SidebarToggle({ className }: { className?: string }) {
  const { collapsed, toggle } = useContext(SidebarContext);
  const label = collapsed ? "Expand sidebar" : "Collapse sidebar";
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-expanded={!collapsed}
      title={label}
      className={clsx(
        "hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground dark:hover:bg-muted lg:flex",
        className,
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
