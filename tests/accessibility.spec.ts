import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = ["/", "/privacy", "/terms"];

for (const path of pages) {
  test(`${path} should have no accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .exclude(".hero-gantt-wrap")
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
