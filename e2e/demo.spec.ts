import { expect, test } from "@playwright/test";
import { logInAsDemo } from "./helpers";

test("Try the demo opens a populated workspace", async ({ page }) => {
  await logInAsDemo(page);
  await expect(page.getByText("Demo · resets nightly")).toBeVisible();

  await page.getByRole("link", { name: "Invoices" }).first().click();
  await expect(page).toHaveURL(/\/invoices$/);
  await expect(page.locator("p", { hasText: /Showing 1–10 of 150/ })).toBeVisible();

  await page.getByRole("link", { name: "Clients" }).first().click();
  await expect(page).toHaveURL(/\/clients$/);
  await expect(page.getByRole("link", { name: "Maya Lindqvist" }).first()).toBeVisible();
});
