import clsx from "clsx";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={clsx("h-8 w-8 shrink-0", className)}
    >
      {/* Rounded sheet with a folded top-right corner */}
      <path
        d="M8 0H24L32 8V24A8 8 0 0 1 24 32H8A8 8 0 0 1 0 24V8A8 8 0 0 1 8 0Z"
        className="fill-accent"
      />
      <path d="M24 0V6A2 2 0 0 0 26 8H32Z" className="fill-emerald-400 dark:fill-emerald-200"
      />
      {/* The F */}
      <path
        d="M10 9.5A1.5 1.5 0 0 1 11.5 8H21.5A1.5 1.5 0 0 1 23 9.5V10.5A1.5 1.5 0 0 1 21.5 12H14V14.5H19.5A1.5 1.5 0 0 1 21 16V16.5A1.5 1.5 0 0 1 19.5 18H14V22.5A1.5 1.5 0 0 1 12.5 24H11.5A1.5 1.5 0 0 1 10 22.5Z"
        className="fill-accent-foreground"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight text-foreground">
        Facturo
      </span>
    </span>
  );
}
