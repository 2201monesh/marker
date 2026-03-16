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

test("book demo submits and opens the scheduling page", async ({
  page,
}) => {
  await page.goto("/book-demo");

  await page.getByLabel("First name").fill("Will");
  await page.getByLabel("Last name").fill("Drevno");
  await page.getByLabel("Work email").fill("will@onmarker.com");
  await page.getByLabel("Phone number").fill("5555555555");
  await page.getByLabel("What would make this call most useful for you?").fill(
    "Just learning"
  );

  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "See available times" }).click();
  const popup = await popupPromise;

  await expect
    .poll(() => popup.url(), { timeout: 10_000 })
    .toContain("https://meetings-na2.hubspot.com/will-drevno/book-demo");

  await expect(
    page.getByRole("button", { name: "Open booking page again" })
  ).toBeVisible();
  await expect(page.getByText("Your info was submitted.")).toBeVisible();
});

test("newsletter signup shows a success message", async ({ page }) => {
  await page.goto("/");

  const newsletter = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Stay in the loop" }),
  });

  await newsletter.scrollIntoViewIfNeeded();
  await expect(newsletter.getByRole("button", { name: "Subscribe" })).toBeVisible();
  await page.waitForTimeout(500);

  await newsletter.getByPlaceholder("you@company.com").fill("ops@company.com");
  await newsletter.getByRole("button", { name: "Subscribe" }).click();

  await expect(
    newsletter.getByText("You're on the list. We'll be in touch!")
  ).toBeVisible();
});
