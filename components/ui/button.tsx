import clsx from "clsx";

const variants = {
  primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
  secondary: "border border-border bg-surface text-foreground hover:bg-muted",
  /** Tinted accent: for an action that should stay visible without being the focal point. */
  // In light mode the subtle tint is almost the sidebar's colour, so it gets a stronger tint and an inset ring.
  soft: "bg-accent/10 text-accent-subtle-foreground ring-1 ring-inset ring-accent/25 hover:bg-accent hover:text-accent-foreground dark:bg-accent-subtle dark:ring-0 dark:hover:bg-accent",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  danger: "bg-danger text-white hover:bg-danger/90",
  /** Tinted danger: opens a destructive flow (the confirm step uses solid `danger`). */
  "danger-soft": "bg-danger/10 text-danger hover:bg-danger/15 dark:hover:bg-danger/20",
} as const;

const sizes = {
  sm: "h-8 gap-1.5 px-3 text-sm",
  md: "h-10 gap-2 px-4 text-sm",
  icon: "h-9 w-9",
  /** Full width, icon-only on the rail; padding comes back with the label when the sidebar is open. */
  rail: "h-10 w-full gap-2 text-sm expanded:px-4",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

/** Button styles, for links and other elements that should look like a button. */
export const buttonClasses = (variant: ButtonVariant = "primary", size: ButtonSize = "md") =>
  clsx(
    "inline-flex shrink-0 items-center [&_svg]:shrink-0 justify-center rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    variants[variant],
    sizes[size],
  );

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant, size, className, type = "button", ...rest }: ButtonProps) {
  return <button type={type} {...rest} className={clsx(buttonClasses(variant, size), className)} />;
}
