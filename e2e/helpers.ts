import { expect, type Page } from "@playwright/test";

/** Signs in through "Try the demo" on the login page and waits for the overview. */
export async function logInAsDemo(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Explore the demo workspace" }).click();
  await expect(page).toHaveURL(/\/overview$/);
  await expect(page.getByRole("heading", { level: 1, name: "Welcome back, Alex" })).toBeVisible();
}
