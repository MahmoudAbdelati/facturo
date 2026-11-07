import { z } from "zod";
import { INVOICE_CURRENCIES } from "@/lib/validations/invoice";

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(100, "Keep your name under 100 characters."),
  company_name: z
    .string()
    .trim()
    .max(100, "Keep the business name under 100 characters.")
    .transform((value) => value || null),
  currency: z.enum(INVOICE_CURRENCIES, { errorMap: () => ({ message: "Choose a currency." }) }),
});

export type ProfileField = keyof z.input<typeof profileSchema>;

export const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    next: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(72, "Keep it under 72 characters."),
    confirm: z.string(),
  })
  .refine((value) => value.next === value.confirm, {
    path: ["confirm"],
    message: "The passwords don't match.",
  });

export type PasswordField = keyof z.input<typeof passwordSchema>;

export type SettingsFormState<Field extends string> = {
  status?: "error" | "success";
  message?: string | null;
  errors?: Partial<Record<Field, string[]>>;
};

export function fieldErrors<Field extends string>(error: z.ZodError): SettingsFormState<Field> {
  const errors: Partial<Record<Field, string[]>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as Field;
    errors[field] ??= [issue.message];
  }
  return { status: "error", message: "Some fields need attention.", errors };
}

export function textFields<Field extends string>(formData: FormData, fields: readonly Field[]) {
  return Object.fromEntries(
    fields.map((name) => {
      const value = formData.get(name);
      return [name, typeof value === "string" ? value : ""];
    }),
  ) as Record<Field, string>;
}
