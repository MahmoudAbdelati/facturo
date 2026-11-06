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

export type UserProfile = {
  name: string;
  email: string;
  company_name: string | null;
};

/** Who the invoices are from: the signed-in user's name, company and email. */
export function getUserProfile(email: string | null | undefined): Promise<UserProfile | undefined> {
  if (!email) return Promise.resolve(undefined);
  return withErrorMessage("Failed to load your settings.", async () => {
    const [row] = await sql`SELECT name, email, company_name FROM users WHERE email = ${email}`;
    return row as UserProfile | undefined;
  });
}
