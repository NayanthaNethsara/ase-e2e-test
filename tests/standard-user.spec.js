import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.saucedemo.com/v1/index.html";
const USERNAME = "standard_user";
const PASSWORD = process.env.SAUCE_PASSWORD || "secret_sauce";

test.describe("Standard User - All Features Should Work", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator("#user-name").fill(USERNAME);
    await page.locator("#password").fill(PASSWORD);
    await Promise.all([
      page.waitForNavigation({ url: /inventory.html/ }),
      page.locator("#login-button").click(),
    ]);
  });

  test("should login successfully", async ({ page }) => {
    await expect(page).toHaveURL(/inventory.html/);
    await expect(page.locator(".inventory_list")).toBeVisible();
  });

  test("should display all 6 products", async ({ page }) => {
    const products = page.locator(".inventory_item");
    await expect(products).toHaveCount(6);
  });

  test("should sort products by name A-Z", async ({ page }) => {
    await page.selectOption(".product_sort_container", "az");
    const productNames = await page
      .locator(".inventory_item_name")
      .allTextContents();
    const sortedNames = [...productNames].sort();
    expect(productNames).toEqual(sortedNames);
  });

  test("should sort products by name Z-A", async ({ page }) => {
    await page.selectOption(".product_sort_container", "za");
    const productNames = await page
      .locator(".inventory_item_name")
      .allTextContents();
    const sortedNames = [...productNames].sort().reverse();
    expect(productNames).toEqual(sortedNames);
  });

  test("should sort products by price low to high", async ({ page }) => {
    await page.selectOption(".product_sort_container", "lohi");
    const prices = await page
      .locator(".inventory_item_price")
      .allTextContents();
    const numericPrices = prices.map((p) => parseFloat(p.replace("$", "")));
    const sortedPrices = [...numericPrices].sort((a, b) => a - b);
    expect(numericPrices).toEqual(sortedPrices);
  });

  test("should sort products by price high to low", async ({ page }) => {
    await page.selectOption(".product_sort_container", "hilo");
    const prices = await page
      .locator(".inventory_item_price")
      .allTextContents();
    const numericPrices = prices.map((p) => parseFloat(p.replace("$", "")));
    const sortedPrices = [...numericPrices].sort((a, b) => b - a);
    expect(numericPrices).toEqual(sortedPrices);
  });

  test("should add single item to cart", async ({ page }) => {
    await page.locator(".inventory_item button").first().click();
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
  });

  test("should add multiple items to cart", async ({ page }) => {
    const addButtons = page.locator(".inventory_item button");
    await addButtons.nth(0).click();
    await addButtons.nth(1).click();
    await addButtons.nth(2).click();
    await expect(page.locator(".shopping_cart_badge")).toHaveText("3");
  });

  test("should remove item from cart", async ({ page }) => {
    await page.locator(".inventory_item button").first().click();
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
    await page
      .locator('.inventory_item button:has-text("REMOVE")')
      .first()
      .click();
    await expect(page.locator(".shopping_cart_badge")).not.toBeVisible();
  });

  test("should navigate to product details", async ({ page }) => {
    const firstProductName = await page
      .locator(".inventory_item_name")
      .first()
      .textContent();
    await page.locator(".inventory_item_name").first().click();
    await page.waitForURL(/inventory-item.html/);
    await expect(page.locator(".inventory_details_name")).toContainText(
      firstProductName
    );
  });

  test("should complete full checkout", async ({ page }) => {
    // Add item
    await page.locator(".inventory_item button").first().click();
    await page.locator(".shopping_cart_link").click();

    // Checkout
    await page.locator(".checkout_button").click();
    await page.locator('[data-test="firstName"]').fill("John");
    await page.locator('[data-test="lastName"]').fill("Doe");
    await page.locator('[data-test="postalCode"]').fill("12345");
    await page.locator('[data-test="continue"]').click();

    // Verify overview
    await expect(page).toHaveURL(/checkout-step-two.html/);
    await expect(page.locator(".summary_subtotal_label")).toBeVisible();

    // Finish
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/checkout-complete.html/);
    await expect(page.locator(".complete-header")).toContainText(
      "THANK YOU FOR YOUR ORDER"
    );
  });

  test("should open and close burger menu", async ({ page }) => {
    await page.locator(".bm-burger-button").click();
    await expect(page.locator(".bm-menu")).toBeVisible();
    await page.locator(".bm-cross-button").click();
    await page.waitForTimeout(500);
    await expect(page.locator(".bm-menu")).toHaveCSS(
      "transform",
      "matrix(1, 0, 0, 1, -500, 0)"
    );
  });

  test("should logout successfully", async ({ page }) => {
    await page.locator(".bm-burger-button").click();
    await page.locator("#logout_sidebar_link").click();
    await expect(page).toHaveURL(BASE_URL);
    await expect(page.locator(".login_logo")).toBeVisible();
  });

  test("should reset app state", async ({ page }) => {
    await page.locator(".inventory_item button").first().click();
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
    await page.locator(".bm-burger-button").click();
    await page.locator("#reset_sidebar_link").click();
    await expect(page.locator(".shopping_cart_badge")).not.toBeVisible();
  });
});
