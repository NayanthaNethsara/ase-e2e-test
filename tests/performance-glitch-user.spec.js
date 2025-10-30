import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.saucedemo.com/v1/index.html";
const USERNAME = "performance_glitch_user";
const PASSWORD = process.env.SAUCE_PASSWORD || "secret_sauce";

test.describe("Performance Glitch User - Slow Performance (Tests Will Take Longer)", () => {
  // Increase timeout for this user type
  test.setTimeout(120000); // 2 minutes per test

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator("#user-name").fill(USERNAME);
    await page.locator("#password").fill(PASSWORD);
  });

  test("should login but take significantly longer", async ({ page }) => {
    const startTime = Date.now();

    await Promise.all([
      page.waitForNavigation({ url: /inventory.html/, timeout: 60000 }),
      page.locator("#login-button").click(),
    ]);

    const duration = Date.now() - startTime;

    await expect(page).toHaveURL(/inventory.html/);
    await expect(page.locator(".inventory_list")).toBeVisible();

    // Performance glitch user typically takes 4-5 seconds longer
    console.log(`Login took ${duration}ms (expected to be slow)`);
    expect(duration).toBeGreaterThan(3000); // Should take more than 3 seconds
  });

  test("should display all products with delay", async ({ page }) => {
    await Promise.all([
      page.waitForNavigation({ url: /inventory.html/, timeout: 60000 }),
      page.locator("#login-button").click(),
    ]);

    const products = page.locator(".inventory_item");
    await expect(products).toHaveCount(6);
  });

  test("should add items to cart slowly", async ({ page }) => {
    await Promise.all([
      page.waitForNavigation({ url: /inventory.html/, timeout: 60000 }),
      page.locator("#login-button").click(),
    ]);

    const startTime = Date.now();
    await page.locator(".inventory_item button").first().click();
    const duration = Date.now() - startTime;

    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
    console.log(`Add to cart took ${duration}ms`);
  });

  test("sorting should work but be slow", async ({ page }) => {
    await Promise.all([
      page.waitForNavigation({ url: /inventory.html/, timeout: 60000 }),
      page.locator("#login-button").click(),
    ]);

    await page.selectOption(".product_sort_container", "lohi");

    const prices = await page
      .locator(".inventory_item_price")
      .allTextContents();
    const numericPrices = prices.map((p) => parseFloat(p.replace("$", "")));
    const sortedPrices = [...numericPrices].sort((a, b) => a - b);
    expect(numericPrices).toEqual(sortedPrices);
  });

  test("checkout flow should complete despite performance issues", async ({
    page,
  }) => {
    await Promise.all([
      page.waitForNavigation({ url: /inventory.html/, timeout: 60000 }),
      page.locator("#login-button").click(),
    ]);

    // Add item
    await page.locator(".inventory_item button").first().click();
    await page.locator(".shopping_cart_link").click();

    // Checkout
    await page.locator(".checkout_button").click();
    await page.locator('[data-test="firstName"]').fill("Jane");
    await page.locator('[data-test="lastName"]').fill("Smith");
    await page.locator('[data-test="postalCode"]').fill("90210");
    await page.locator('[data-test="continue"]').click();

    await expect(page).toHaveURL(/checkout-step-two.html/);

    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/checkout-complete.html/);
    await expect(page.locator(".complete-header")).toContainText(
      "THANK YOU FOR YOUR ORDER"
    );
  });

  test("navigation should work but be sluggish", async ({ page }) => {
    await Promise.all([
      page.waitForNavigation({ url: /inventory.html/, timeout: 60000 }),
      page.locator("#login-button").click(),
    ]);

    await page.locator(".bm-burger-button").click();
    await expect(page.locator(".bm-menu")).toBeVisible();

    await page.locator("#logout_sidebar_link").click();
    await expect(page).toHaveURL(BASE_URL);
  });

  test("performance comparison - measure page load time", async ({ page }) => {
    const startTime = Date.now();

    await Promise.all([
      page.waitForNavigation({ url: /inventory.html/, timeout: 60000 }),
      page.locator("#login-button").click(),
    ]);

    await page.waitForLoadState("networkidle", { timeout: 60000 });
    const totalDuration = Date.now() - startTime;

    console.log(`Total page load: ${totalDuration}ms`);

    // Performance glitch user should take 5+ seconds
    expect(totalDuration).toBeGreaterThan(5000);
  });
});
