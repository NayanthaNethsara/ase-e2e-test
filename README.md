# ASE E2E Test Suite

End-to-end tests for Swag Labs (saucedemo) using Playwright. The suite exercises common user journeys across multiple user archetypes and browsers, producing rich HTML/JSON/JUnit reports and on-failure traces/screenshots/videos.

- Test runner: Playwright Test (`@playwright/test`)
- Target site: Swag Labs — https://www.saucedemo.com (tests use explicit URLs)
- Browsers: Chromium, Firefox, WebKit (run in parallel)
- Test specs: `tests/*.spec.js` (standard, locked-out, problem, performance-glitch users)

## Prerequisites

- Node.js 18+ and npm

## Setup

```zsh
# 1) Install dependencies
npm install

# 2) Install Playwright browsers and required system deps
npm run install-browsers
```

## Run tests

All commands run in headless mode by default unless noted.

```zsh
# Run the full suite across all three browsers
npm test

# Run in headed mode for debugging
npm run test:headed

# Run in headless mode with list reporter only
npm run test:headless

# Scope to a single browser (examples)
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run a single spec by user type
npm run test:standard      # tests/standard-user.spec.js
npm run test:locked        # tests/locked-out-user.spec.js
npm run test:problem       # tests/problem-user.spec.js
npm run test:performance   # tests/performance-glitch-user.spec.js

# Run all *-user specs
npm run test:all-users
```

## Reporting and artifacts

- HTML report: `playwright-report/index.html` (auto-generated). You can also open via:
  ```zsh
  npx playwright show-report
  ```
- Machine-readable outputs in `test-results/`:
  - `results.json` and `junit.xml`
  - Per-user JSON files: `standard-user.json`, `locked-out-user.json`, `problem-user.json`, `performance-glitch-user.json`
- Artifacts on failure (as configured in `playwright.config.js`):
  - Trace: `retain-on-failure`
  - Screenshot: `only-on-failure`
  - Video: `retain-on-failure`

## Project configuration highlights

`playwright.config.js`:

- Fully parallel tests; 4 workers locally (1 on CI)
- Retries: 2 on CI, 0 locally
- Projects: chromium, firefox, webkit (Desktop profiles)

Notes:

- Tests call Swag Labs with full URLs directly (e.g., `https://www.saucedemo.com/v1/index.html`), so no base URL configuration is required.

## Typical scenarios covered

The suite includes specs for different user personas:

- Standard user flows (e.g., navigation, cart/checkout, menus)
- Locked-out user behavior (access restrictions)
- Problem user visual/content issues
- Performance-glitch user (validates flows under slower conditions)

Check the spec files in `tests/` for exact steps:

- `locked-out-user.spec.js`
- `performance-glitch-user.spec.js`
- `problem-user.spec.js`
- `standard-user.spec.js`

### Test users used in specs

- `standard_user` / `secret_sauce`
- `locked_out_user` / `secret_sauce`
- `problem_user` / `secret_sauce`
- `performance_glitch_user` / `secret_sauce`

## Troubleshooting

- Tests immediately fail with navigation errors:
  - Ensure https://www.saucedemo.com is reachable from your machine.
- WebKit/platform dependencies:
  - If browser install fails, rerun `npm run install-browsers` and ensure Xcode Command Line Tools are installed on macOS.
- Slow or flaky locally:
  - Try `--project=chromium` or run headed to observe timings: `npm run test:headed`.

## Useful references

- Playwright Test docs: https://playwright.dev/docs/test-intro
- CLI reference: https://playwright.dev/docs/test-cli
