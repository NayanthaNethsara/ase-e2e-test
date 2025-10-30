import { test, expect } from "@playwright/test";

test.describe("Example.com smoke tests", () => {
  test.beforeEach(async ({ page }) => {
    // Start each test from the same baseline URL
    await page.goto("https://example.com");
  });

  test("homepage has correct title and heading", async ({ page }) => {
    await expect(page).toHaveTitle(/Example Domain/);
    const h1 = page.locator("h1");
    await expect(h1).toHaveText("Example Domain");
  });

  test("more information link navigates to IANA", async ({ page }) => {
    // Locate by href pattern (robust across content changes)
    const moreInfo = page.locator('a[href*="iana.org"]');
    await expect(moreInfo).toHaveAttribute("href", /iana.org/);

    // The link may open in a new tab — handle popup if it does, otherwise navigate
    // Wait briefly for a popup; if none appears, assume same-page navigation.
    const popupPromise = page
      .waitForEvent("popup", { timeout: 3000 })
      .catch(() => null);
    await moreInfo.click();
    const newPage = await popupPromise;
    const target = newPage ?? page;
    // Wait for the main heading to be visible instead of waiting for full load — more robust across redirects
    await target.locator("h1").waitFor({ state: "visible", timeout: 10000 });

    if (newPage) {
      await expect(newPage).toHaveURL(/iana.org/);
      await expect(newPage.locator("h1")).toContainText("Example Domains");
    } else {
      // navigation happened in the same page
      await expect(page).toHaveURL(/iana.org/);
      await expect(page.locator("h1")).toContainText("Example Domains");
    }
  });

  test("takes a screenshot for visual inspection", async ({
    page,
  }, testInfo) => {
    const shotPath = testInfo.outputPath(
      `screenshot-${testInfo.title.replace(/\s+/g, "-")}.png`
    );
    await page.screenshot({ path: shotPath, fullPage: true });
    testInfo.attachments ||= [];
    testInfo.attachments.push({
      name: "homepage-screenshot",
      path: shotPath,
      contentType: "image/png",
    });
  });
});
