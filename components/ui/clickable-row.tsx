"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";

// Clicks on these keep their own meaning instead of opening the row.
const INTERACTIVE = "a, button, input, select, textarea, label, summary, dialog, [role='menu'], [role='menuitem']";

/** Whether a click should open the row: not on a control, and not the end of a text selection. */
function opensRow(event: React.MouseEvent<HTMLTableRowElement>) {
  const target = event.target as Element;
  // Events from portals (sheets, menus) bubble through React but aren't inside the row.
  if (!event.currentTarget.contains(target)) return false;
  if (target.closest(INTERACTIVE)) return false;
  return !window.getSelection()?.toString();
}

/**
 * A table row that opens `href` when clicked anywhere that isn't a control.
 * The row still needs a real link inside it (for keyboards and screen readers):
 * this only makes the rest of the row a shortcut to the same place.
 * Ctrl/⌘-click and middle-click open a new tab, like a link.
 */
export function ClickableRow({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <tr
      className={clsx("cursor-pointer", className)}
      onMouseEnter={() => router.prefetch(href)}
      onClick={(event) => {
        if (!opensRow(event)) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey) window.open(href, "_blank", "noopener");
        else router.push(href);
      }}
      onAuxClick={(event) => {
        if (event.button === 1 && opensRow(event)) window.open(href, "_blank", "noopener");
      }}
    >
      {children}
    </tr>
  );
}
