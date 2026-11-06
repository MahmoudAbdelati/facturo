import { z } from "zod";

export const INVOICE_CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"] as const;
export const MAX_LINE_ITEMS = 50;

export const invoiceStatusSchema = z.enum(["draft", "sent", "paid"], {
  invalid_type_error: "Choose a status.",
  required_error: "Choose a status.",
});

const isoDate = (message: string) =>
  z
    .string({ invalid_type_error: message, required_error: message })
    .regex(/^\d{4}-\d{2}-\d{2}$/, message)
    .refine((value) => !Number.isNaN(Date.parse(value)), message);

/** "12.50" → 1250. Rejects more than two decimals rather than rounding them away. */
const money = z
  .string()
  .trim()
  .min(1, "Enter a price.")
  // Optional group so an empty field gets only the "Enter a price" message.
  .regex(/^(\d{1,9}(\.\d{1,2})?)?$/, "Use a price like 120 or 120.50.")
  .transform((value) => Math.round(Number(value) * 100));

const quantity = z
  .string()
  .trim()
  .min(1, "Enter a quantity.")
  .regex(/^(\d{1,6}(\.\d{1,2})?)?$/, "Use a number with up to 2 decimals.")
  .transform(Number)
  .refine((value) => value > 0, "Must be more than 0.");

export const lineItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Describe the work.")
    .max(200, "Keep it under 200 characters."),
  quantity,
  unitPrice: money,
});

export const invoiceSchema = z
  .object({
    clientId: z.string({ invalid_type_error: "Choose a client.", required_error: "Choose a client." }).uuid("Choose a client."),
    issueDate: isoDate("Pick an issue date."),
    dueDate: isoDate("Pick a due date."),
    status: invoiceStatusSchema,
    currency: z.enum(INVOICE_CURRENCIES, { errorMap: () => ({ message: "Choose a currency." }) }),
    notes: z
      .string()
      .trim()
      .max(2000, "Keep notes under 2,000 characters.")
      .transform((value) => value || null),
    items: z
      .array(lineItemSchema)
      .min(1, "Add at least one line item.")
      .max(MAX_LINE_ITEMS, `An invoice can have up to ${MAX_LINE_ITEMS} line items.`),
  })
  .refine((data) => data.dueDate >= data.issueDate, {
    path: ["dueDate"],
    message: "The due date can't be before the issue date.",
  });

export type InvoiceInput = z.output<typeof invoiceSchema>;

export type LineItemField = keyof z.input<typeof lineItemSchema>;
export type InvoiceField = Exclude<keyof z.input<typeof invoiceSchema>, "items">;

export type InvoiceFormState = {
  status?: "error" | "success";
  message?: string | null;
  errors?: Partial<Record<InvoiceField | "items", string[]>>;
  /** Errors per line item, by its position in the form. */
  itemErrors?: Record<number, Partial<Record<LineItemField, string[]>>>;
  invoice?: { id: string; number: string };
};

/** Reads the form's fields. Line items are parallel `item-*` fields, one set per row. */
export function invoiceFromFormData(formData: FormData) {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : undefined;
  };
  const all = (name: string) => formData.getAll(name).map((value) => String(value));

  const descriptions = all("item-description");
  const quantities = all("item-quantity");
  const prices = all("item-price");

  return {
    clientId: text("clientId"),
    issueDate: text("issueDate"),
    dueDate: text("dueDate"),
    status: text("status"),
    currency: text("currency"),
    notes: text("notes") ?? "",
    items: descriptions.map((description, index) => ({
      description,
      quantity: quantities[index] ?? "",
      unitPrice: prices[index] ?? "",
    })),
  };
}

/** Splits Zod issues into top-level field errors and per-row line item errors. */
export function invoiceErrors(error: z.ZodError): InvoiceFormState {
  const errors: NonNullable<InvoiceFormState["errors"]> = {};
  const itemErrors: NonNullable<InvoiceFormState["itemErrors"]> = {};

  for (const issue of error.issues) {
    const [field, index, itemField] = issue.path;
    if (field === "items" && typeof index === "number" && typeof itemField === "string") {
      const row = (itemErrors[index] ??= {});
      (row[itemField as LineItemField] ??= []).push(issue.message);
    } else if (typeof field === "string") {
      const list = (errors[field as InvoiceField | "items"] ??= []);
      if (!list.includes(issue.message)) list.push(issue.message);
    }
  }

  return { status: "error", message: "Some fields need attention.", errors, itemErrors };
}
