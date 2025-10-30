const { devices } = require("@playwright/test");

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: "tests",
  timeout: 60 * 1000, // Increased for performance_glitch_user
  expect: { timeout: 10000 },
  retries: process.env.CI ? 2 : 0,
  
  // Enhanced reporting
  reporter: [
    ["list"],
    ["html", { 
      outputFolder: "playwright-report",
      open: "never" // Open manually with npx playwright show-report
    }],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],
  
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15 * 1000,
    ignoreHTTPSErrors: true,
    
    // Enhanced trace and screenshot settings
    trace: "retain-on-failure", // Keep traces only for failures
    screenshot: "only-on-failure", // Auto screenshot on failure
    video: "retain-on-failure", // Keep video only for failures
    
    // Context options
    baseURL: process.env.BASE_URL,
  },
  
  projects: [
    { 
      name: "chromium", 
      use: { 
        ...devices["Desktop Chrome"],
        // Additional chromium-specific settings
        launchOptions: {
          slowMo: 0, // Add delay in ms if needed for debugging
        }
      } 
    },
    { 
      name: "firefox", 
      use: { ...devices["Desktop Firefox"] } 
    },
    { 
      name: "webkit", 
      use: { ...devices["Desktop Safari"] } 
    },
  ],
};
