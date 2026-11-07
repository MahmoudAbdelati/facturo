"use client";

import { startTransition, useActionState, useEffect, useId, useRef } from "react";
import { toast } from "sonner";
import { Building2, Coins, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FieldError, Input, Label, Select } from "@/components/ui/input";
import { updateProfile } from "@/lib/actions/settings";
import { INVOICE_CURRENCIES } from "@/lib/validations/invoice";
import type { ProfileField, SettingsFormState } from "@/lib/validations/settings";
import type { CurrentUser } from "@/lib/queries/users";

const CURRENCY_NAMES: Record<(typeof INVOICE_CURRENCIES)[number], string> = {
  USD: "US dollar",
  EUR: "Euro",
  GBP: "British pound",
  CAD: "Canadian dollar",
  AUD: "Australian dollar",
};

export function ProfileForm({ user }: { user: CurrentUser }) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(updateProfile, {} as SettingsFormState<ProfileField>);

  useEffect(() => {
    if (state.status === "success") toast.success("Settings saved");
    else if (state.status === "error") {
      const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      if (invalid) invalid.focus();
      else if (state.message) toast.error(state.message);
    }
  }, [state]);

  const errors = state.errors ?? {};
  const field = (name: ProfileField) => ({
    id: `${uid}-${name}`,
    name,
    "aria-describedby": `${uid}-${name}-error`,
    "aria-invalid": !!errors[name],
  });

  return (
    <form
      ref={formRef}
      action={formAction}
      // Submitted by hand so React doesn't reset the uncontrolled fields after an error.
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
      noValidate
      className="space-y-6"
    >
      <Card>
        <CardHeader title="Profile" description="How you appear in Facturo." />
        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
          <div>
            <Label quiet htmlFor={`${uid}-name`}>Your name</Label>
            <Input {...field("name")} icon={UserRound} defaultValue={user.name} autoComplete="name" />
            <FieldError id={`${uid}-name-error`} errors={errors.name} />
          </div>
          <div>
            <Label quiet htmlFor={`${uid}-email`}>Email</Label>
            <Input
              id={`${uid}-email`}
              icon={Mail}
              value={user.email}
              readOnly
              aria-describedby={`${uid}-email-hint`}
              className="text-muted-foreground"
            />
            <p id={`${uid}-email-hint`} className="mt-1.5 text-xs text-muted-foreground">
              You log in with this address.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Business" description="Printed at the top of every invoice you send." />
        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
          <div>
            <Label quiet htmlFor={`${uid}-company_name`}>
              Business name <span className="font-normal">(optional)</span>
            </Label>
            <Input
              {...field("company_name")}
              icon={Building2}
              defaultValue={user.company_name ?? ""}
              autoComplete="organization"
              placeholder="e.g. Northwind Studio"
            />
            <FieldError id={`${uid}-company_name-error`} errors={errors.company_name} />
          </div>
          <div>
            <Label quiet htmlFor={`${uid}-currency`}>Default currency</Label>
            <Select
              {...field("currency")}
              icon={Coins}
              defaultValue={user.currency}
              aria-describedby={`${uid}-currency-hint ${uid}-currency-error`}
            >
              {INVOICE_CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code} · {CURRENCY_NAMES[code]}
                </option>
              ))}
            </Select>
            <p id={`${uid}-currency-hint`} className="mt-1.5 text-xs text-muted-foreground">
              New invoices start in this currency.
            </p>
            <FieldError id={`${uid}-currency-error`} errors={errors.currency} />
          </div>
        </div>

        <div className="flex justify-end border-t border-border p-5">
          <Button type="submit" aria-disabled={isPending} disabled={isPending} className="w-full sm:w-auto">
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
