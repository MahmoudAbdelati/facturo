"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, AtSign, KeyRound, LoaderCircle } from "lucide-react";
import { DemoButton } from "@/components/auth/demo-button";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { authenticate } from "@/lib/actions/auth";
import { safeRedirectPath } from "@/lib/safe-path";

/**
 * Where to go after logging in. The auth middleware sends a full URL (`http://host/clients`).
 * Only its path is kept, so whatever the host, the redirect stays on this site.
 */
function callbackPath(value: string | null) {
  if (value && /^[a-z][a-z\d+.-]*:/i.test(value)) {
    try {
      const url = new URL(value);
      value = url.pathname + url.search + url.hash;
    } catch {
      value = null;
    }
  }
  return safeRedirectPath(value);
}

export function LoginForm({ showDemo }: { showDemo: boolean }) {
  const searchParams = useSearchParams();
  const callbackUrl = callbackPath(searchParams.get("callbackUrl"));
  const [state, formAction, isPending] = useActionState(authenticate, undefined);
  const errorMessage = state?.error;

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            // React resets the form after the action; the reset restores this, so the email stays.
            defaultValue={state?.email}
            id="email"
            type="email"
            name="email"
            icon={AtSign}
            placeholder="you@studio.com"
            autoComplete="email"
            required
            aria-invalid={errorMessage ? true : undefined}
            aria-describedby="login-error"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            icon={KeyRound}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            minLength={6}
            aria-invalid={errorMessage ? true : undefined}
            aria-describedby="login-error"
          />
        </div>
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        <Button
          type="submit"
          className="w-full"
          aria-disabled={isPending}
          onClick={(event) => isPending && event.preventDefault()}
        >
          Log in
          {isPending ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
        <div id="login-error" className="flex items-center gap-1.5" aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <>
              <AlertCircle className="h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
              <p className="text-sm text-danger">{errorMessage}</p>
            </>
          )}
        </div>
      </form>

      {showDemo && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-2 text-center">
            <DemoButton variant="secondary" className="w-full" redirectTo={callbackUrl}>
              Explore the demo workspace
            </DemoButton>
            <p className="text-xs text-muted-foreground">
              A sample studio with a year of invoices. No sign-up needed.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
