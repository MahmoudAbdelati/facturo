import { z } from "zod";

export const invoiceStatusSchema = z.enum(["draft", "sent", "paid"], {
  invalid_type_error: "Choose a status.",
  required_error: "Choose a status.",
});

// Until the line-item form lands, a new invoice gets one item for the full amount,
// and editing changes only the client and status.
export const invoiceSchema = z.object({
  clientId: z.string({ invalid_type_error: "Choose a client." }).uuid("Choose a client."),
  amount: z.coerce.number().gt(0, { message: "Enter an amount greater than 0." }),
  status: invoiceStatusSchema,
});

export const invoiceUpdateSchema = invoiceSchema.omit({ amount: true });

export type InvoiceFormState = {
  errors?: {
    clientId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
