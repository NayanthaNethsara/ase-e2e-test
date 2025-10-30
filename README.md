# E2E Test Suite - Playwright

End-to-end testing suite using [Playwright](https://playwright.dev/) for automated browser testing across Chromium, Firefox, and WebKit.

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and configure credentials:

```bash
cp .env.example .env
```

Edit `.env` and update with your credentials:

```
SAUCE_USERNAME=your_username
SAUCE_PASSWORD=your_password
```

**Note:** The `.env` file is git-ignored to keep credentials secure. Default values are provided for SauceDemo.

### 3. Install Playwright Browsers

Playwright requires browser binaries to run tests. Install them once:

```bash
npm run install-browsers
```

This installs Chromium, Firefox, and WebKit with system dependencies.

### 4. Run Tests

**Headless mode** (no visible browser, faster, CI-friendly):

```bash
npm run test:headless
```

**Headed mode** (visible browser windows):

```bash
npm run test:headed
```

**Default mode** (headless with HTML report):

```bash
npm test
```

## 📁 Project Structure

```
ase-e2e-test/
├── tests/
│   ├── example.spec.js      # Example.com smoke tests
│   └── saucedemo.spec.js    # SauceDemo login and checkout flow
├── playwright.config.js      # Playwright configuration
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (git-ignored)
├── .env.example              # Example environment variables template
├── .gitignore                # Git ignore rules
├── test-results/             # Test artifacts (screenshots, traces)
└── playwright-report/        # HTML report (generated after test runs)
```

## 🧪 Test Files

### `tests/example.spec.js`

- **Purpose:** Smoke tests for example.com
- **Tests:**
  - Homepage title and heading validation
  - Navigation link verification (follows link to IANA)
  - Screenshot capture for visual inspection

### `tests/saucedemo.spec.js`

- **Purpose:** E2E purchase flow for SauceDemo
- **Tests:**
  - Login with demo credentials (from environment variables)
  - Add product to cart
  - Checkout process (fill info, review, complete order)
  - Order confirmation validation
- **Environment Variables:**
  - `SAUCE_USERNAME` - SauceDemo username (default: `standard_user`)
  - `SAUCE_PASSWORD` - SauceDemo password (default: `secret_sauce`)

## 🎯 Running Specific Tests

### Run a single test file

```bash
npm run test:headless -- tests/saucedemo.spec.js
```

### Run a specific test by name

```bash
npm run test:headless -- -g "login, add item to cart"
```

### Run only one browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run in debug mode (step-by-step with UI)

```bash
npx playwright test --debug tests/saucedemo.spec.js
```

### Run with slow motion (500ms delay between actions)

```bash
npx playwright test --headed --slow-mo=500 tests/saucedemo.spec.js
```

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

This opens an interactive report in your browser showing:

- Test results and timing
- Screenshots and traces
- Error details and logs

## ⚙️ Configuration

Edit `playwright.config.js` to customize:

- **Timeout:** Test and action timeouts
- **Browsers:** Enable/disable specific browsers
- **Retries:** Number of retries for flaky tests
- **Screenshots:** When to capture screenshots
- **Traces:** When to record execution traces
- **Base URL:** Set default base URL for tests

Example changes:

```javascript
// Run only Chromium
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
],

// Increase timeout for slow environments
timeout: 60 * 1000, // 60 seconds

// Always capture screenshots
use: {
  screenshot: 'on', // or 'only-on-failure'
},
```

## 🔧 Available npm Scripts

| Command                    | Description                                     |
| -------------------------- | ----------------------------------------------- |
| `npm test`                 | Run all tests (headless, generates HTML report) |
| `npm run test:headless`    | Run tests headless with list reporter           |
| `npm run test:headed`      | Run tests with visible browser windows          |
| `npm run install-browsers` | Install Playwright browser binaries             |

## 📝 Writing New Tests

Create a new test file in the `tests/` directory:

```javascript
import { test, expect } from "@playwright/test";

test.describe("My Feature Tests", () => {
  test("should do something", async ({ page }) => {
    await page.goto("https://example.com");
    await expect(page).toHaveTitle(/Example/);
  });
});
```

Key Playwright APIs:

- `page.goto(url)` - Navigate to URL
- `page.locator(selector)` - Find element
- `page.fill(selector, text)` - Fill input
- `page.click(selector)` - Click element
- `expect(locator).toBeVisible()` - Assert visibility
- `expect(page).toHaveURL(pattern)` - Assert URL

## 🐛 Debugging Tips

### 1. Use Playwright Inspector

```bash
npx playwright test --debug
```

### 2. Add `page.pause()` in your test

```javascript
await page.pause(); // Test execution stops here
```

### 3. Check screenshots in `test-results/`

Failed tests automatically capture screenshots.

### 4. Enable traces

```bash
npx playwright test --trace on
```

Then view with:

```bash
npx playwright show-trace test-results/.../trace.zip
```

### 5. Use headed mode + slow motion

```bash
npx playwright test --headed --slow-mo=1000
```

## 🚦 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npm run install-browsers
      - name: Run Playwright tests
        run: npm run test:headless
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)

## 🤝 Contributing

1. Add new test files to `tests/` directory
2. Follow existing naming conventions (`*.spec.js`)
3. Use descriptive test names
4. Add comments for complex test logic
5. Run tests locally before committing

## 📄 License

ISC
