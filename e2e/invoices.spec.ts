import { expect, test } from "@playwright/test";
import { logInAsDemo } from "./helpers";

test("create an invoice, then delete it", async ({ page }) => {
  await logInAsDemo(page);
  await page.goto("/invoices/new");
  await expect(page.getByRole("heading", { level: 1, name: "New invoice" })).toBeVisible();

  await page.getByLabel("Client", { exact: true }).selectOption({ label: "Maya Lindqvist" });
  await page.getByRole("textbox", { name: "Description" }).first().fill("E2E smoke test – logo refresh");
  await page.getByRole("textbox", { name: "Qty" }).first().fill("2");
  await page.getByRole("textbox", { name: "Unit price" }).first().fill("450");
  await page.getByRole("button", { name: "Create invoice" }).click();

  // Saving opens the new invoice's page, titled with its number.
  await expect(page).toHaveURL(/\/invoices\/[0-9a-f-]{36}$/);
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toHaveText(/^INV-\d{4}-\d{4}$/);
  const number = (await heading.textContent())!;
  await expect(page.getByText("E2E smoke test – logo refresh")).toBeVisible();
  await expect(page.getByText("$900.00").first()).toBeVisible();

  // It's a draft; open the menu and delete it.
  await page.getByRole("button", { name: `More actions for ${number}` }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Delete invoice" }).click();
  await expect(page.getByText(`${number} deleted`)).toBeVisible();
  await expect(page).toHaveURL(/\/invoices$/);
});

test("the invoice form explains what's missing", async ({ page }) => {
  await logInAsDemo(page);
  await page.goto("/invoices/new");
  await page.getByRole("button", { name: "Create invoice" }).click();
  await expect(page.getByText("Some fields need attention.").first()).toBeVisible();
  await expect(page).toHaveURL(/\/invoices\/new$/);
});
