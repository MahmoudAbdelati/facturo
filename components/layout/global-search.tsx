"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/** Top-bar search: jumps to the invoices list filtered by the query. Press "/" to focus. */
export function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <form
      role="search"
      action="/invoices"
      onSubmit={(event) => {
        event.preventDefault();
        const query = new FormData(event.currentTarget).get("query")?.toString().trim();
        router.push(query ? `/invoices?query=${encodeURIComponent(query)}` : "/invoices");
        inputRef.current?.blur();
      }}
      className="relative w-full max-w-sm"
    >
      <label htmlFor="global-search" className="sr-only">
        Search invoices
      </label>
      <input
        ref={inputRef}
        id="global-search"
        name="query"
        type="search"
        placeholder="Search invoices…"
        autoComplete="off"
        className="peer block h-9 w-full rounded-lg border border-input bg-surface pl-9 pr-9 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring [&::-webkit-search-cancel-button]:hidden"
      />
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border px-1.5 font-mono text-[11px] text-muted-foreground peer-focus:hidden">
        /
      </kbd>
    </form>
  );
}
