import { sql } from "@/lib/db";
import { withErrorMessage } from "./shared";

/** The signed-in user's default currency for new invoices. */
export function getUserCurrency(email: string | null | undefined): Promise<string> {
  if (!email) return Promise.resolve("USD");
  return withErrorMessage("Failed to load your settings.", async () => {
    const [row] = await sql`SELECT currency FROM users WHERE email = ${email}`;
    return (row?.currency as string | undefined)?.trim() || "USD";
  });
}
