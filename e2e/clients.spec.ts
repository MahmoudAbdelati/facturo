import { expect, test } from "@playwright/test";
import { logInAsDemo } from "./helpers";

test("add, edit and delete a client", async ({ page }) => {
  await logInAsDemo(page);
  await page.goto("/clients/new");

  await page.getByLabel("Name", { exact: true }).fill("Robin Ellis");
  await page.getByLabel("Company").fill("Ellis & Co.");
  await page.getByLabel("Billing email").fill("robin@ellis.example");
  await page.getByRole("button", { name: "Add client" }).click();

  await expect(page).toHaveURL(/\/clients\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { level: 1, name: "Robin Ellis" })).toBeVisible();
  const clientUrl = page.url();

  await page.goto(`${clientUrl}/edit`);
  await page.getByLabel("Company").fill("Ellis Studio");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page).toHaveURL(clientUrl);
  await expect(page.getByText("Ellis Studio").first()).toBeVisible();

  await page.getByRole("button", { name: "More actions for Robin Ellis" }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Delete client" }).click();
  await expect(page).toHaveURL(/\/clients$/);
  await expect(page.getByRole("link", { name: "Robin Ellis" })).toHaveCount(0);
});
