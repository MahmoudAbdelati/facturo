"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { Monitor, Moon, Sun } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

const subscribe = () => () => {};

/** A small sketch of the app in one theme; "system" shows both halves. */
function Preview({ value }: { value: (typeof options)[number]["value"] }) {
  const pane = (theme: "light" | "dark") => (
    <div
      className={clsx(
        "flex h-full flex-1 gap-1.5 p-2",
        theme === "light" ? "bg-zinc-100" : "bg-zinc-900",
      )}
    >
      <div className={clsx("w-3 rounded-sm", theme === "light" ? "bg-zinc-200" : "bg-zinc-800")} />
      <div className="flex flex-1 flex-col gap-1">
        <div className={clsx("h-1.5 w-2/3 rounded-full", theme === "light" ? "bg-zinc-300" : "bg-zinc-700")} />
        <div className={clsx("h-1.5 w-1/3 rounded-full", theme === "light" ? "bg-emerald-700" : "bg-emerald-500")} />
        <div className={clsx("mt-auto h-5 rounded-sm", theme === "light" ? "bg-white" : "bg-zinc-800")} />
      </div>
    </div>
  );

  return (
    <div aria-hidden className="flex h-16 overflow-hidden rounded-md border border-border">
      {value === "dark" ? pane("dark") : pane("light")}
      {value === "system" && pane("dark")}
    </div>
  );
}

export function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  // The stored theme is only known on the client.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <Card>
      <CardHeader title="Appearance" description="Saved in this browser. System follows your device." />
      <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-3 p-5">
        {options.map(({ value, label, icon: Icon }) => {
          const checked = mounted && theme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => setTheme(value)}
              className={clsx(
                "rounded-lg border p-2 text-left transition-colors",
                checked ? "border-accent ring-1 ring-accent" : "border-border hover:border-foreground/30",
              )}
            >
              <Preview value={value} />
              <span className="mt-2 flex items-center gap-1.5 px-0.5 text-sm font-medium">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
