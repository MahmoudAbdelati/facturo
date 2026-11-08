"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { demoLimitMessage } from "@/lib/demo";
import { isUuid } from "@/lib/queries/shared";
import {
  clientErrors,
  clientFromFormData,
  clientSchema,
  type ClientFormState,
} from "@/lib/validations/client";

function revalidateClients() {
  revalidatePath("/clients", "layout");
  revalidatePath("/invoices", "layout");
  revalidatePath("/overview");
}

export async function createClient(
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const parsed = clientSchema.safeParse(clientFromFormData(formData));
  if (!parsed.success) return clientErrors(parsed.error);

  const limit = await demoLimitMessage("clients");
  if (limit) return { status: "error", message: limit };

  const input = parsed.data;
  try {
    const [client] = await sql`
      INSERT INTO clients (name, company, email, phone, country)
      VALUES (${input.name}, ${input.company}, ${input.email}, ${input.phone}, ${input.country})
      RETURNING id, name`;
    revalidateClients();
    return { status: "success", client: { id: client.id, name: client.name } };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "We couldn't save the client. Please try again." };
  }
}

export async function updateClient(
  id: string,
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  if (!isUuid(id)) return { status: "error", message: "That client doesn't exist." };

  const parsed = clientSchema.safeParse(clientFromFormData(formData));
  if (!parsed.success) return clientErrors(parsed.error);

  const input = parsed.data;
  try {
    const [client] = await sql`
      UPDATE clients
      SET name    = ${input.name},
          company = ${input.company},
          email   = ${input.email},
          phone   = ${input.phone},
          country = ${input.country}
      WHERE id = ${id}
      RETURNING id, name`;
    if (!client) return { status: "error", message: "That client doesn't exist any more." };

    revalidateClients();
    return { status: "success", client: { id: client.id, name: client.name } };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "We couldn't save your changes. Please try again." };
  }
}

export type DeleteClientResult =
  | { ok: true }
  | { ok: false; reason: "has-invoices"; invoiceCount: number }
  | { ok: false; reason: "error" };

/**
 * Deletes a client with no invoices. Invoices are records of what was billed, so a
 * client who has any stays until those are deleted (the foreign key refuses it too).
 */
export async function deleteClient(id: string): Promise<DeleteClientResult> {
  if (!isUuid(id)) return { ok: false, reason: "error" };

  try {
    const result = await sql.begin(async (tx) => {
      const [{ count }] = await tx`SELECT COUNT(*)::int AS count FROM invoices WHERE client_id = ${id}`;
      if (count > 0) return { ok: false as const, reason: "has-invoices" as const, invoiceCount: count };
      await tx`DELETE FROM clients WHERE id = ${id}`;
      return { ok: true as const };
    });
    if (result.ok) revalidateClients();
    return result;
  } catch (error) {
    console.error(error);
    return { ok: false, reason: "error" };
  }
}
