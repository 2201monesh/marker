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
      // Only check internal links (relative or same-origin), strip fragments
      if (href.startsWith("/") && !href.startsWith("//")) {
        const pathOnly = href.split("#")[0];
        if (pathOnly) internalPaths.add(pathOnly);
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

test("all anchor links point to existing elements", async ({ page }) => {
  // Collect links with fragments: { page: "/privacy", fragment: "privacyrights", full: "/privacy#privacyrights" }
  const anchorLinks: { pagePath: string; fragment: string; full: string }[] = [];

  for (const path of pages) {
    await page.goto(path);
    const hrefs = await page.locator("a[href]").evaluateAll((anchors) =>
      anchors.map((a) => a.getAttribute("href")).filter(Boolean)
    );

    for (const href of hrefs) {
      if (!href) continue;
      if (!href.startsWith("/") || href.startsWith("//")) continue;
      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) continue;
      const fragment = href.slice(hashIndex + 1);
      if (!fragment) continue;
      const pagePath = href.slice(0, hashIndex) || path;
      anchorLinks.push({ pagePath, fragment, full: href });
    }
  }

  const broken: string[] = [];
  // Deduplicate by full href
  const seen = new Set<string>();

  for (const link of anchorLinks) {
    if (seen.has(link.full)) continue;
    seen.add(link.full);

    await page.goto(link.pagePath);
    const exists = await page.evaluate(
      (id) => !!document.getElementById(id),
      link.fragment
    );
    if (!exists) {
      broken.push(link.full);
    }
  }

  expect(broken, `Anchor links with missing targets: ${broken.join(", ")}`).toEqual([]);
});
