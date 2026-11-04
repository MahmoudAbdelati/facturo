import clsx from "clsx";

const variants = {
  primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
  secondary: "border border-border bg-surface text-foreground hover:bg-muted",
} as const;

export const buttonClasses = (variant: keyof typeof variants = "primary") =>
  clsx(
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    variants[variant],
  );

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
}

export function Button({ variant, className, ...rest }: ButtonProps) {
  return <button {...rest} className={clsx(buttonClasses(variant), className)} />;
}
