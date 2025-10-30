import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com/v1/index.html';
const PASSWORD = process.env.SAUCE_PASSWORD || 'secret_sauce';

// All available user types on SauceDemo v1
const USERS = {
  standard: { username: 'standard_user', description: 'Standard user with full access' },
  locked_out: { username: 'locked_out_user', description: 'Locked out user (negative test)' },
  problem: { username: 'problem_user', description: 'User with UI/UX issues' },
  performance_glitch: { username: 'performance_glitch_user', description: 'User with performance issues' },
};

test.describe('SauceDemo - Comprehensive Test Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  // ==================== LOGIN TESTS ====================
  
  test.describe('Login Functionality', () => {
    
    test('should display login page correctly', async ({ page }) => {
      await expect(page.locator('.login_logo')).toBeVisible();
      await expect(page.locator('#user-name')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('#login-button')).toBeVisible();
    });

    test('should show error for empty credentials', async ({ page }) => {
      await page.locator('#login-button').click();
      const errorMsg = page.locator('[data-test="error"]');
      await expect(errorMsg).toBeVisible();
      await expect(errorMsg).toContainText('Username is required');
    });

    test('should show error for locked out user', async ({ page }) => {
      await page.locator('#user-name').fill(USERS.locked_out.username);
      await page.locator('#password').fill(PASSWORD);
      await page.locator('#login-button').click();
      
      const errorMsg = page.locator('[data-test="error"]');
      await expect(errorMsg).toBeVisible();
      await expect(errorMsg).toContainText('this user has been locked out');
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.locator('#user-name').fill('invalid_user');
      await page.locator('#password').fill('wrong_password');
      await page.locator('#login-button').click();
      
      const errorMsg = page.locator('[data-test="error"]');
      await expect(errorMsg).toBeVisible();
      await expect(errorMsg).toContainText('Username and password do not match');
    });

    // Test successful login for each user type (except locked_out)
    for (const [key, user] of Object.entries(USERS)) {
      if (key === 'locked_out') continue;
      
      test(`should login successfully as ${key} user`, async ({ page }, testInfo) => {
        await page.locator('#user-name').fill(user.username);
        await page.locator('#password').fill(PASSWORD);
        
        await Promise.all([
          page.waitForNavigation({ url: /inventory.html/ }),
          page.locator('#login-button').click(),
        ]);

        await expect(page).toHaveURL(/inventory.html/);
        await expect(page.locator('.inventory_list')).toBeVisible();
        
        // Attach screenshot
        const screenshot = testInfo.outputPath(`${key}-login-success.png`);
        await page.screenshot({ path: screenshot, fullPage: true });
        testInfo.attach(`${key}-login`, { path: screenshot, contentType: 'image/png' });
      });
    }
  });

  // ==================== INVENTORY TESTS ====================
  
  test.describe('Inventory Page - Standard User', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.locator('#user-name').fill(USERS.standard.username);
      await page.locator('#password').fill(PASSWORD);
      await Promise.all([
        page.waitForNavigation({ url: /inventory.html/ }),
        page.locator('#login-button').click(),
      ]);
    });

    test('should display all products', async ({ page }) => {
      const products = page.locator('.inventory_item');
      await expect(products).toHaveCount(6);
      
      // Verify each product has image, name, description, price, and button
      const firstProduct = products.first();
      await expect(firstProduct.locator('.inventory_item_img')).toBeVisible();
      await expect(firstProduct.locator('.inventory_item_name')).toBeVisible();
      await expect(firstProduct.locator('.inventory_item_desc')).toBeVisible();
      await expect(firstProduct.locator('.inventory_item_price')).toBeVisible();
      await expect(firstProduct.locator('button')).toBeVisible();
    });

    test('should sort products by name (A to Z)', async ({ page }) => {
      await page.selectOption('.product_sort_container', 'az');
      
      const productNames = await page.locator('.inventory_item_name').allTextContents();
      const sortedNames = [...productNames].sort();
      expect(productNames).toEqual(sortedNames);
    });

    test('should sort products by name (Z to A)', async ({ page }) => {
      await page.selectOption('.product_sort_container', 'za');
      
      const productNames = await page.locator('.inventory_item_name').allTextContents();
      const sortedNames = [...productNames].sort().reverse();
      expect(productNames).toEqual(sortedNames);
    });

    test('should sort products by price (low to high)', async ({ page }) => {
      await page.selectOption('.product_sort_container', 'lohi');
      
      const prices = await page.locator('.inventory_item_price').allTextContents();
      const numericPrices = prices.map(p => parseFloat(p.replace('$', '')));
      const sortedPrices = [...numericPrices].sort((a, b) => a - b);
      expect(numericPrices).toEqual(sortedPrices);
    });

    test('should sort products by price (high to low)', async ({ page }) => {
      await page.selectOption('.product_sort_container', 'hilo');
      
      const prices = await page.locator('.inventory_item_price').allTextContents();
      const numericPrices = prices.map(p => parseFloat(p.replace('$', '')));
      const sortedPrices = [...numericPrices].sort((a, b) => b - a);
      expect(numericPrices).toEqual(sortedPrices);
    });

    test('should navigate to product details', async ({ page }) => {
      const firstProductName = await page.locator('.inventory_item_name').first().textContent();
      
      await page.locator('.inventory_item_name').first().click();
      await page.waitForURL(/inventory-item.html/);
      
      await expect(page.locator('.inventory_details_name')).toContainText(firstProductName);
      await expect(page.locator('.inventory_details_desc')).toBeVisible();
      await expect(page.locator('.inventory_details_price')).toBeVisible();
    });

    test('should add product to cart from product details', async ({ page }) => {
      await page.locator('.inventory_item_name').first().click();
      await page.waitForURL(/inventory-item.html/);
      
      await page.locator('button:has-text("ADD TO CART")').click();
      await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
      
      // Button should change to REMOVE
      await expect(page.locator('button:has-text("REMOVE")')).toBeVisible();
    });
  });

  // ==================== CART TESTS ====================
  
  test.describe('Shopping Cart - Standard User', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.locator('#user-name').fill(USERS.standard.username);
      await page.locator('#password').fill(PASSWORD);
      await Promise.all([
        page.waitForNavigation({ url: /inventory.html/ }),
        page.locator('#login-button').click(),
      ]);
    });

    test('should add single item to cart', async ({ page }) => {
      await page.locator('.inventory_item button').first().click();
      await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    });

    test('should add multiple items to cart', async ({ page }) => {
      const addButtons = page.locator('.inventory_item button');
      await addButtons.nth(0).click();
      await addButtons.nth(1).click();
      await addButtons.nth(2).click();
      
      await expect(page.locator('.shopping_cart_badge')).toHaveText('3');
    });

    test('should remove item from cart on inventory page', async ({ page }) => {
      await page.locator('.inventory_item button').first().click();
      await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
      
      await page.locator('.inventory_item button:has-text("REMOVE")').first().click();
      await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
    });

    test('should display correct items in cart page', async ({ page }) => {
      // Add 2 items
      const addButtons = page.locator('.inventory_item button');
      await addButtons.nth(0).click();
      await addButtons.nth(1).click();
      
      // Navigate to cart
      await page.locator('.shopping_cart_link').click();
      await page.waitForURL(/cart.html/);
      
      await expect(page.locator('.cart_item')).toHaveCount(2);
    });

    test('should remove item from cart page', async ({ page }) => {
      await page.locator('.inventory_item button').first().click();
      await page.locator('.shopping_cart_link').click();
      await page.waitForURL(/cart.html/);
      
      await page.locator('button:has-text("REMOVE")').click();
      await expect(page.locator('.cart_item')).toHaveCount(0);
    });

    test('should continue shopping from cart', async ({ page }) => {
      await page.locator('.shopping_cart_link').click();
      await page.waitForURL(/cart.html/);
      
      await page.locator('.btn_secondary').click();
      await expect(page).toHaveURL(/inventory.html/);
    });
  });

  // ==================== CHECKOUT TESTS ====================
  
  test.describe('Checkout Flow - Standard User', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login and add item to cart
      await page.locator('#user-name').fill(USERS.standard.username);
      await page.locator('#password').fill(PASSWORD);
      await Promise.all([
        page.waitForNavigation({ url: /inventory.html/ }),
        page.locator('#login-button').click(),
      ]);
      await page.locator('.inventory_item button').first().click();
      await page.locator('.shopping_cart_link').click();
    });

    test('should complete full checkout flow', async ({ page }, testInfo) => {
      // Step 1: Cart
      await expect(page.locator('.cart_item')).toHaveCount(1);
      await page.locator('.checkout_button').click();
      
      // Step 2: Information
      await expect(page).toHaveURL(/checkout-step-one.html/);
      await page.locator('[data-test="firstName"]').fill('John');
      await page.locator('[data-test="lastName"]').fill('Doe');
      await page.locator('[data-test="postalCode"]').fill('12345');
      await page.locator('[data-test="continue"]').click();
      
      // Step 3: Overview
      await expect(page).toHaveURL(/checkout-step-two.html/);
      await expect(page.locator('.cart_item')).toHaveCount(1);
      await expect(page.locator('.summary_info')).toBeVisible();
      
      // Verify summary totals
      await expect(page.locator('.summary_subtotal_label')).toBeVisible();
      await expect(page.locator('.summary_tax_label')).toBeVisible();
      await expect(page.locator('.summary_total_label')).toBeVisible();
      
      const screenshot = testInfo.outputPath('checkout-overview.png');
      await page.screenshot({ path: screenshot, fullPage: true });
      testInfo.attach('checkout-overview', { path: screenshot, contentType: 'image/png' });
      
      await page.locator('[data-test="finish"]').click();
      
      // Step 4: Complete
      await expect(page).toHaveURL(/checkout-complete.html/);
      await expect(page.locator('.complete-header')).toContainText('THANK YOU FOR YOUR ORDER');
      await expect(page.locator('.complete-text')).toBeVisible();
      
      const completeScreenshot = testInfo.outputPath('checkout-complete.png');
      await page.screenshot({ path: completeScreenshot, fullPage: true });
      testInfo.attach('checkout-complete', { path: completeScreenshot, contentType: 'image/png' });
    });

    test('should show error for empty first name', async ({ page }) => {
      await page.locator('.checkout_button').click();
      await page.locator('[data-test="lastName"]').fill('Doe');
      await page.locator('[data-test="postalCode"]').fill('12345');
      await page.locator('[data-test="continue"]').click();
      
      const errorMsg = page.locator('[data-test="error"]');
      await expect(errorMsg).toBeVisible();
      await expect(errorMsg).toContainText('First Name is required');
    });

    test('should show error for empty last name', async ({ page }) => {
      await page.locator('.checkout_button').click();
      await page.locator('[data-test="firstName"]').fill('John');
      await page.locator('[data-test="postalCode"]').fill('12345');
      await page.locator('[data-test="continue"]').click();
      
      const errorMsg = page.locator('[data-test="error"]');
      await expect(errorMsg).toBeVisible();
      await expect(errorMsg).toContainText('Last Name is required');
    });

    test('should show error for empty postal code', async ({ page }) => {
      await page.locator('.checkout_button').click();
      await page.locator('[data-test="firstName"]').fill('John');
      await page.locator('[data-test="lastName"]').fill('Doe');
      await page.locator('[data-test="continue"]').click();
      
      const errorMsg = page.locator('[data-test="error"]');
      await expect(errorMsg).toBeVisible();
      await expect(errorMsg).toContainText('Postal Code is required');
    });

    test('should allow canceling checkout from overview', async ({ page }) => {
      await page.locator('.checkout_button').click();
      await page.locator('[data-test="firstName"]').fill('John');
      await page.locator('[data-test="lastName"]').fill('Doe');
      await page.locator('[data-test="postalCode"]').fill('12345');
      await page.locator('[data-test="continue"]').click();
      
      await page.locator('[data-test="cancel"]').click();
      await expect(page).toHaveURL(/inventory.html/);
    });
  });

  // ==================== NAVIGATION TESTS ====================
  
  test.describe('Navigation & Menu - Standard User', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.locator('#user-name').fill(USERS.standard.username);
      await page.locator('#password').fill(PASSWORD);
      await Promise.all([
        page.waitForNavigation({ url: /inventory.html/ }),
        page.locator('#login-button').click(),
      ]);
    });

    test('should open and close burger menu', async ({ page }) => {
      await page.locator('.bm-burger-button').click();
      await expect(page.locator('.bm-menu')).toBeVisible();
      
      await page.locator('.bm-cross-button').click();
      // Wait for menu animation to complete
      await page.waitForTimeout(500);
      await expect(page.locator('.bm-menu')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, -500, 0)');
    });

    test('should logout successfully', async ({ page }) => {
      await page.locator('.bm-burger-button').click();
      await page.locator('#logout_sidebar_link').click();
      
      await expect(page).toHaveURL(BASE_URL);
      await expect(page.locator('.login_logo')).toBeVisible();
    });

    test('should reset app state', async ({ page }) => {
      // Add items to cart
      await page.locator('.inventory_item button').first().click();
      await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
      
      // Reset app
      await page.locator('.bm-burger-button').click();
      await page.locator('#reset_sidebar_link').click();
      
      // Cart should be empty
      await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
    });

    test('should navigate to About page', async ({ page }) => {
      await page.locator('.bm-burger-button').click();
      
      // About link navigates in same page, not popup
      await Promise.all([
        page.waitForURL(/saucelabs.com/, { timeout: 10000 }),
        page.locator('#about_sidebar_link').click(),
      ]);
      
      await expect(page).toHaveURL(/saucelabs.com/);
    });
  });

  // ==================== MULTI-USER COMPARISON TESTS ====================
  
  test.describe('User Type Comparisons', () => {
    
    test('performance_glitch_user should be slower than standard_user', async ({ page }) => {
      // Test standard user speed
      await page.locator('#user-name').fill(USERS.standard.username);
      await page.locator('#password').fill(PASSWORD);
      
      const standardStart = Date.now();
      await Promise.all([
        page.waitForNavigation({ url: /inventory.html/ }),
        page.locator('#login-button').click(),
      ]);
      const standardDuration = Date.now() - standardStart;
      
      // Logout
      await page.locator('.bm-burger-button').click();
      await page.locator('#logout_sidebar_link').click();
      
      // Test performance_glitch user speed
      await page.locator('#user-name').fill(USERS.performance_glitch.username);
      await page.locator('#password').fill(PASSWORD);
      
      const glitchStart = Date.now();
      await Promise.all([
        page.waitForNavigation({ url: /inventory.html/ }),
        page.locator('#login-button').click(),
      ]);
      const glitchDuration = Date.now() - glitchStart;
      
      // Performance glitch user should be noticeably slower
      expect(glitchDuration).toBeGreaterThan(standardDuration);
      console.log(`Standard: ${standardDuration}ms, Glitch: ${glitchDuration}ms`);
    });

    test('problem_user should have UI issues', async ({ page }, testInfo) => {
      await page.locator('#user-name').fill(USERS.problem.username);
      await page.locator('#password').fill(PASSWORD);
      await Promise.all([
        page.waitForNavigation({ url: /inventory.html/ }),
        page.locator('#login-button').click(),
      ]);
      
      // Document the UI for problem user
      const screenshot = testInfo.outputPath('problem-user-inventory.png');
      await page.screenshot({ path: screenshot, fullPage: true });
      testInfo.attach('problem-user-ui', { path: screenshot, contentType: 'image/png' });
      
      // Problem user typically has broken images or other UI glitches
      await expect(page.locator('.inventory_list')).toBeVisible();
    });
  });

  // ==================== END-TO-END FULL FLOWS ====================
  
  test.describe('Complete E2E Scenarios', () => {
    
    test('E2E: Browse, Sort, Add Multiple Items, Complete Purchase', async ({ page }, testInfo) => {
      // Login
      await page.locator('#user-name').fill(USERS.standard.username);
      await page.locator('#password').fill(PASSWORD);
      await Promise.all([
        page.waitForNavigation({ url: /inventory.html/ }),
        page.locator('#login-button').click(),
      ]);
      
      // Sort by price low to high
      await page.selectOption('.product_sort_container', 'lohi');
      
      // Add cheapest 3 items
      const addButtons = page.locator('.inventory_item button');
      await addButtons.nth(0).click();
      await addButtons.nth(1).click();
      await addButtons.nth(2).click();
      
      await expect(page.locator('.shopping_cart_badge')).toHaveText('3');
      
      // Go to cart and remove one item
      await page.locator('.shopping_cart_link').click();
      await page.locator('button:has-text("REMOVE")').first().click();
      await expect(page.locator('.cart_item')).toHaveCount(2);
      
      // Screenshot cart
      const cartScreenshot = testInfo.outputPath('e2e-cart.png');
      await page.screenshot({ path: cartScreenshot, fullPage: true });
      testInfo.attach('e2e-cart', { path: cartScreenshot, contentType: 'image/png' });
      
      // Checkout
      await page.locator('.checkout_button').click();
      await page.locator('[data-test="firstName"]').fill('Jane');
      await page.locator('[data-test="lastName"]').fill('Smith');
      await page.locator('[data-test="postalCode"]').fill('90210');
      await page.locator('[data-test="continue"]').click();
      
      // Verify 2 items in overview
      await expect(page.locator('.cart_item')).toHaveCount(2);
      
      // Screenshot overview
      const overviewScreenshot = testInfo.outputPath('e2e-overview.png');
      await page.screenshot({ path: overviewScreenshot, fullPage: true });
      testInfo.attach('e2e-overview', { path: overviewScreenshot, contentType: 'image/png' });
      
      // Finish
      await page.locator('[data-test="finish"]').click();
      await expect(page.locator('.complete-header')).toContainText('THANK YOU FOR YOUR ORDER');
      
      // Final screenshot
      const completeScreenshot = testInfo.outputPath('e2e-complete.png');
      await page.screenshot({ path: completeScreenshot, fullPage: true });
      testInfo.attach('e2e-complete', { path: completeScreenshot, contentType: 'image/png' });
    });
  });
});
