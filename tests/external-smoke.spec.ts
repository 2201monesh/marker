import { test, expect } from "@playwright/test";

const externalUrls = [
  "https://info.onmarker.com/book-a-demo",
];

for (const url of externalUrls) {
  test(`${url} responds successfully`, async ({ request }) => {
    let lastStatus = 0;

    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 2000));
      const response = await request.get(url);
      lastStatus = response.status();
      if (lastStatus < 400) return;
    }

    expect(lastStatus, `${url} returned ${lastStatus} after retries`).toBeLessThan(400);
  });
}
