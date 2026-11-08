import { expect, test } from "@playwright/test";
import { logInAsDemo } from "./helpers";

const resetPath = "/api/cron/reset-demo";

test("the reset route refuses calls without the cron secret", async ({ request }) => {
  expect((await request.get(resetPath)).status()).toBe(401);
  const wrong = await request.get(resetPath, { headers: { authorization: "Bearer nope" } });
  expect(wrong.status()).toBe(401);
});

test("the nightly reset puts the demo back after a visitor's changes", async ({ page, request }) => {
  await logInAsDemo(page);

  // A visitor renames the demo user.
  await page.goto("/settings");
  await page.getByLabel("Your name", { exact: true }).fill("Someone Else");
  await page.getByRole("button", { name: "Save" }).first().click();
  await expect(page.getByText("Someone Else").first()).toBeVisible();

  const response = await request.get(resetPath, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ ok: true, clients: 25, invoices: 150 });

  // The same session still works and sees the seeded workspace again.
  await page.goto("/overview");
  await expect(page.getByRole("heading", { level: 1, name: "Welcome back, Alex" })).toBeVisible();
});
