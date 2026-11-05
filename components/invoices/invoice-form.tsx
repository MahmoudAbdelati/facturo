"use client";

import Link from "next/link";
import { useActionState } from "react";
import { DollarSign, UserRound } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError, Input, Label, Select } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import type { ClientOption, InvoiceStatus } from "@/lib/types";
import type { InvoiceFormState } from "@/lib/validations/invoice";

const statuses: { value: InvoiceStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
];

export function InvoiceForm({
  clients,
  invoice,
  action,
  submitLabel,
}: {
  clients: ClientOption[];
  invoice?: {
    client_id: string;
    status: InvoiceStatus;
    total: number;
    currency: string;
  };
  action: (state: InvoiceFormState, formData: FormData) => Promise<InvoiceFormState>;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, {
    message: null,
    errors: {},
  });

  return (
    <form action={formAction} className="max-w-2xl">
      <Card className="space-y-5 p-5 md:p-6">
        <div>
          <Label htmlFor="client">Client</Label>
          <Select
            id="client"
            name="clientId"
            icon={UserRound}
            defaultValue={invoice?.client_id ?? ""}
            aria-describedby="client-error"
            aria-invalid={!!state.errors?.clientId}
          >
            <option value="" disabled>
              Choose a client
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
          <FieldError id="client-error" errors={state.errors?.clientId} />
        </div>

        <div>
          <Label htmlFor="amount">Amount</Label>
          {invoice ? (
            <p id="amount" className="font-mono text-sm tabular-nums">
              {formatCurrency(invoice.total, invoice.currency)}
            </p>
          ) : (
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              icon={DollarSign}
              className="font-mono tabular-nums"
              aria-describedby="amount-error"
              aria-invalid={!!state.errors?.amount}
            />
          )}
          <FieldError id="amount-error" errors={state.errors?.amount} />
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
                  defaultChecked={(invoice?.status ?? "draft") === value}
                  className="h-4 w-4 border-input text-accent focus:ring-ring"
                  aria-describedby="status-error"
                />
                {label}
              </label>
            ))}
          </div>
          <FieldError id="status-error" errors={state.errors?.status} />
        </fieldset>

        {state.message && (
          <p className="text-sm text-danger" aria-live="polite">
            {state.message}
          </p>
        )}
      </Card>

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
