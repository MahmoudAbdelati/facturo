"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useSyncExternalStore } from "react";

// The pages visited in this tab, oldest first, so a page can link back to exactly
// where the user came from (a filtered list, page 3, a client) instead of a fixed URL.
// It lives in sessionStorage: per tab, and gone when the tab closes.
const KEY = "facturo:visited";
const LIMIT = 30;

function readVisited(): string[] {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((url) => typeof url === "string") : [];
  } catch {
    return [];
  }
}

function recordVisit(url: string) {
  const visited = readVisited();
  if (visited.at(-1) === url) return;
  visited.push(url);
  try {
    sessionStorage.setItem(KEY, JSON.stringify(visited.slice(-LIMIT)));
  } catch {
    // Storage can be blocked; return links then use their fallback.
  }
}

function Tracker() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  useEffect(() => {
    recordVisit(search ? `${pathname}?${search}` : pathname);
  }, [pathname, search]);
  return null;
}

/** Records each page visited in the app. Rendered once, in the app layout. */
export function VisitTracker() {
  // useSearchParams needs a Suspense boundary so it doesn't opt the whole layout out of streaming.
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}

const LABELS: [RegExp, string][] = [
  [/^\/overview$/, "Overview"],
  [/^\/invoices$/, "Invoices"],
  [/^\/invoices\/new$/, "New invoice"],
  [/^\/invoices\/[^/]+$/, "Invoice"],
  [/^\/clients$/, "Clients"],
  [/^\/clients\/new$/, "New client"],
  [/^\/clients\/[^/]+$/, "Client"],
];

/** What a back link to this URL should say. */
export function labelFor(url: string) {
  const path = url.split("?")[0];
  return LABELS.find(([pattern]) => pattern.test(path))?.[1] ?? "Back";
}

/**
 * The most recent page visited before this one that `skip` doesn't rule out,
 * or `fallback` when there is none (opened from a bookmark, a shared link, a new tab).
 */
export function useReturnUrl(fallback: string, skip: (path: string) => boolean = () => false) {
  const pathname = usePathname();

  // Read during render on the client; the server (and hydration) uses the fallback.
  // The visit list only grows with navigation, which re-renders the page anyway,
  // so there is nothing to subscribe to.
  return useSyncExternalStore(
    noSubscription,
    () => {
      const found = readVisited()
        .reverse()
        .find((visited) => {
          const path = visited.split("?")[0];
          return path !== pathname && !skip(path);
        });
      return found ?? fallback;
    },
    () => fallback,
  );
}

const noSubscription = () => () => {};

/** A link back to where the user came from. Server-rendered with the fallback, so it always works. */
export function ReturnLink({
  fallback,
  skip,
  className,
  children,
}: {
  fallback: string;
  skip?: (path: string) => boolean;
  className?: string;
  /** Given the target URL; renders the link's content. */
  children: (url: string) => React.ReactNode;
}) {
  const url = useReturnUrl(fallback, skip);
  return (
    <Link href={url} className={className}>
      {children(url)}
    </Link>
  );
}
