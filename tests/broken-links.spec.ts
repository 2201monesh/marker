import { test, expect } from "@playwright/test";

const pages = ["/", "/privacy", "/terms", "/cookies", "/team", "/tradeshow"];

test("all internal links resolve to non-404 pages", async ({ page }) => {
  const internalPaths = new Set<string>();

  for (const path of pages) {
    await page.goto(path);
    const hrefs = await page.locator("a[href]").evaluateAll((anchors) =>
      anchors.map((a) => a.getAttribute("href")).filter(Boolean)
    );

    for (const href of hrefs) {
      if (!href) continue;
      // Only check internal links (relative or same-origin)
      if (href.startsWith("/") && !href.startsWith("//")) {
        internalPaths.add(href);
      }
    }
  }

  const broken: string[] = [];

  for (const path of internalPaths) {
    const response = await page.goto(path);
    if (!response || response.status() === 404) {
      broken.push(path);
    }
  }

  expect(broken, `Broken internal links: ${broken.join(", ")}`).toEqual([]);
});
