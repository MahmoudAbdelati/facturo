"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getNextInvoiceNumber } from "@/lib/queries/invoices";
import { isUuid } from "@/lib/queries/shared";
import type { InvoiceStatus } from "@/lib/types";
import {
  invoiceSchema,
  invoiceStatusSchema,
  invoiceUpdateSchema,
  type InvoiceFormState,
} from "@/lib/validations/invoice";

const PAYMENT_TERMS_DAYS = 30;

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function revalidateInvoices() {
  revalidatePath("/invoices");
  revalidatePath("/overview");
  revalidatePath("/clients");
}

export async function createInvoice(
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const parsed = invoiceSchema.safeParse({
    clientId: formData.get("clientId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Some fields need attention.",
    };
  }

  const { clientId, amount, status } = parsed.data;
  const today = new Date();
  const issueDate = isoDate(today);
  const dueDate = isoDate(new Date(today.getTime() + PAYMENT_TERMS_DAYS * 86_400_000));

  try {
    const number = await getNextInvoiceNumber();
    await sql.begin(async (tx) => {
      const [invoice] = await tx`
        INSERT INTO invoices (number, client_id, issue_date, due_date, status, paid_at)
        VALUES (${number}, ${clientId}, ${issueDate}, ${dueDate}, ${status},
                ${status === "paid" ? issueDate : null})
        RETURNING id`;
      await tx`
        INSERT INTO invoice_items (invoice_id, description, quantity, unit_price)
        VALUES (${invoice.id}, 'Services', 1, ${Math.round(amount * 100)})`;
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create invoice.");
  }

  revalidateInvoices();
  redirect("/invoices");
}

export async function updateInvoice(
  id: string,
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  if (!isUuid(id)) return { message: "That invoice doesn't exist." };

  const parsed = invoiceUpdateSchema.safeParse({
    clientId: formData.get("clientId"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Some fields need attention.",
    };
  }

  const { clientId, status } = parsed.data;

  try {
    await sql`
      UPDATE invoices
      SET client_id = ${clientId}, ${statusAssignment(status)}
      WHERE id = ${id}`;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update invoice.");
  }

  revalidateInvoices();
  redirect("/invoices");
}

export async function deleteInvoice(id: string) {
  if (!isUuid(id)) return;
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidateInvoices();
}

export async function setInvoiceStatus(id: string, status: InvoiceStatus) {
  // Server actions are public endpoints, so check the values at runtime too.
  if (!isUuid(id)) return;
  const parsedStatus = invoiceStatusSchema.parse(status);
  await sql`UPDATE invoices SET ${statusAssignment(parsedStatus)} WHERE id = ${id}`;
  revalidateInvoices();
}

/** Keeps paid_at in step with the status: set on first payment, cleared otherwise. */
function statusAssignment(status: InvoiceStatus) {
  return status === "paid"
    ? sql`status = 'paid', paid_at = COALESCE(paid_at, CURRENT_DATE)`
    : sql`status = ${status}, paid_at = NULL`;
}
