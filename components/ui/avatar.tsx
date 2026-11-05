import clsx from "clsx";
import { initials } from "@/lib/format";

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-xs font-semibold text-accent-subtle-foreground",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
