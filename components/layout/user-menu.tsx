"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import clsx from "clsx";
import Link from "next/link";
import { Check, ChevronDown, LogOut, Monitor, Moon, Settings, Sun } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu, MenuSeparator, menuItemClasses } from "@/components/ui/dropdown-menu";
import { logOut } from "@/lib/actions/auth";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

const subscribe = () => () => {};

export function UserMenu({ name, email }: { name: string; email: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <DropdownMenu
      label="Account"
      className="w-56"
      triggerClassName="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-muted aria-expanded:bg-muted lg:rounded-lg lg:py-1 lg:pl-1 lg:pr-2"
      trigger={
        <>
          <Avatar name={name} />
          <span className="hidden max-w-32 truncate text-sm font-medium lg:block">{name}</span>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
        </>
      }
    >
      <div className="px-2.5 py-2">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>

      {/* From sm up the theme switch sits in the top bar instead. */}
      <div className="sm:hidden">
        <MenuSeparator />
        <p className="px-2.5 py-1 text-xs text-muted-foreground">Theme</p>
        {themes.map(({ value, label, icon: Icon }) => {
          const checked = mounted && theme === value;
          return (
            <button
              key={value}
              type="button"
              role="menuitemradio"
              aria-checked={checked}
              onClick={() => setTheme(value)}
              className={menuItemClasses}
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{label}</span>
              <Check className={clsx("h-4 w-4 text-accent", !checked && "invisible")} />
            </button>
          );
        })}
      </div>

      <MenuSeparator />
      <Link href="/settings" role="menuitem" className={menuItemClasses}>
        <Settings className="h-4 w-4 text-muted-foreground" />
        Settings
      </Link>
      <form action={logOut}>
        <button type="submit" role="menuitem" className={menuItemClasses}>
          <LogOut className="h-4 w-4 text-muted-foreground" />
          Log out
        </button>
      </form>
    </DropdownMenu>
  );
}
