import clsx from "clsx";
import { ChevronDown } from "lucide-react";

type Icon = React.ComponentType<{ className?: string }>;

const fieldClasses =
  "block w-full rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring aria-[invalid=true]:border-danger disabled:cursor-not-allowed disabled:opacity-50";

function LeadingIcon({ icon: Icon }: { icon?: Icon }) {
  if (!Icon) return null;
  return (
    <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  );
}

interface InputProps extends React.ComponentProps<"input"> {
  icon?: Icon;
}

export function Input({ icon, className, ...rest }: InputProps) {
  return (
    <div className="relative">
      <input {...rest} className={clsx(fieldClasses, "h-10", icon && "pl-10", className)} />
      <LeadingIcon icon={icon} />
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: Icon;
}

export function Select({ icon, className, children, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select
        {...rest}
        // bg-none drops the arrow from @tailwindcss/forms; we draw our own.
        className={clsx(fieldClasses, "h-10 cursor-pointer appearance-none bg-none pr-9", icon && "pl-10", className)}
      >
        {children}
      </select>
      <LeadingIcon icon={icon} />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...rest} className={clsx(fieldClasses, "py-2", className)} />;
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Smaller and muted, so the value in the field reads first. Used in data-entry forms. */
  quiet?: boolean;
}

export function Label({ quiet, className, ...rest }: LabelProps) {
  return (
    <label
      {...rest}
      className={clsx(
        "block font-medium",
        quiet ? "mb-1.5 text-xs text-muted-foreground" : "mb-2 text-sm",
        className,
      )}
    />
  );
}

/** Validation messages under a field; point the field's aria-describedby at `id`. */
export function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  return (
    <div id={id} aria-live="polite" aria-atomic="true">
      {errors?.map((error) => (
        <p key={error} className="mt-2 text-sm text-danger">
          {error}
        </p>
      ))}
    </div>
  );
}
