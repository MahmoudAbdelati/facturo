"use client";

import { useFormStatus } from "react-dom";
import clsx from "clsx";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { logInAsDemo } from "@/lib/actions/auth";

function SubmitButton({
  variant,
  size,
  className,
  children,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
  className?: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-disabled={pending}
      onClick={(event) => pending && event.preventDefault()}
      className={clsx(buttonClasses(variant, size), className)}
    >
      {children}
      {pending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

/** Signs in to the shared demo workspace. */
export function DemoButton({
  variant = "primary",
  size = "md",
  className,
  redirectTo,
  children = "Try the demo",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  redirectTo?: string;
  children?: React.ReactNode;
}) {
  return (
    <form action={logInAsDemo} className="contents">
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <SubmitButton variant={variant} size={size} className={className}>
        {children}
      </SubmitButton>
    </form>
  );
}
