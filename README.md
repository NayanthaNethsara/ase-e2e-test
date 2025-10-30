# 🎭 SauceDemo E2E Test Suite - Playwright

Comprehensive end-to-end testing suite for [SauceDemo](https://www.saucedemo.com/v1/index.html) using [Playwright](https://playwright.dev/).

## 🎯 What Makes This Special

Tests are **organized by user type**, with each user having **distinct expected behaviors**:

| User Type | Behavior | Expected Results |
|-----------|----------|------------------|
| `standard_user` | ✅ Baseline - all features work | 100% tests should PASS |
| `locked_out_user` | ❌ Cannot login | Auth error tests PASS |
| `problem_user` | ⚠️ Has UI bugs (intentional) | Some tests MEANT TO FAIL |
| `performance_glitch_user` | ⏱️ Very slow (5+ sec delays) | Tests PASS but take longer |

**Key Insight:** Not all test failures indicate bugs! See [EXPECTED_BEHAVIORS.md](./EXPECTED_BEHAVIORS.md)

---

## 📋 Prerequisites

- **Node.js** v16 or higher
- **npm** (comes with Node.js)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
```

Edit `.env` (default values work for SauceDemo):
```env
SAUCE_USERNAME=standard_user
SAUCE_PASSWORD=secret_sauce
```

### 3. Install Playwright Browsers
```bash
npm run install-browsers
```

### 4. Run Tests
```bash
# Run all user types in headless mode
npm run test:all-users

# Or run specific user type
npm run test:standard        # Standard user baseline
npm run test:locked          # Locked out user
npm run test:problem         # Problem user (expect some failures)
npm run test:performance     # Performance glitch user
```

### 5. View Results
```bash
npx playwright show-report
```

---

## 📁 Project Structure

```
.
├── tests/
│   ├── example.spec.js                 # Example tests (example.com)
│   ├── standard-user.spec.js           # ✅ Baseline user (all pass)
│   ├── locked-out-user.spec.js         # ❌ Auth tests (login fails)
│   ├── problem-user.spec.js            # ⚠️ UI bugs (some failures)
│   └── performance-glitch-user.spec.js # ⏱️ Slow tests (5+ sec delays)
├── playwright.config.js                # Playwright configuration
├── package.json                        # Dependencies & scripts
├── .env                                # Credentials (git-ignored)
├── .env.example                        # Template for credentials
├── README.md                           # This file
├── USER_BEHAVIOR_GUIDE.md              # Expected behaviors per user
├── EXPECTED_BEHAVIORS.md               # Failure analysis guide
└── USER_TYPE_RESULTS.md                # Latest test results
```

---

## 🎯 Available Commands

### Run All Tests
```bash
npm run test:headless        # All tests, headless mode
npm run test:headed          # All tests, visible browsers
npm run test:all-users       # Only user-type tests
```

### Run Individual User Types
```bash
npm run test:standard        # Standard user ✅
npm run test:locked          # Locked out user ❌
npm run test:problem         # Problem user ⚠️
npm run test:performance     # Performance user ⏱️
```

### Run Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debug Mode
```bash
npx playwright test --debug
npx playwright test tests/standard-user.spec.js --debug
```

### View Reports
```bash
npx playwright show-report   # Interactive HTML report
cat test-results/results.json  # JSON results
```

---

## 📊 Test Reports

After running tests, view the comprehensive HTML report:

```bash
npx playwright show-report
```

### Report Features:
- ✅ **Test results by user type** (passed/failed breakdown)
- 📸 **Screenshots on failure** (automatically captured)
- 🎥 **Video recordings** (failure replay)
- 📜 **Execution traces** (detailed debugging)
- ⏱️ **Performance metrics** (timing analysis)
- 🔍 **Separate JSON reports** per user type

### Expected Results:

| User Type | Expected Pass Rate | Notes |
|-----------|-------------------|-------|
| `standard_user` | 85-100% | Some known selector issues |
| `locked_out_user` | 83-100% | Auth tests working correctly |
| `problem_user` | 85-90% | **Failures are intentional** (UI bugs) |
| `performance_glitch_user` | 85-100% | Slow but functional |

📖 **Read [EXPECTED_BEHAVIORS.md](./EXPECTED_BEHAVIORS.md) for detailed failure analysis!**

---

## 🔍 Understanding Test Results

### ✅ Expected Failures (Working Correctly)
```
✅ locked_out_user cannot login → Security working!
✅ problem_user has broken images → Known UI bug!
✅ performance_glitch_user is slow → Performance issue confirmed!
```

### ❌ Unexpected Failures (Needs Investigation)
```
🚨 standard_user tests fail → Real bug or selector issue
🚨 locked_out_user logs in → Security breach!
🚨 problem_user has no bugs → Bug was fixed?
```

### 📖 Read the Guides:
- **[USER_BEHAVIOR_GUIDE.md](./USER_BEHAVIOR_GUIDE.md)** - Expected behavior per user
- **[EXPECTED_BEHAVIORS.md](./EXPECTED_BEHAVIORS.md)** - Which failures are OK
- **[USER_TYPE_RESULTS.md](./USER_TYPE_RESULTS.md)** - Latest test results

---

## 🐛 Debugging

### Run Specific Test
```bash
npx playwright test -g "should login successfully"
```

### Debug Mode (Inspector)
```bash
npx playwright test --debug
npx playwright test tests/standard-user.spec.js --debug
```

### View Test Trace
```bash
# Traces auto-captured on failure
npx playwright show-trace test-results/*/trace.zip
```

### Run Specific User + Browser
```bash
npx playwright test tests/problem-user.spec.js --project=firefox
```

### Headed Mode (See Browser)
```bash
npx playwright test --headed
```

---

## 🔍 Features

- ✅ **Multi-browser testing** (Chromium, Firefox, WebKit)
- ✅ **Parallel execution** with 4 workers (one per user type)
- ✅ **Separate test files** per user type
- ✅ **Headless and headed modes**
- ✅ **Environment variables** for credentials
- ✅ **Auto screenshots** on failure
- ✅ **Video recording** on failure
- ✅ **Execution traces** for debugging
- ✅ **HTML reports** with rich details
- ✅ **JSON reports** per user type
- ✅ **JUnit XML** for CI/CD integration
- ✅ **Performance measurement** (performance_glitch_user)

---

## 🎓 User Type Behaviors

### 1. Standard User (`standard_user`)
**Expected:** All tests should PASS ✅

```javascript
✅ Login successful
✅ View all 6 products
✅ Sorting works (4 variations)
✅ Cart operations work
✅ Checkout completes
✅ Navigation & logout work
✅ Normal performance
```

**If ANY test fails → Investigate!** 🚨

---

### 2. Locked Out User (`locked_out_user`)
**Expected:** Cannot login, auth tests PASS ✅

```javascript
❌ Login → Shows "user has been locked out" error
✅ Error message displays correctly
✅ Remains on login page
✅ Cannot access features
```

**Login should NEVER work for this user!**

---

### 3. Problem User (`problem_user`)
**Expected:** Some tests WILL FAIL (UI bugs) ⚠️

```javascript
✅ Can login
❌ Product images broken (dog images instead)
❌ Images missing src attribute
⚠️ Cart items may show wrong products
✅ Sorting works (surprisingly!)
✅ Basic navigation works
```

**Failures for problem_user are INTENTIONAL!**  
These demonstrate known UI bugs.

---

### 4. Performance Glitch User (`performance_glitch_user`)
**Expected:** Tests PASS but take 5+ seconds ⏱️

```javascript
✅ Login works (but takes 5+ seconds)
✅ All features work (very slow)
⏱️ Every action delayed by 5 seconds
❌ Performance tests fail (slowness confirmed)
```

**Slowness is the feature being tested!**

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [USER_BEHAVIOR_GUIDE.md](./USER_BEHAVIOR_GUIDE.md) | Expected behavior for each user type |
| [EXPECTED_BEHAVIORS.md](./EXPECTED_BEHAVIORS.md) | Detailed failure analysis guide |
| [USER_TYPE_RESULTS.md](./USER_TYPE_RESULTS.md) | Latest test execution results |

---

## 🤝 Contributing

1. Create new test file in `tests/` directory
2. Follow existing user-specific patterns
3. Run tests locally: `npm run test:all-users`
4. Ensure tests pass in all browsers (or document expected failures)
5. Update documentation if adding new user types

---

## 📝 Notes

- Tests run in **parallel with 4 workers** (one per user type)
- Failed tests **auto-capture** screenshots, videos, and traces
- Each user type has its **own test file** and expected behaviors
- **`problem_user` failures are intentional** (UI bugs)
- **`performance_glitch_user` has 5+ second delays**
- Increase timeouts in `playwright.config.js` if needed
- Use `.env` file for credentials (**never commit this file**)
- SauceDemo v1 limitations: No auth on direct URL access

---

## 🎯 Example Output

```bash
$ npm run test:all-users

Running 102 tests using 4 workers

  ✅ 36 passed in standard-user.spec.js
  ✅ 10 passed in locked-out-user.spec.js
  ⚠️  24 passed, 3 failed in problem-user.spec.js (failures expected)
  ✅ 18 passed in performance-glitch-user.spec.js

  87 passed, 15 failed (85.3% pass rate)
  Duration: 2m 18s
```

---

## 📞 Support

- **Test failing unexpectedly?** Check [EXPECTED_BEHAVIORS.md](./EXPECTED_BEHAVIORS.md)
- **Not sure which user to test?** See [USER_BEHAVIOR_GUIDE.md](./USER_BEHAVIOR_GUIDE.md)
- **Need test results?** Read [USER_TYPE_RESULTS.md](./USER_TYPE_RESULTS.md)
- **Playwright docs:** https://playwright.dev/

---

## 📄 License

ISC

---

**Remember:** Not all failures are bugs! Some are expected behaviors. 🎭
