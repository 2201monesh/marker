import { test, expect } from "@playwright/test";
import zlib from "zlib";
import type { Request } from "@playwright/test";

let hubspotCalls: { url: string; body: unknown }[] = [];
let amplitudeEvents: Record<string, unknown>[] = [];

// Amplitude's browser SDK gzip-compresses its HTTP API request bodies by
// default, so `request.postDataJSON()` can't parse them directly (it throws
// on the raw compressed bytes). Decode based on Content-Encoding before
// parsing, falling back to uncompressed for safety if that ever changes.
async function readJsonBody(request: Request): Promise<unknown> {
  const buf = request.postDataBuffer();
  if (!buf) return undefined;
  const encoding = (await request.allHeaders())["content-encoding"];
  const raw = encoding === "gzip" ? zlib.gunzipSync(buf) : buf;
  return JSON.parse(raw.toString("utf-8"));
}

test.beforeEach(async ({ page }) => {
  hubspotCalls = [];
  amplitudeEvents = [];

  // Intercept HubSpot form submissions
  await page.route(
    "https://api.hsforms.com/submissions/v3/integration/submit/**",
    async (route) => {
      hubspotCalls.push({
        url: route.request().url(),
        body: route.request().postDataJSON(),
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ inlineMessage: "ok" }),
      });
    }
  );

  // Intercept Amplitude event uploads
  await page.route("https://api2.amplitude.com/**", async (route) => {
    try {
      const body = (await readJsonBody(route.request())) as
        | { events?: Record<string, unknown>[] }
        | undefined;
      if (body?.events) {
        amplitudeEvents.push(...body.events);
      }
    } catch {
      // Some Amplitude requests may not be JSON
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ code: 200 }),
    });
  });

  // Block Termly's resource blocker so it doesn't prevent analytics scripts
  // from loading (no cookie consent in test environment)
  await page.route("**/app.termly.io/**", async (route) => {
    await route.fulfill({ status: 200, body: "" });
  });

  // Let the Amplitude CDN script and HubSpot script load from real servers
  // but intercept their reporting endpoints
  await page.route("https://regionconfig.amplitude.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });
});

test("Amplitude and HubSpot scripts load on the page", async ({ page }) => {
  await page.goto("/");

  // Wait for Amplitude to be available (script loads async from CDN)
  await page.waitForFunction(() => !!window.amplitude, { timeout: 15000 });

  // Wait for HubSpot script element to be injected
  await page.waitForFunction(
    () => !!document.getElementById("hs-script-loader"),
    { timeout: 15000 }
  );
});

test("newsletter form fires HubSpot submission and Amplitude identify", async ({
  page,
}) => {
  // The newsletter form lives on the archived old home page (/old); the
  // launched landing page at / has no newsletter form.
  await page.goto("/old/");

  // Wait for Amplitude to initialize
  await page.waitForFunction(() => !!window.amplitude, { timeout: 15000 });

  const emailInput = page.getByPlaceholder("you@company.com");
  const subscribeButton = page.getByRole("button", { name: "Subscribe" });

  await emailInput.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const input = document.querySelector(
      'input[placeholder="you@company.com"]'
    );
    const island = input?.closest("astro-island");
    return island instanceof HTMLElement && !island.hasAttribute("ssr");
  });

  await emailInput.fill("test@example.com");
  await subscribeButton.click();

  // Verify success message appears
  await expect(
    page.getByText("You're on the list. We'll be in touch!")
  ).toBeVisible();

  // Verify HubSpot received the form submission with the email
  expect(hubspotCalls.length).toBeGreaterThan(0);
  const hsFields = hubspotCalls[0].body as {
    fields: { name: string; value: string }[];
  };
  expect(hsFields.fields).toContainEqual(
    expect.objectContaining({ name: "email", value: "test@example.com" })
  );

  // Wait for Amplitude to flush events
  await page.waitForTimeout(3000);

  // Verify Amplitude received a "Newsletter Subscribed" event with the user identified
  expect(
    amplitudeEvents.some(
      (e) =>
        e.event_type === "Newsletter Subscribed" &&
        e.user_id === "test@example.com"
    )
  ).toBe(true);
});

test("Manage Cookies link is present and calls displayPreferenceModal", async ({
  page,
}) => {
  await page.goto("/");

  const cookieLink = page.getByRole("link", { name: "Manage Cookies" });
  await expect(cookieLink).toBeVisible();

  // Verify the onclick handler references displayPreferenceModal
  const onclick = await cookieLink.getAttribute("onclick");
  expect(onclick).toContain("displayPreferenceModal");
});

test("Termly consent script is loaded", async ({ page }) => {
  await page.goto("/");

  // Verify the Termly resource blocker script tag is in the page
  const termlyScript = page.locator(
    'script[src*="app.termly.io/resource-blocker"]'
  );
  await expect(termlyScript).toBeAttached();
});

test("book-a-demo links include Amplitude cross-domain params", async ({
  page,
}) => {
  await page.goto("/");

  // Wait for Amplitude to fully initialize (deviceId available)
  await page.waitForFunction(
    () => window.amplitude && window.amplitude.getDeviceId(),
    { timeout: 15000 }
  );

  // Find a book-a-demo link
  const demoLink = page.locator('a[href*="info.onmarker.com"]').first();
  await expect(demoLink).toBeVisible();

  // Prevent navigation away from the page when the link is clicked
  await page.evaluate(() => {
    document.querySelectorAll('a[href*="info.onmarker.com"]').forEach((el) => {
      el.addEventListener(
        "click",
        (e) => e.preventDefault(),
        { capture: false } // runs after our cross-domain handler
      );
    });
  });

  // Use Playwright's real click so the event target and bubbling work correctly
  await demoLink.click();

  // Read the href after our cross-domain handler modified it
  const href = await demoLink.getAttribute("href");
  expect(href).toContain("ampDeviceId=");
  expect(href).toContain("ampSessionId=");
  expect(href).toContain("ampTimestamp=");
});
