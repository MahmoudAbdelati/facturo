import { cache } from "react";
import { auth } from "@/auth";
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

export type CurrentUser = UserProfile & { id: string; currency: string };

/**
 * The signed-in user as the database has them now. The session keeps the name from when
 * they logged in, so anything that shows it after a settings change reads it from here.
 * Cached per request: the top bar and the page both ask for it.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | undefined> => {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return undefined;
  return withErrorMessage("Failed to load your settings.", async () => {
    const [row] = await sql`
      SELECT id, name, email, company_name, currency FROM users WHERE email = ${email}`;
    if (!row) return undefined;
    return { ...(row as CurrentUser), currency: (row.currency as string).trim() };
  });
});
