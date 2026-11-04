import { z } from "zod";

export const invoiceSchema = z.object({
  clientId: z.string({
    invalid_type_error: "Choose a client.",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Choose a status.",
  }),
});

export type InvoiceFormState = {
  errors?: {
    clientId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
