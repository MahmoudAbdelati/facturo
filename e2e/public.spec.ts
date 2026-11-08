import { expect, test } from "@playwright/test";

test("the landing page offers the demo", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Facturo/);
  await expect(page.getByRole("button", { name: "Try the demo" }).first()).toBeVisible();
});

test("app pages send signed-out visitors to the login page", async ({ page }) => {
  await page.goto("/invoices");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByLabel("Email")).toBeVisible();
});

test("unknown pages get the branded 404", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
});
