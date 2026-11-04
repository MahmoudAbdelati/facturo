"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import type { InvoiceStatus } from "@/lib/types";
import { invoiceSchema, type InvoiceFormState } from "@/lib/validations/invoice";

function parseInvoice(formData: FormData) {
  return invoiceSchema.safeParse({
    clientId: formData.get("clientId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
}

export async function createInvoice(
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const parsed = parseInvoice(formData);
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Some fields need attention.",
    };
  }

  const { clientId, amount, status } = parsed.data;
  const amountInCents = Math.round(amount * 100);
  const date = new Date().toISOString().split("T")[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${clientId}, ${amountInCents}, ${status}, ${date})`;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create invoice.");
  }

  revalidatePath("/invoices");
  redirect("/invoices");
}

export async function updateInvoice(
  id: string,
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const parsed = parseInvoice(formData);
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Some fields need attention.",
    };
  }

  const { clientId, amount, status } = parsed.data;
  const amountInCents = Math.round(amount * 100);

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${clientId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}`;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update invoice.");
  }

  revalidatePath("/invoices");
  redirect("/invoices");
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath("/invoices");
}

export async function setInvoiceStatus(id: string, status: InvoiceStatus) {
  // Server actions are public endpoints, so check the value at runtime too.
  const parsedStatus = invoiceSchema.shape.status.parse(status);
  await sql`UPDATE invoices SET status = ${parsedStatus} WHERE id = ${id}`;
  revalidatePath("/invoices");
  revalidatePath("/overview");
}
