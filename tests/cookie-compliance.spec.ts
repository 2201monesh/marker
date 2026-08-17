import { test, expect } from "@playwright/test";

// Pages that use the standard layout with footer (excludes standalone pages like /tradeshow)
const pages = ["/", "/privacy", "/terms", "/cookies", "/team"];

test("footer has Cookie Policy link on every page", async ({ page }) => {
  for (const path of pages) {
    await page.goto(path);
    const link = page.locator('footer a[href="/cookies"]');
    await expect(link, `Missing Cookie Policy link on ${path}`).toBeVisible();
  }
});

test("footer has Manage Cookies link with preference modal on every page", async ({
  page,
}) => {
  for (const path of pages) {
    await page.goto(path);
    const link = page.getByRole("link", { name: "Manage Cookies" });
    await expect(link, `Missing Manage Cookies link on ${path}`).toBeVisible();
    const onclick = await link.getAttribute("onclick");
    expect(
      onclick,
      `Manage Cookies onclick missing displayPreferenceModal on ${path}`
    ).toContain("displayPreferenceModal");
  }
});

test("footer has Privacy Policy link on every page", async ({ page }) => {
  for (const path of pages) {
    await page.goto(path);
    const link = page.locator('footer a[href="/privacy"]');
    await expect(link, `Missing Privacy Policy link on ${path}`).toBeVisible();
  }
});

test("footer has Do Not Sell link on every page", async ({ page }) => {
  for (const path of pages) {
    await page.goto(path);
    const link = page.getByRole("link", {
      name: "Do Not Sell My Personal Information",
    });
    await expect(link, `Missing Do Not Sell link on ${path}`).toBeVisible();
  }
});

test("Termly consent script is present in page", async ({ page }) => {
  await page.goto("/");
  const termlyScript = page.locator(
    'script[src*="app.termly.io/resource-blocker"][src*="autoBlock"]'
  );
  await expect(termlyScript).toBeAttached();
});

test("cookie policy page loads successfully", async ({ page }) => {
  const response = await page.goto("/cookies");
  expect(response?.status()).toBe(200);
  // The Termly content ships its own (CSS-hidden) inline <h1>, so query by
  // role, which only matches visible headings.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
