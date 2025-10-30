# GitHub Actions Workflows

This directory contains CI/CD workflows for automated testing.

## Available Workflows

### 1. `playwright-tests.yml` - Main Test Workflow

**Triggers:** Push to main/master/develop, Pull Requests, Manual  
**Purpose:** Run all user type tests and publish results

**What it does:**

- ✅ Runs all 4 user types (standard, locked, problem, performance)
- ✅ Tests across 3 browsers (Chromium, Firefox, WebKit)
- ✅ Uploads HTML report as GitHub Pages
- ✅ Uploads screenshots, videos, traces as artifacts
- ✅ Creates PR summary with test results

**Artifacts:**

- `playwright-report-*` - Interactive HTML report
- `test-results-json-*` - JSON test results
- `test-results-junit-*` - JUnit XML for CI integration
- `test-screenshots-*` - Failure screenshots
- `test-videos-*` - Test execution videos
- `test-traces-*` - Playwright traces for debugging

---

### 2. `playwright-tests-matrix.yml` - Matrix Test Workflow

**Triggers:** Push to main/master/develop, Pull Requests, Manual  
**Purpose:** Run tests in parallel matrix (user × browser)

**What it does:**

- ✅ Creates 12 parallel jobs (4 users × 3 browsers)
- ✅ Each job runs independently
- ✅ Faster execution with better granularity
- ✅ Easier to identify browser-specific issues

**Matrix:**

```
User Types: [standard, locked, problem, performance]
Browsers: [chromium, firefox, webkit]
Total Jobs: 12
```

**Artifacts:**

- `results-{user}-{browser}` - Individual results per combination
- Merged HTML report deployed to GitHub Pages

---

### 3. `nightly-tests.yml` - Scheduled Complete Test Suite

**Triggers:** Daily at 2 AM UTC, Manual  
**Purpose:** Full regression testing overnight

**What it does:**

- ✅ Runs complete test suite (all files)
- ✅ Generates comprehensive nightly report
- ✅ Creates GitHub issue on failure
- ✅ Retains results for 90 days

**Artifacts:**

- `nightly-summary-{date}` - Summary markdown
- `nightly-playwright-report-{date}` - Full HTML report
- `nightly-test-results-{date}` - All test results

**On Failure:**

- 🚨 Automatically creates GitHub issue
- 📧 Sends notification to repository watchers
- 📊 Links to failed run and artifacts

---

## Setup Instructions

### 1. Enable GitHub Actions

GitHub Actions are enabled by default. Just push the workflow files.

### 2. Enable GitHub Pages (for HTML reports)

1. Go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

Now HTML reports will be automatically deployed to:

```
https://{username}.github.io/{repo-name}/
```

### 3. Set Repository Secrets (Optional)

If you need custom credentials:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - `SAUCE_USERNAME` (optional, defaults to standard_user)
   - `SAUCE_PASSWORD` (optional, defaults to secret_sauce)

### 4. Configure Permissions

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select:
   - ✅ **Read and write permissions**
3. Under **Actions permissions**, ensure workflows can run

---

## Manual Workflow Runs

All workflows support manual triggering:

1. Go to **Actions** tab
2. Select workflow from left sidebar
3. Click **Run workflow** button
4. Select branch and click **Run workflow**

---

## Viewing Results

### HTML Report (GitHub Pages)

After workflow completes, visit:

```
https://{username}.github.io/{repo-name}/
```

### Artifacts

1. Go to **Actions** tab
2. Click on workflow run
3. Scroll to **Artifacts** section
4. Download any artifact

### Test Summary

- Check workflow run **Summary** tab
- View **Job Summary** for quick overview
- For PRs, check comment with test results

---

## Understanding Test Results

### Expected Results:

| User Type        | Pass Rate | Notes                              |
| ---------------- | --------- | ---------------------------------- |
| Standard User    | 85-100%   | Baseline (2 known selector issues) |
| Locked Out User  | 83-100%   | Auth tests (login fails = pass)    |
| Problem User     | 85-90%    | **Failures expected** (UI bugs)    |
| Performance User | 85-100%   | Slow but functional                |

### When to Investigate:

- ✅ **problem_user fails** → Expected (UI bugs)
- ✅ **locked_out_user can't login** → Expected (security)
- ✅ **performance_user is slow** → Expected (5+ sec)
- 🚨 **standard_user fails** → Investigate!
- 🚨 **locked_out_user logs in** → Security issue!

---

## Workflow Customization

### Run on Different Branches

Edit workflow file:

```yaml
on:
  push:
    branches: [main, develop, staging] # Add your branches
```

### Change Schedule (Nightly Tests)

Edit `nightly-tests.yml`:

```yaml
schedule:
  - cron: "0 2 * * *" # Daily at 2 AM UTC
  # Examples:
  # - cron: '0 */6 * * *'  # Every 6 hours
  # - cron: '0 0 * * 1'    # Every Monday
```

### Add More Browsers

Edit matrix in workflow:

```yaml
matrix:
  browser: [chromium, firefox, webkit, edge] # Add edge
```

### Change Test Timeout

Edit workflow:

```yaml
jobs:
  test:
    timeout-minutes: 30 # Increase if tests take longer
```

---

## Troubleshooting

### Workflow Fails to Start

- Check if Actions are enabled in Settings
- Verify workflow YAML syntax
- Ensure branch triggers match your branch name

### Tests Fail in CI but Pass Locally

- Check if browsers are installed (`--with-deps`)
- Verify environment variables are set
- Review timing differences (CI may be slower)
- Check browser versions match

### HTML Report Not Publishing

- Verify GitHub Pages is enabled
- Check if Pages source is set to "GitHub Actions"
- Wait 2-3 minutes for deployment
- Check workflow permissions (needs pages: write)

### Artifacts Not Uploading

- Check if paths exist in workflow
- Verify `if: always()` is set for uploads
- Check retention days (default: 30)
- Ensure workflow has write permissions

---

## Best Practices

1. **Review artifacts after failures**

   - Download HTML report for interactive view
   - Check screenshots for visual issues
   - Use traces for step-by-step debugging

2. **Don't panic on problem_user failures**

   - These are expected (UI bugs)
   - Read [EXPECTED_BEHAVIORS.md](../../EXPECTED_BEHAVIORS.md)

3. **Use matrix workflow for faster feedback**

   - Parallel execution is faster
   - Easier to spot browser-specific issues

4. **Check nightly reports regularly**

   - Catch regressions early
   - Monitor test stability over time

5. **Keep workflows updated**
   - Update Node.js version when needed
   - Keep action versions current (@v4, etc.)

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright CI Guide](https://playwright.dev/docs/ci)
- [GitHub Pages Setup](https://docs.github.com/en/pages)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

---

## Questions?

- Check [EXPECTED_BEHAVIORS.md](../../EXPECTED_BEHAVIORS.md) for test failure guidance
- Review [USER_BEHAVIOR_GUIDE.md](../../USER_BEHAVIOR_GUIDE.md) for user type details
- See [README.md](../../README.md) for general setup
