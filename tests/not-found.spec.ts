import { test, expect } from "@playwright/test";

test("unknown routes return the custom 404 page", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "This page doesn't exist." })).toBeVisible();

  const homeLink = page.getByRole("link", { name: "Return Home" });
  await expect(homeLink).toHaveAttribute("href", "/");
});
