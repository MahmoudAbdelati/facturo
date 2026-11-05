"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, AtSign, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authenticate } from "@/lib/actions/auth";

const inputClasses =
  "peer block h-10 w-full rounded-lg border border-input bg-background pl-10 text-sm placeholder:text-muted-foreground";
const iconClasses =
  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground peer-focus:text-foreground";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/overview";
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          Email
        </label>
        <div className="relative">
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@studio.com"
            autoComplete="email"
            required
            className={inputClasses}
          />
          <AtSign className={iconClasses} />
        </div>
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            minLength={6}
            className={inputClasses}
          />
          <KeyRound className={iconClasses} />
        </div>
      </div>
      <input type="hidden" name="redirectTo" value={callbackUrl} />
      <Button type="submit" className="w-full" aria-disabled={isPending}>
        Log in <ArrowRight className="h-4 w-4" />
      </Button>
      <div className="flex min-h-5 items-center gap-1.5" aria-live="polite" aria-atomic="true">
        {errorMessage && (
          <>
            <AlertCircle className="h-4 w-4 text-danger" />
            <p className="text-sm text-danger">{errorMessage}</p>
          </>
        )}
      </div>
    </form>
  );
}
