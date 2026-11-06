"use client";

import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Building2, Globe, Mail, Phone, Trash2, UserRound } from "lucide-react";
import { DeleteClientDialog } from "@/components/clients/delete-client-dialog";
import { isFormPath } from "@/components/layout/back-link";
import { ReturnLink } from "@/components/layout/return-link";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FieldError, Input, Label, Select } from "@/components/ui/input";
import { COUNTRIES } from "@/lib/countries";
import type { ClientDetail } from "@/lib/types";
import type { ClientField, ClientFormState } from "@/lib/validations/client";

export function ClientForm({
  client,
  action,
}: {
  /** The client being edited; leave out to create one. */
  client?: ClientDetail;
  action: (state: ClientFormState, formData: FormData) => Promise<ClientFormState>;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const uid = useId();
  const [state, formAction, isPending] = useActionState(action, {});
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Uncontrolled fields keep what was typed: the form is submitted by hand, so React
  // doesn't reset it after an error.
  useEffect(() => {
    if (state.status === "success" && state.client) {
      toast.success(client ? `${state.client.name} saved` : `${state.client.name} added`);
      router.push(`/clients/${state.client.id}`);
    } else if (state.status === "error") {
      const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      if (invalid) invalid.focus();
      else if (state.message) toast.error(state.message);
    }
  }, [state, client, router]);

  const errors = state.errors ?? {};
  const field = (name: ClientField) => ({
    id: `${uid}-${name}`,
    name,
    "aria-describedby": `${uid}-${name}-error`,
    "aria-invalid": !!errors[name],
  });

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
      className="mx-auto max-w-2xl space-y-6"
    >
      <Card>
        <CardHeader title="Contact" description="Who the invoices are addressed to." />
        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
          <div>
            <Label quiet htmlFor={`${uid}-name`}>Name</Label>
            <Input
              {...field("name")}
              icon={UserRound}
              defaultValue={client?.name}
              autoComplete="off"
              placeholder="e.g. Maya Lindqvist"
              autoFocus={!client}
            />
            <FieldError id={`${uid}-name-error`} errors={errors.name} />
          </div>
          <div>
            <Label quiet htmlFor={`${uid}-company`}>
              Company <span className="font-normal">(optional)</span>
            </Label>
            <Input
              {...field("company")}
              icon={Building2}
              defaultValue={client?.company ?? ""}
              autoComplete="off"
              placeholder="e.g. Harbor & Pine Studio"
            />
            <FieldError id={`${uid}-company-error`} errors={errors.company} />
          </div>
          <div className="sm:col-span-2">
            <Label quiet htmlFor={`${uid}-email`}>Billing email</Label>
            <Input
              {...field("email")}
              type="email"
              inputMode="email"
              icon={Mail}
              defaultValue={client?.email}
              autoComplete="off"
              placeholder="accounts@company.com"
            />
            <FieldError id={`${uid}-email-error`} errors={errors.email} />
          </div>
          <div>
            <Label quiet htmlFor={`${uid}-phone`}>
              Phone <span className="font-normal">(optional)</span>
            </Label>
            <Input
              {...field("phone")}
              type="tel"
              icon={Phone}
              defaultValue={client?.phone ?? ""}
              autoComplete="off"
              placeholder="+44 20 5550 0123"
            />
            <FieldError id={`${uid}-phone-error`} errors={errors.phone} />
          </div>
          <div>
            <Label quiet htmlFor={`${uid}-country`}>
              Country <span className="font-normal">(optional)</span>
            </Label>
            <Select {...field("country")} icon={Globe} defaultValue={client?.country?.trim() ?? ""}>
              <option value="">Not set</option>
              {COUNTRIES.map(({ code, name }) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </Select>
            <FieldError id={`${uid}-country-error`} errors={errors.country} />
          </div>
        </div>

        {state.status === "error" && state.message && (
          <p className="px-5 text-sm text-danger" role="alert">
            {state.message}
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-end">
          {client && (
            <Button
              variant="danger-soft"
              onClick={() => setConfirmingDelete(true)}
              className="hidden sm:mr-auto sm:inline-flex"
            >
              <Trash2 className="h-4 w-4" />
              Delete client
            </Button>
          )}
          <ReturnLink
            skip={isFormPath}
            fallback={client ? `/clients/${client.id}` : "/clients"}
            className={buttonClasses("secondary")}
          >
            {() => "Cancel"}
          </ReturnLink>
          <Button type="submit" aria-disabled={isPending} disabled={isPending}>
            {isPending ? "Saving…" : client ? "Save changes" : "Add client"}
          </Button>
        </div>
      </Card>

      {client && (
        <div className="sm:hidden">
          <Button variant="danger-soft" size="sm" onClick={() => setConfirmingDelete(true)}>
            <Trash2 className="h-4 w-4" />
            Delete client
          </Button>
        </div>
      )}

      {client && (
        <DeleteClientDialog
          id={client.id}
          name={client.name}
          invoiceCount={client.invoice_count + client.draft_count}
          open={confirmingDelete}
          onClose={() => setConfirmingDelete(false)}
          onDeleted={() => router.push("/clients")}
        />
      )}
    </form>
  );
}
