"use client";

import Link from "next/link";
import { useActionState } from "react";
import clsx from "clsx";
import { DollarSign, UserRound } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import type { ClientOption, InvoiceFormData, InvoiceStatus } from "@/lib/types";
import type { InvoiceFormState } from "@/lib/validations/invoice";

const statuses: { value: InvoiceStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
];

const fieldClasses =
  "peer block h-10 w-full rounded-lg border border-input bg-background pl-10 text-sm placeholder:text-muted-foreground";

export function InvoiceForm({
  clients,
  invoice,
  action,
  submitLabel,
}: {
  clients: ClientOption[];
  invoice?: InvoiceFormData;
  action: (state: InvoiceFormState, formData: FormData) => Promise<InvoiceFormState>;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, { message: null, errors: {} });

  return (
    <form action={formAction} className="max-w-2xl">
      <div className="space-y-5 rounded-lg border border-border bg-surface p-5 md:p-6">
        <div>
          <label htmlFor="client" className="mb-2 block text-sm font-medium">
            Client
          </label>
          <div className="relative">
            <select
              id="client"
              name="clientId"
              className={clsx(fieldClasses, "cursor-pointer")}
              defaultValue={invoice?.customer_id ?? ""}
              aria-describedby="client-error"
            >
              <option value="" disabled>
                Choose a client
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <FieldErrors id="client-error" errors={state.errors?.clientId} />
        </div>

        <div>
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Amount
          </label>
          <div className="relative">
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              defaultValue={invoice?.amount}
              placeholder="0.00"
              className={clsx(fieldClasses, "font-mono tabular-nums")}
              aria-describedby="amount-error"
            />
            <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <FieldErrors id="amount-error" errors={state.errors?.amount} />
        </div>

        <fieldset>
          <legend className="mb-2 block text-sm font-medium">Status</legend>
          <div className="flex gap-2">
            {statuses.map(({ value, label }) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent-subtle"
              >
                <input
                  type="radio"
                  name="status"
                  value={value}
                  defaultChecked={invoice?.status === value}
                  className="h-4 w-4 border-input text-accent focus:ring-ring"
                  aria-describedby="status-error"
                />
                {label}
              </label>
            ))}
          </div>
          <FieldErrors id="status-error" errors={state.errors?.status} />
        </fieldset>

        {state.message && (
          <p className="text-sm text-danger" aria-live="polite">
            {state.message}
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Link href="/invoices" className={buttonClasses("secondary")}>
          Cancel
        </Link>
        <Button type="submit" aria-disabled={isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function FieldErrors({ id, errors }: { id: string; errors?: string[] }) {
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
