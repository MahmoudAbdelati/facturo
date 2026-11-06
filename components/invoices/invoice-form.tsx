"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { Fragment, startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronRight, Coins, Hash, Plus, Trash2, UserRound } from "lucide-react";
import { DeleteInvoiceDialog } from "@/components/invoices/delete-invoice-dialog";
import { LineItemSheet } from "@/components/invoices/line-item-sheet";
import { isFormPath } from "@/components/layout/back-link";
import { ReturnLink } from "@/components/layout/return-link";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import type { ClientOption, InvoiceDetail, InvoiceStatus } from "@/lib/types";
import {
  INVOICE_CURRENCIES,
  MAX_LINE_ITEMS,
  type InvoiceFormState,
  type LineItemField,
} from "@/lib/validations/invoice";

// The selected card stays neutral so Save is the only strong accent here; the radio's dot
// carries the status colour, matching the status badges.
const STATUSES: { value: InvoiceStatus; label: string; hint: string; dot: string }[] = [
  { value: "draft", label: "Draft", hint: "Still being written", dot: "text-muted-foreground" },
  { value: "sent", label: "Sent", hint: "Waiting for payment", dot: "text-warning" },
  { value: "paid", label: "Paid", hint: "Payment received", dot: "text-success" },
];

const TERMS = [
  { days: 0, label: "On receipt" },
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 30, label: "30 days" },
];

const DAY = 86_400_000;

function addDays(iso: string, days: number) {
  return new Date(Date.parse(iso) + days * DAY).toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY);
}

type ItemRow = { key: string; description: string; quantity: string; unitPrice: string };

const emptyItem = (key: string): ItemRow => ({ key, description: "", quantity: "1", unitPrice: "" });

/** Line amount in cents, or 0 while the row is half filled in. */
function lineAmount(item: Pick<ItemRow, "quantity" | "unitPrice">) {
  const quantity = Number(item.quantity);
  const price = Number(item.unitPrice);
  if (!Number.isFinite(quantity) || !Number.isFinite(price) || quantity <= 0 || price < 0) return 0;
  return Math.round(quantity * Math.round(price * 100));
}

type SubmittedState = InvoiceFormState & { itemKeys: string[] };

export type InvoiceFormDefaults = {
  number: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  /** Preselected client for a new invoice. */
  clientId?: string;
};

export function InvoiceForm({
  clients,
  invoice,
  defaults,
  action,
}: {
  clients: ClientOption[];
  /** The invoice being edited; leave out to create one. */
  invoice?: InvoiceDetail;
  defaults: InvoiceFormDefaults;
  action: (state: InvoiceFormState, formData: FormData) => Promise<InvoiceFormState>;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const uid = useId();
  // Line item errors come back by position. Remember which rows were submitted, so removing
  // a row afterwards doesn't move its errors onto the next one.
  const [state, formAction, isPending] = useActionState(
    async (previous: SubmittedState, formData: FormData): Promise<SubmittedState> => ({
      ...(await action(previous, formData)),
      itemKeys: formData.getAll("item-key").map(String),
    }),
    { itemKeys: [] },
  );

  const [clientId, setClientId] = useState(invoice?.client_id ?? defaults.clientId ?? "");
  const [issueDate, setIssueDate] = useState(invoice?.issue_date ?? defaults.issueDate);
  const [dueDate, setDueDate] = useState(invoice?.due_date ?? defaults.dueDate);
  const [status, setStatus] = useState<InvoiceStatus>(invoice?.stored_status ?? "draft");
  const [currency, setCurrency] = useState(invoice?.currency ?? defaults.currency);
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  // Row keys end up in element ids, so they must match between server and client renders.
  const keyCounter = useRef(Math.max(invoice?.items.length ?? 0, 1));
  const [items, setItems] = useState<ItemRow[]>(() =>
    invoice?.items.length
      ? invoice.items.map((item, index) => ({
          key: `item-${index}`,
          description: item.description,
          quantity: String(item.quantity),
          unitPrice: (item.unit_price / 100).toFixed(2),
        }))
      : [emptyItem("item-0")],
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Phones edit items in a sheet; this is the item it's open for.
  const [editing, setEditing] = useState<{ key: string; isNew: boolean } | null>(null);
  // Rows edited since the last save attempt drop that attempt's errors.
  const [fixed, setFixed] = useState<{ for: SubmittedState; keys: Set<string> }>({
    for: state,
    keys: new Set(),
  });
  const fixedKeys = fixed.for === state ? fixed.keys : new Set<string>();
  const markFixed = (key: string) =>
    setFixed((current) => ({
      for: state,
      keys: new Set(current.for === state ? current.keys : []).add(key),
    }));

  const itemErrorsByKey = new Map<string, Partial<Record<LineItemField, string[]>>>();
  for (const [index, errors] of Object.entries(state.itemErrors ?? {})) {
    const key = state.itemKeys[Number(index)];
    if (key && !fixedKeys.has(key)) itemErrorsByKey.set(key, errors);
  }

  const focusNewRow = useRef(false);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "success" && state.invoice) {
      toast.success(invoice ? `${state.invoice.number} saved` : `${state.invoice.number} created`);
      router.push(`/invoices/${state.invoice.id}`);
    } else if (state.status === "error") {
      // Only fields shown at this screen size: phones and desktops show items differently.
      const invalid = Array.from(
        formRef.current?.querySelectorAll<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]') ?? [],
      ).find((element) => element.getClientRects().length > 0);
      if (invalid) invalid.focus();
      else if (state.message) toast.error(state.message);
    }
  }, [state, invoice, router]);

  useEffect(() => {
    if (!focusNewRow.current) return;
    focusNewRow.current = false;
    const inputs = itemsRef.current?.querySelectorAll<HTMLInputElement>("[data-item-description]");
    inputs?.[inputs.length - 1]?.focus();
  }, [items.length]);

  const total = items.reduce((sum, item) => sum + lineAmount(item), 0);
  const termDays = daysBetween(issueDate, dueDate);
  const errors = state.errors ?? {};

  const updateItem = (key: string, field: LineItemField, value: string) => {
    markFixed(key);
    setItems((rows) => rows.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  };

  const saveFromSheet = (draft: ItemRow) => {
    markFixed(draft.key);
    if (editing?.isNew) {
      keyCounter.current++;
      setItems((rows) => [...rows, draft]);
    } else {
      setItems((rows) => rows.map((row) => (row.key === draft.key ? draft : row)));
    }
    setEditing(null);
  };

  const editingItem = editing
    ? editing.isNew
      ? emptyItem(editing.key)
      : items.find((item) => item.key === editing.key)
    : undefined;

  const addItem = () => {
    focusNewRow.current = true;
    const key = `item-${keyCounter.current++}`;
    setItems((rows) => [...rows, emptyItem(key)]);
  };

  const removeItem = (key: string) => setItems((rows) => rows.filter((row) => row.key !== key));

  // Moving the issue date keeps the same payment terms.
  const changeIssueDate = (value: string) => {
    if (value && issueDate && dueDate) setDueDate(addDays(value, termDays));
    setIssueDate(value);
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      // Submit by hand so React doesn't reset the form afterwards: a reset would show the
      // first client in the select while the state still says "none chosen".
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
      noValidate
      className="grid grid-cols-1 gap-6 @page-xl:grid-cols-[minmax(0,1fr)_18rem] @page-xl:items-start"
    >
      <div className="min-w-0 space-y-6">
        <Card>
          <CardHeader title="Details" />
          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label quiet htmlFor={`${uid}-client`}>Client</Label>
              <Select
                id={`${uid}-client`}
                name="clientId"
                icon={UserRound}
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                aria-describedby={`${uid}-client-error`}
                aria-invalid={!!errors.clientId}
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
              <FieldError id={`${uid}-client-error`} errors={errors.clientId} />
            </div>

            <div>
              <Label quiet htmlFor={`${uid}-number`}>Invoice number</Label>
              <Input
                id={`${uid}-number`}
                icon={Hash}
                value={invoice?.number ?? defaults.number}
                readOnly
                aria-describedby={invoice ? undefined : `${uid}-number-hint`}
                className="bg-muted/50 font-mono text-muted-foreground"
              />
              {!invoice && (
                <p id={`${uid}-number-hint`} className="mt-2 text-xs text-muted-foreground">
                  Assigned when you save.
                </p>
              )}
            </div>

            <div>
              <Label quiet htmlFor={`${uid}-currency`}>Currency</Label>
              <Select
                id={`${uid}-currency`}
                name="currency"
                icon={Coins}
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                aria-describedby={`${uid}-currency-error`}
                aria-invalid={!!errors.currency}
              >
                {INVOICE_CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </Select>
              <FieldError id={`${uid}-currency-error`} errors={errors.currency} />
            </div>

            <div>
              <Label quiet htmlFor={`${uid}-issue`}>Issue date</Label>
              <Input
                id={`${uid}-issue`}
                name="issueDate"
                type="date"
                value={issueDate}
                onChange={(event) => changeIssueDate(event.target.value)}
                aria-describedby={`${uid}-issue-error`}
                aria-invalid={!!errors.issueDate}
              />
              <FieldError id={`${uid}-issue-error`} errors={errors.issueDate} />
            </div>

            <div>
              <Label quiet htmlFor={`${uid}-due`}>Due date</Label>
              <Input
                id={`${uid}-due`}
                name="dueDate"
                type="date"
                value={dueDate}
                min={issueDate || undefined}
                onChange={(event) => setDueDate(event.target.value)}
                aria-describedby={`${uid}-terms ${uid}-due-error`}
                aria-invalid={!!errors.dueDate}
              />
              <div id={`${uid}-terms`} className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Payment terms">
                {TERMS.map(({ days, label }) => (
                  <button
                    key={days}
                    type="button"
                    disabled={!issueDate}
                    aria-pressed={termDays === days}
                    onClick={() => setDueDate(addDays(issueDate, days))}
                    className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 aria-pressed:border-accent/40 aria-pressed:bg-accent-subtle aria-pressed:text-accent-subtle-foreground"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <FieldError id={`${uid}-due-error`} errors={errors.dueDate} />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Line items"
            description={`${items.length} of up to ${MAX_LINE_ITEMS}`}
          />
          <div className="p-5">
            {/* The item values are submitted from these hidden fields, so the phone list and the
                desktop rows can both edit the same state without sending everything twice. */}
            {items.map((item) => (
              <Fragment key={item.key}>
                <input type="hidden" name="item-key" value={item.key} />
                <input type="hidden" name="item-description" value={item.description} />
                <input type="hidden" name="item-quantity" value={item.quantity} />
                <input type="hidden" name="item-price" value={item.unitPrice} />
              </Fragment>
            ))}

            {/* Phones: a compact read-only list; a row opens the edit sheet. */}
            <ul className="-mx-5 -mt-1 divide-y divide-border border-y border-border @page-md:hidden">
              {items.map((item, index) => {
                const rowErrors = itemErrorsByKey.get(item.key);
                const firstError = rowErrors && Object.values(rowErrors).flat().find(Boolean);
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => setEditing({ key: item.key, isNew: false })}
                      data-invalid={firstError ? "true" : undefined}
                      aria-label={`Edit line item ${index + 1}: ${item.description || "no description"}`}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                    >
                      <span className="min-w-0 flex-1">
                        <span
                          className={clsx(
                            "block truncate text-sm",
                            !item.description && "text-muted-foreground",
                            firstError && "text-danger",
                          )}
                        >
                          {item.description || "Add a description"}
                        </span>
                        <span
                          className={clsx(
                            "mt-0.5 block truncate text-xs",
                            firstError ? "text-danger" : "font-mono text-muted-foreground",
                          )}
                        >
                          {firstError ??
                            `${item.quantity || 0} × ${formatCurrency(lineAmount({ quantity: "1", unitPrice: item.unitPrice }), currency)}`}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-sm tabular-nums">
                        {formatCurrency(lineAmount(item), currency)}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* With room for it (page-md): editable rows under column headers. */}
            <div
              aria-hidden
              className="hidden grid-cols-[minmax(0,1fr)_5.5rem_8rem_7rem_2.25rem] gap-3 pb-2 text-xs font-medium text-muted-foreground @page-md:grid"
            >
              <span>Description</span>
              <span>Qty</span>
              <span>Unit price</span>
              <span className="text-right">Amount</span>
              <span />
            </div>

            <div ref={itemsRef} className="hidden @page-md:block">
              {items.map((item, index) => {
                const rowErrors = itemErrorsByKey.get(item.key) ?? {};
                const id = `${uid}-${item.key}`;
                return (
                  <div
                    key={item.key}
                    role="group"
                    aria-label={`Line item ${index + 1}`}
                    className="grid grid-cols-[minmax(0,1fr)_5.5rem_8rem_7rem_2.25rem] items-start gap-x-3 gap-y-2 py-1.5"
                  >
                    <div>
                      <Label htmlFor={`${id}-description`} className="sr-only">
                        Description
                      </Label>
                      <Input
                        id={`${id}-description`}
                        data-item-description
                        placeholder="e.g. Brand identity – phase 2"
                        value={item.description}
                        onChange={(event) => updateItem(item.key, "description", event.target.value)}
                        aria-invalid={!!rowErrors.description}
                        aria-describedby={`${id}-errors`}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${id}-quantity`} className="sr-only">
                        Qty
                      </Label>
                      <Input
                        id={`${id}-quantity`}
                        inputMode="decimal"
                        value={item.quantity}
                        onChange={(event) => updateItem(item.key, "quantity", event.target.value)}
                        aria-invalid={!!rowErrors.quantity}
                        aria-describedby={`${id}-errors`}
                        className="font-mono tabular-nums"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${id}-price`} className="sr-only">
                        Unit price
                      </Label>
                      <Input
                        id={`${id}-price`}
                        inputMode="decimal"
                        placeholder="0.00"
                        value={item.unitPrice}
                        onChange={(event) => updateItem(item.key, "unitPrice", event.target.value)}
                        aria-invalid={!!rowErrors.unitPrice}
                        aria-describedby={`${id}-errors`}
                        className="font-mono tabular-nums"
                      />
                    </div>
                    <output
                      htmlFor={`${id}-quantity ${id}-price`}
                      className="block h-10 text-right font-mono text-sm leading-10 tabular-nums"
                    >
                      {formatCurrency(lineAmount(item), currency)}
                    </output>
                    {/* Removing an unsaved row is low-stakes: only the icon turns red. */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      disabled={items.length === 1}
                      aria-label={`Remove line item ${index + 1}`}
                      title="Remove"
                      className="flex h-10 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-danger focus-visible:text-danger disabled:pointer-events-none disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div id={`${id}-errors`} aria-live="polite" className="col-span-5 -mt-1 empty:hidden">
                      {(["description", "quantity", "unitPrice"] as const).flatMap((field) =>
                        (rowErrors[field] ?? []).map((message) => (
                          <p key={field + message} className="text-sm text-danger">
                            {message}
                          </p>
                        )),
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <FieldError id={`${uid}-items-error`} errors={errors.items} />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 @page-md:border-t @page-md:border-border @page-md:pt-4">
              <Button
                variant="soft"
                size="sm"
                onClick={() => setEditing({ key: `item-${keyCounter.current}`, isNew: true })}
                disabled={items.length >= MAX_LINE_ITEMS}
                className="@page-md:hidden"
              >
                <Plus className="h-4 w-4" />
                Add line item
              </Button>
              <Button
                variant="soft"
                size="sm"
                onClick={addItem}
                disabled={items.length >= MAX_LINE_ITEMS}
                className="hidden @page-md:inline-flex"
              >
                <Plus className="h-4 w-4" />
                Add line item
              </Button>
              <p className="flex items-baseline gap-3 text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-mono text-lg font-semibold tabular-nums" aria-live="polite">
                  {formatCurrency(total, currency)}
                </span>
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Notes" description="Shown on the invoice: payment details, thanks, terms." />
          <div className="p-5">
            <Label htmlFor={`${uid}-notes`} className="sr-only">
              Notes
            </Label>
            <Textarea
              id={`${uid}-notes`}
              name="notes"
              rows={4}
              maxLength={2000}
              placeholder="e.g. Bank transfer to IBAN … within the due date. Thank you!"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              aria-describedby={`${uid}-notes-error`}
              aria-invalid={!!errors.notes}
            />
            <FieldError id={`${uid}-notes-error`} errors={errors.notes} />
          </div>
        </Card>
      </div>

      <Card className="@page-xl:sticky @page-xl:top-20">
        <fieldset className="p-5">
          <legend className="float-left mb-3 w-full text-sm font-medium">Status</legend>
          <div className="clear-both grid grid-cols-1 gap-2 sm:grid-cols-3 @page-xl:grid-cols-1">
            {STATUSES.map(({ value, label, hint, dot }) => (
              <label
                key={value}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-input px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 has-[:checked]:border-foreground/25 has-[:checked]:bg-muted has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
              >
                <input
                  type="radio"
                  name="status"
                  value={value}
                  checked={status === value}
                  onChange={() => setStatus(value)}
                  className={clsx(
                    "mt-0.5 h-4 w-4 border-muted-foreground/50 bg-transparent focus:ring-0 focus:ring-offset-0",
                    dot,
                  )}
                  aria-describedby={`${uid}-status-error`}
                />
                <span>
                  <span className="block font-medium">{label}</span>
                  <span className="block text-xs text-muted-foreground">{hint}</span>
                </span>
              </label>
            ))}
          </div>
          <FieldError id={`${uid}-status-error`} errors={errors.status} />
        </fieldset>

        <div className="border-t border-border p-5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Total due</span>
            <span className="font-mono text-xl font-semibold tabular-nums">
              {formatCurrency(total, currency)}
            </span>
          </div>

          {state.status === "error" && state.message && (
            <p className="mt-3 text-sm text-danger" role="alert">
              {state.message}
            </p>
          )}

          {/* Delete stays smaller than Save and away from it: on the left from sm,
              in its own section on phones and in the narrow xl column. */}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end @page-xl:flex-col-reverse">
            {invoice && (
              <Button
                variant="danger-soft"
                onClick={() => setConfirmingDelete(true)}
                className="hidden sm:mr-auto sm:inline-flex @page-xl:hidden"
              >
                <Trash2 className="h-4 w-4" />
                Delete invoice
              </Button>
            )}
            {/* Back to wherever the form was opened from: the list, the invoice, the overview. */}
            <ReturnLink
              skip={isFormPath}
              fallback={invoice ? `/invoices/${invoice.id}` : "/invoices"}
              className={clsx(buttonClasses("secondary"), "@page-xl:w-full")}
            >
              {() => "Cancel"}
            </ReturnLink>
            <Button type="submit" aria-disabled={isPending} disabled={isPending} className="@page-xl:w-full">
              {isPending ? "Saving…" : invoice ? "Save changes" : "Create invoice"}
            </Button>
          </div>

          {invoice && (
            <div className="mt-5 border-t border-border pt-5 sm:hidden @page-xl:block">
              <Button variant="danger-soft" size="sm" onClick={() => setConfirmingDelete(true)}>
                <Trash2 className="h-4 w-4" />
                Delete invoice
              </Button>
            </div>
          )}
        </div>
      </Card>

      {editing && editingItem && (
        <LineItemSheet
          key={editing.key}
          item={editingItem}
          isNew={editing.isNew}
          initialErrors={itemErrorsByKey.get(editing.key)}
          currency={currency}
          canRemove={items.length > 1}
          amountOf={lineAmount}
          onSave={saveFromSheet}
          onRemove={() => {
            removeItem(editing.key);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}

      {invoice && (
        <DeleteInvoiceDialog
          id={invoice.id}
          number={invoice.number}
          open={confirmingDelete}
          onClose={() => setConfirmingDelete(false)}
          onDeleted={() => router.push("/invoices")}
        />
      )}
    </form>
  );
}
