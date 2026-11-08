import { expect, test } from "@playwright/test";
import postgres from "postgres";
import { sslFor } from "../lib/db-ssl.ts";
import { logInAsDemo } from "./helpers";

const url = process.env.POSTGRES_URL!;
const sql = postgres(url, { ssl: sslFor(url), max: 1, onnotice: () => {} });
test.afterAll(() => sql.end());

test("the demo stops adding clients at its cap", async ({ page }) => {
  // Fill the demo up to 60 clients (the seed has 25).
  const filler = Array.from({ length: 35 }, (_, i) => ({
    name: `Cap Filler ${i + 1}`,
    email: `filler${i + 1}@cap.example`,
  }));
  await sql`INSERT INTO clients ${sql(filler)}`;

  try {
    await logInAsDemo(page);
    await page.goto("/clients/new");
    await page.getByLabel("Name", { exact: true }).fill("One Too Many");
    await page.getByLabel("Billing email").fill("too@many.example");
    await page.getByRole("button", { name: "Add client" }).click();

    await expect(page.getByText(/The demo holds up to 60 clients/).first()).toBeVisible();
    await expect(page).toHaveURL(/\/clients\/new$/);
  } finally {
    await sql`DELETE FROM clients WHERE email LIKE '%@cap.example'`;
  }
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM clients WHERE name = 'One Too Many'`;
  expect(n).toBe(0);
});
