"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError, Input, Label } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import { lineItemSchema, type LineItemField } from "@/lib/validations/invoice";

export type LineItemDraft = { key: string; description: string; quantity: string; unitPrice: string };
export type LineItemErrors = Partial<Record<LineItemField, string[]>>;

/**
 * Edits one line item on phones. Works on a copy: Done checks it and hands it back,
 * closing throws it away. Mount it only while editing, keyed by the item.
 */
export function LineItemSheet({
  item,
  isNew,
  initialErrors,
  currency,
  canRemove,
  amountOf,
  onSave,
  onRemove,
  onClose,
}: {
  item: LineItemDraft;
  isNew: boolean;
  /** Errors from the last save attempt, shown until the field is edited. */
  initialErrors?: LineItemErrors;
  currency: string;
  canRemove: boolean;
  amountOf: (item: LineItemDraft) => number;
  onSave: (item: LineItemDraft) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const uid = useId();
  const [draft, setDraft] = useState(item);
  const [errors, setErrors] = useState<LineItemErrors>(initialErrors ?? {});
  const descriptionRef = useRef<HTMLInputElement>(null);

  // A new item starts typing straight away. Editing doesn't, so the phone keyboard
  // doesn't cover the sheet when someone only wants to check or remove an item.
  // (This runs after the Dialog's own effect has opened it.)
  useEffect(() => {
    if (isNew) descriptionRef.current?.focus();
  }, [isNew]);

  const change = (field: LineItemField, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const done = (event: React.FormEvent) => {
    event.preventDefault();
    // React bubbles events through portals, so without this the invoice form would submit too.
    event.stopPropagation();
    const parsed = lineItemSchema.safeParse(draft);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      const form = event.currentTarget as HTMLFormElement;
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    onSave({ ...draft, description: draft.description.trim() });
  };

  // Portalled out of the invoice form: Enter here should finish this item, not submit the invoice.
  return createPortal(
    <Dialog open onClose={onClose} title={isNew ? "Add line item" : "Edit line item"} placement="bottom">
      <form onSubmit={done} noValidate className="space-y-4">
        <div>
          <Label quiet htmlFor={`${uid}-description`}>
            Description
          </Label>
          <Input
            id={`${uid}-description`}
            ref={descriptionRef}
            placeholder="e.g. Brand identity – phase 2"
            value={draft.description}
            onChange={(event) => change("description", event.target.value)}
            aria-invalid={!!errors.description}
            aria-describedby={`${uid}-description-error`}
          />
          <FieldError id={`${uid}-description-error`} errors={errors.description} />
        </div>

        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3">
          <div>
            <Label quiet htmlFor={`${uid}-quantity`}>
              Qty
            </Label>
            <Input
              id={`${uid}-quantity`}
              inputMode="decimal"
              value={draft.quantity}
              onChange={(event) => change("quantity", event.target.value)}
              aria-invalid={!!errors.quantity}
              aria-describedby={`${uid}-quantity-error`}
              className="font-mono tabular-nums"
            />
            <FieldError id={`${uid}-quantity-error`} errors={errors.quantity} />
          </div>
          <div>
            <Label quiet htmlFor={`${uid}-price`}>
              Unit price
            </Label>
            <Input
              id={`${uid}-price`}
              inputMode="decimal"
              placeholder="0.00"
              value={draft.unitPrice}
              onChange={(event) => change("unitPrice", event.target.value)}
              aria-invalid={!!errors.unitPrice}
              aria-describedby={`${uid}-price-error`}
              className="font-mono tabular-nums"
            />
            <FieldError id={`${uid}-price-error`} errors={errors.unitPrice} />
          </div>
        </div>

        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">Amount</span>
          <output className="font-mono font-semibold tabular-nums">
            {formatCurrency(amountOf(draft), currency)}
          </output>
        </div>

        <div className="flex gap-2 pt-1">
          {!isNew && canRemove && (
            <Button variant="danger-soft" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          )}
          <Button type="submit" className="flex-1">
            {isNew ? "Add item" : "Done"}
          </Button>
        </div>
      </form>
    </Dialog>,
    document.body,
  );
}
