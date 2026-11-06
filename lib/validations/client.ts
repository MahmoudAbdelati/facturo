import { z } from "zod";
import { COUNTRY_CODES } from "@/lib/countries";

/** Empty text fields are stored as NULL. */
const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => value || null);

export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter the client's name.")
    .max(100, "Keep the name under 100 characters."),
  company: optionalText(100, "Keep the company under 100 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Enter an email address for invoices.")
    .max(200, "Keep the email under 200 characters.")
    .email("Use an email like name@company.com.")
    .transform((value) => value.toLowerCase()),
  phone: z
    .string()
    .trim()
    .max(30, "Keep the phone number under 30 characters.")
    .regex(/^(\+?[\d\s().-]{5,})?$/, "Use digits, spaces and an optional leading +.")
    .transform((value) => value || null),
  country: z
    .string()
    .trim()
    .refine((value) => value === "" || COUNTRY_CODES.includes(value), "Choose a country from the list.")
    .transform((value) => value || null),
});

export type ClientInput = z.output<typeof clientSchema>;
export type ClientField = keyof z.input<typeof clientSchema>;

export type ClientFormState = {
  status?: "error" | "success";
  message?: string | null;
  errors?: Partial<Record<ClientField, string[]>>;
  client?: { id: string; name: string };
};

export function clientFromFormData(formData: FormData) {
  const text = (name: ClientField) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    name: text("name"),
    company: text("company"),
    email: text("email"),
    phone: text("phone"),
    country: text("country"),
  };
}

export function clientErrors(error: z.ZodError): ClientFormState {
  const errors: NonNullable<ClientFormState["errors"]> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as ClientField;
    // One message per field: an empty email shouldn't also be told it's malformed.
    errors[field] ??= [issue.message];
  }
  return { status: "error", message: "Some fields need attention.", errors };
}
