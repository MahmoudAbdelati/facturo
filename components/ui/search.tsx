"use client";

import { useEffect, useRef } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

/** Search box that keeps its term in `?query=`, debounced, and resets to page 1. */
export function Search({ placeholder, label = "Search" }: { placeholder: string; label?: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const query = searchParams.get("query") ?? "";

  const setQuery = (term: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    if (term.trim()) params.set("query", term.trim());
    else params.delete("query");
    const search = params.toString();
    replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  };
  const handleSearch = useDebouncedCallback(setQuery, 300);

  // Follow the URL when it changes from elsewhere, like the top-bar search.
  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement !== input && input.value.trim() !== query) {
      input.value = query;
    }
  }, [query]);

  return (
    <div className="relative flex min-w-0 flex-1">
      <label htmlFor="search" className="sr-only">
        {label}
      </label>
      <input
        ref={inputRef}
        id="search"
        type="search"
        autoComplete="off"
        className="peer block h-10 w-full rounded-lg border border-input bg-surface pl-10 pr-9 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring [&::-webkit-search-cancel-button]:hidden"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && e.currentTarget.value) {
            e.currentTarget.value = "";
            handleSearch.cancel();
            setQuery("");
          }
        }}
        defaultValue={query}
      />
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground peer-focus:text-foreground" />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            if (inputRef.current) inputRef.current.value = "";
            handleSearch.cancel();
            setQuery("");
            inputRef.current?.focus();
          }}
          className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
