// Server only: imported by server actions and server components, never by "use client" files.

import { sql } from "@/lib/db";

/** The shared demo workspace created by `pnpm db:seed`. Same defaults as the seed script. */
export const demoAccount = {
  email: process.env.DEMO_EMAIL ?? "demo@facturo.app",
  password: process.env.DEMO_PASSWORD ?? "facturo-demo",
};

/** Set DEMO_DISABLED=1 to hide "Try the demo" (for a workspace with real data). */
export const demoEnabled = process.env.DEMO_DISABLED !== "1";

/** Whether this signed-in email is the shared demo login. */
export function isDemoUser(email: string | null | undefined) {
  return demoEnabled && email === demoAccount.email;
}

/**
 * Caps on the public demo, so nobody can fill the database between nightly resets
 * (the seed has 25 clients and 150 invoices). No caps when the demo is disabled.
 */
export const demoLimits = { clients: 60, invoices: 300 } as const;

/** A message when the demo already holds as many of these as it may, otherwise null. */
export async function demoLimitMessage(kind: keyof typeof demoLimits): Promise<string | null> {
  if (!demoEnabled) return null;
  const [row] =
    kind === "clients"
      ? await sql`SELECT count(*)::int AS n FROM clients`
      : await sql`SELECT count(*)::int AS n FROM invoices`;
  if (row.n < demoLimits[kind]) return null;
  return `The demo holds up to ${demoLimits[kind]} ${kind}. Delete one first, or come back after the nightly reset.`;
}
