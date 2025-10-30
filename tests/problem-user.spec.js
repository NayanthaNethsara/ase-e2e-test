import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.saucedemo.com/v1/index.html";
const USERNAME = "problem_user";
const PASSWORD = process.env.SAUCE_PASSWORD || "secret_sauce";

test.describe("Problem User - Has UI/UX Issues (Expected Failures)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator("#user-name").fill(USERNAME);
    await page.locator("#password").fill(PASSWORD);
    await Promise.all([
      page.waitForNavigation({ url: /inventory.html/ }),
      page.locator("#login-button").click(),
    ]);
  });

  test("should login successfully (login works)", async ({ page }) => {
    await expect(page).toHaveURL(/inventory.html/);
    await expect(page.locator(".inventory_list")).toBeVisible();
  });

  test("should display products but images may be broken", async ({
    page,
  }, testInfo) => {
    const products = page.locator(".inventory_item");
    await expect(products).toHaveCount(6);

    // Document the UI issues
    const screenshot = testInfo.outputPath("problem-user-inventory.png");
    await page.screenshot({ path: screenshot, fullPage: true });
    testInfo.attach("problem-user-ui", {
      path: screenshot,
      contentType: "image/png",
    });
  });

  test("sorting may not work correctly (EXPECTED TO FAIL)", async ({
    page,
  }) => {
    // Problem user often has sorting issues
    await page.selectOption(".product_sort_container", "az");
    const productNames = await page
      .locator(".inventory_item_name")
      .allTextContents();
    const sortedNames = [...productNames].sort();

    // This test is expected to fail for problem_user
    // The products may not be in the correct order
    expect(productNames).toEqual(sortedNames);
  });

  test("add to cart button may have issues", async ({ page }) => {
    // Try to add item to cart
    await page.locator(".inventory_item button").first().click();

    // Cart badge should appear, but might not work correctly for problem user
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
  });

  test("product images should exist but may show wrong image", async ({
    page,
  }) => {
    const firstImage = page.locator(".inventory_item_img").first();
    await expect(firstImage).toBeVisible();

    // Image exists but may be incorrect for problem_user
    const imgSrc = await firstImage.getAttribute("src");
    expect(imgSrc).toBeTruthy();
  });

  test("cart functionality may be broken (EXPECTED TO FAIL)", async ({
    page,
  }) => {
    // Add item
    await page.locator(".inventory_item button").first().click();
    await page.locator(".shopping_cart_link").click();

    // Cart page should load
    await expect(page).toHaveURL(/cart.html/);

    // Items in cart may not match what was added
    const cartItems = page.locator(".cart_item");
    await expect(cartItems).toHaveCount(1);
  });

  test("checkout flow may have issues", async ({ page }) => {
    // Add item and go to cart
    await page.locator(".inventory_item button").first().click();
    await page.locator(".shopping_cart_link").click();

    // Try checkout
    await page.locator(".checkout_button").click();

    // Form should appear
    await expect(page).toHaveURL(/checkout-step-one.html/);

    // Try to fill form - may have issues
    await page.locator('[data-test="firstName"]').fill("John");
    await page.locator('[data-test="lastName"]').fill("Doe");
    await page.locator('[data-test="postalCode"]').fill("12345");

    // Last name field might not work correctly for problem_user
    const lastNameValue = await page
      .locator('[data-test="lastName"]')
      .inputValue();
    expect(lastNameValue).toBe("Doe");
  });

  test("burger menu should work", async ({ page }) => {
    await page.locator(".bm-burger-button").click();
    await expect(page.locator(".bm-menu")).toBeVisible();
  });

  test("logout should work", async ({ page }) => {
    await page.locator(".bm-burger-button").click();
    await page.locator("#logout_sidebar_link").click();
    await expect(page).toHaveURL(BASE_URL);
  });
});
