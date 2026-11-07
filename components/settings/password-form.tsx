"use client";

import { startTransition, useActionState, useEffect, useId, useRef } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FieldError, Input, Label } from "@/components/ui/input";
import { changePassword } from "@/lib/actions/settings";
import type { PasswordField, SettingsFormState } from "@/lib/validations/settings";

const fields: { name: PasswordField; label: string; autoComplete: string }[] = [
  { name: "current", label: "Current password", autoComplete: "current-password" },
  { name: "next", label: "New password", autoComplete: "new-password" },
  { name: "confirm", label: "Repeat new password", autoComplete: "new-password" },
];

export function PasswordForm({ isDemo }: { isDemo: boolean }) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(changePassword, {} as SettingsFormState<PasswordField>);

  useEffect(() => {
    if (state.status === "success") {
      toast.success("Password changed");
      formRef.current?.reset();
    } else if (state.status === "error") {
      const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      if (invalid) invalid.focus();
      else if (state.message) toast.error(state.message);
    }
  }, [state]);

  const errors = state.errors ?? {};

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
      noValidate
    >
      <Card>
        <CardHeader
          title="Password"
          description={
            isDemo
              ? "Everyone who tries the demo shares this login, so its password stays as it is."
              : "Use at least 8 characters."
          }
        />
        <fieldset disabled={isDemo} className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-3">
          <legend className="sr-only">Change password</legend>
          {fields.map(({ name, label, autoComplete }) => (
            <div key={name}>
              <Label quiet htmlFor={`${uid}-${name}`}>{label}</Label>
              <Input
                id={`${uid}-${name}`}
                name={name}
                type="password"
                icon={name === "current" ? KeyRound : undefined}
                autoComplete={autoComplete}
                aria-describedby={`${uid}-${name}-error`}
                aria-invalid={!!errors[name]}
              />
              <FieldError id={`${uid}-${name}-error`} errors={errors[name]} />
            </div>
          ))}
        </fieldset>

        <div className="flex justify-end border-t border-border p-5">
          <Button
            type="submit"
            variant="secondary"
            aria-disabled={isPending || isDemo}
            disabled={isPending || isDemo}
            className="w-full sm:w-auto"
          >
            {isPending ? "Changing…" : "Change password"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
