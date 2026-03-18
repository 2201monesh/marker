import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route(
    "https://api.hsforms.com/submissions/v3/integration/submit/**",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ inlineMessage: "ok" }),
      });
    }
  );
});

test("newsletter signup shows a success message", async ({ page }) => {
  await page.goto("/");

  const emailInput = page.getByPlaceholder("you@company.com");
  const subscribeButton = page.getByRole("button", { name: "Subscribe" });

  await emailInput.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const input = document.querySelector('input[placeholder="you@company.com"]');
    const island = input?.closest("astro-island");
    return island instanceof HTMLElement && !island.hasAttribute("ssr");
  });
  await expect(subscribeButton).toBeVisible();

  await emailInput.fill("ops@company.com");
  await subscribeButton.click();

  await expect(page.getByText("You're on the list. We'll be in touch!")).toBeVisible();
});
