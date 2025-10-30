import { test, expect } from "@playwright/test";

test.describe("SauceDemo purchase flow", () => {
  const BASE = "https://www.saucedemo.com/v1/index.html";
  const USERNAME = process.env.SAUCE_USERNAME || "standard_user";
  const PASSWORD = process.env.SAUCE_PASSWORD || "secret_sauce";

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
  });

  test("login, add item to cart, checkout and finish", async ({
    page,
  }, testInfo) => {
    // Login
    await page.locator("#user-name").fill(USERNAME);
    await page.locator("#password").fill(PASSWORD);
    await Promise.all([
      page.waitForNavigation({ url: /inventory.html/ }),
      page.locator("#login-button").click(),
    ]);

    await expect(page).toHaveURL(/inventory.html/);
    await expect(page.locator(".inventory_list")).toBeVisible();

    // Add the first product to cart
    const firstAdd = page.locator(".inventory_item button").first();
    await firstAdd.click();

    // Verify cart badge shows 1
    const cartBadge = page.locator(".shopping_cart_badge");
    await expect(cartBadge).toHaveText("1");

    // Go to cart
    await Promise.all([
      page.waitForNavigation({ url: /cart.html/ }),
      page.locator("a.shopping_cart_link").click(),
    ]);

    await expect(page).toHaveURL(/cart.html/);
    await expect(page.locator(".cart_item")).toHaveCount(1);

    // Checkout: try a hierarchy of selectors to be robust across versions
    const checkoutSelectors = [
      'button[data-test="checkout"]',
      "button#checkout",
      'button:has-text("Checkout")',
      "text=Checkout",
      'a:has-text("Checkout")',
      'input[value="Checkout"]',
    ];

    let clicked = false;
    for (const sel of checkoutSelectors) {
      const loc = page.locator(sel).first();
      if ((await loc.count()) > 0) {
        try {
          await Promise.all([
            page
              .waitForNavigation({ url: /checkout-step-one.html/ })
              .catch(() => null),
            loc.click({ timeout: 5000 }),
          ]);
          clicked = true;
          break;
        } catch (e) {
          // continue to next selector
        }
      }
    }

    if (!clicked) {
      // Save a diagnostic screenshot and page HTML for debugging
      const dbgShot = testInfo.outputPath("saucedemo-cart-debug.png");
      await page.screenshot({ path: dbgShot, fullPage: true });
      testInfo.attachments ||= [];
      testInfo.attachments.push({
        name: "saucedemo-cart-debug",
        path: dbgShot,
        contentType: "image/png",
      });
      throw new Error(
        "Checkout button was not found on cart page. See attached screenshot"
      );
    }

    await expect(page).toHaveURL(/checkout-step-one.html/);
    await page.locator('[data-test="firstName"]').fill("Test");
    await page.locator('[data-test="lastName"]').fill("User");
    await page.locator('[data-test="postalCode"]').fill("12345");

    // Click Continue - be robust about the selector
    const continueSelectors = [
      'button[data-test="continue"]',
      "button#continue",
      'button:has-text("Continue")',
      "text=Continue",
      'input[value="Continue"]',
    ];
    let continued = false;
    for (const sel of continueSelectors) {
      const loc = page.locator(sel).first();
      if ((await loc.count()) > 0) {
        try {
          await Promise.all([
            page
              .waitForNavigation({ url: /checkout-step-two.html/ })
              .catch(() => null),
            loc.click({ timeout: 5000 }),
          ]);
          continued = true;
          break;
        } catch (e) {
          // try next
        }
      }
    }
    if (!continued) {
      const dbgShot = testInfo.outputPath("saucedemo-continue-debug.png");
      await page.screenshot({ path: dbgShot, fullPage: true });
      testInfo.attachments ||= [];
      testInfo.attachments.push({
        name: "saucedemo-continue-debug",
        path: dbgShot,
        contentType: "image/png",
      });
      throw new Error("Continue button not found on checkout-step-one page");
    }

    // Finish purchase - try robust selectors for the Finish control
    await expect(page.locator(".summary_info")).toBeVisible();
    const finishSelectors = [
      'button[data-test="finish"]',
      "button#finish",
      'button:has-text("Finish")',
      "text=Finish",
      'input[value="Finish"]',
    ];
    let finished = false;
    for (const sel of finishSelectors) {
      const loc = page.locator(sel).first();
      if ((await loc.count()) > 0) {
        try {
          await Promise.all([
            page
              .waitForNavigation({ url: /checkout-complete.html/ })
              .catch(() => null),
            loc.click({ timeout: 5000 }),
          ]);
          finished = true;
          break;
        } catch (e) {
          // try next
        }
      }
    }
    if (!finished) {
      const dbgShot = testInfo.outputPath("saucedemo-finish-debug.png");
      await page.screenshot({ path: dbgShot, fullPage: true });
      testInfo.attachments ||= [];
      testInfo.attachments.push({
        name: "saucedemo-finish-debug",
        path: dbgShot,
        contentType: "image/png",
      });
      throw new Error("Finish control not found on checkout-step-two page");
    }

    await expect(page).toHaveURL(/checkout-complete.html/);
    await expect(page.locator(".complete-header")).toContainText(
      "THANK YOU FOR YOUR ORDER"
    );

    // Attach a screenshot for debugging/records
    const shotPath = testInfo.outputPath("saucedemo-checkout.png");
    await page.screenshot({ path: shotPath, fullPage: true });
    testInfo.attachments ||= [];
    testInfo.attachments.push({
      name: "saucedemo-checkout",
      path: shotPath,
      contentType: "image/png",
    });
  });
});
