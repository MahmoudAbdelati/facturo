"use server";

import { revalidatePath } from "next/cache";
import type { TransactionSql } from "postgres";
import { sql } from "@/lib/db";
import { getNextInvoiceNumber } from "@/lib/queries/invoices";
import { isUuid } from "@/lib/queries/shared";
import type { InvoiceStatus } from "@/lib/types";
import {
  invoiceErrors,
  invoiceFromFormData,
  invoiceSchema,
  invoiceStatusSchema,
  type InvoiceInput,
  type InvoiceFormState,
} from "@/lib/validations/invoice";

type Tx = TransactionSql;

function revalidateInvoices() {
  revalidatePath("/invoices");
  revalidatePath("/overview");
  revalidatePath("/clients");
}

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

async function insertItems(tx: Tx, invoiceId: string, items: InvoiceInput["items"]) {
  const rows = items.map((item, position) => ({
    invoice_id: invoiceId,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    position,
  }));
  await tx`INSERT INTO invoice_items ${tx(rows)}`;
}

/** A paid invoice can't have been paid before it was issued. */
function paidAt(tx: Tx, input: InvoiceInput) {
  return input.status === "paid" ? tx`GREATEST(${input.issueDate}::date, CURRENT_DATE)` : null;
}

export async function createInvoice(
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const parsed = invoiceSchema.safeParse(invoiceFromFormData(formData));
  if (!parsed.success) return invoiceErrors(parsed.error);

  const input = parsed.data;

  // Two invoices saved at once can pick the same number; the second one tries the next.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const number = await getNextInvoiceNumber();
      const id = await sql.begin(async (tx) => {
        const [invoice] = await tx`
          INSERT INTO invoices (number, client_id, issue_date, due_date, status, currency, notes, paid_at)
          VALUES (${number}, ${input.clientId}, ${input.issueDate}, ${input.dueDate}, ${input.status},
                  ${input.currency}, ${input.notes}, ${paidAt(tx, input)})
          RETURNING id`;
        await insertItems(tx, invoice.id, input.items);
        return invoice.id as string;
      });

      revalidateInvoices();
      return { status: "success", invoice: { id, number } };
    } catch (error) {
      if (isUniqueViolation(error) && attempt < 2) continue;
      console.error(error);
      return { status: "error", message: "We couldn't save the invoice. Please try again." };
    }
  }
  return { status: "error", message: "We couldn't save the invoice. Please try again." };
}

export async function updateInvoice(
  id: string,
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  if (!isUuid(id)) return { status: "error", message: "That invoice doesn't exist." };

  const parsed = invoiceSchema.safeParse(invoiceFromFormData(formData));
  if (!parsed.success) return invoiceErrors(parsed.error);

  const input = parsed.data;

  try {
    const number = await sql.begin(async (tx) => {
      // A paid invoice keeps the day it was paid, unless that was before the new issue date.
      const [invoice] = await tx`
        UPDATE invoices
        SET client_id  = ${input.clientId},
            issue_date = ${input.issueDate},
            due_date   = ${input.dueDate},
            status     = ${input.status},
            currency   = ${input.currency},
            notes      = ${input.notes},
            paid_at    = ${
              input.status === "paid"
                ? tx`GREATEST(${input.issueDate}::date, COALESCE(paid_at, CURRENT_DATE))`
                : null
            }
        WHERE id = ${id}
        RETURNING number`;
      if (!invoice) return null;

      await tx`DELETE FROM invoice_items WHERE invoice_id = ${id}`;
      await insertItems(tx, id, input.items);
      return invoice.number as string;
    });

    if (!number) return { status: "error", message: "That invoice doesn't exist any more." };

    revalidateInvoices();
    return { status: "success", invoice: { id, number } };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "We couldn't save your changes. Please try again." };
  }
}

export async function deleteInvoice(id: string): Promise<{ ok: boolean }> {
  if (!isUuid(id)) return { ok: false };
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    console.error(error);
    return { ok: false };
  }
  revalidateInvoices();
  return { ok: true };
}

export async function setInvoiceStatus(id: string, status: InvoiceStatus): Promise<{ ok: boolean }> {
  // Server actions are public endpoints, so check the values at runtime too.
  if (!isUuid(id)) return { ok: false };
  const parsedStatus = invoiceStatusSchema.safeParse(status);
  if (!parsedStatus.success) return { ok: false };
  try {
    await sql`UPDATE invoices SET ${statusAssignment(parsedStatus.data)} WHERE id = ${id}`;
  } catch (error) {
    console.error(error);
    return { ok: false };
  }
  revalidateInvoices();
  return { ok: true };
}

/** Keeps paid_at in step with the status: set on first payment, cleared otherwise. */
function statusAssignment(status: InvoiceStatus) {
  return status === "paid"
    ? sql`status = 'paid', paid_at = COALESCE(paid_at, GREATEST(issue_date, CURRENT_DATE))`
    : sql`status = ${status}, paid_at = NULL`;
}

/**
 * Copies an invoice as a new draft dated today, with the same client, items, notes
 * and payment terms. Returns the copy so the caller can open it.
 */
export async function duplicateInvoice(
  id: string,
): Promise<{ ok: true; invoice: { id: string; number: string } } | { ok: false }> {
  if (!isUuid(id)) return { ok: false };

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const number = await getNextInvoiceNumber();
      const copyId = await sql.begin(async (tx) => {
        const [copy] = await tx`
          INSERT INTO invoices (number, client_id, issue_date, due_date, status, currency, notes, paid_at)
          SELECT ${number}, client_id, CURRENT_DATE, CURRENT_DATE + (due_date - issue_date),
                 'draft', currency, notes, NULL
          FROM invoices
          WHERE id = ${id}
          RETURNING id`;
        if (!copy) return null;

        await tx`
          INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, position)
          SELECT ${copy.id}, description, quantity, unit_price, position
          FROM invoice_items
          WHERE invoice_id = ${id}`;
        return copy.id as string;
      });

      if (!copyId) return { ok: false };
      revalidateInvoices();
      return { ok: true, invoice: { id: copyId, number } };
    } catch (error) {
      if (isUniqueViolation(error) && attempt < 2) continue;
      console.error(error);
      return { ok: false };
    }
  }
  return { ok: false };
}
