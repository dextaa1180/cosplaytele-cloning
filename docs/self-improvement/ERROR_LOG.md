# Error Log

## 2026-05-18 08:04 — Playwright Browser Context Error

### Context
Phase 2 — Capturing screenshots of homepage with Playwright.

### Error
```
TypeError: browser.createBrowserContext is not a function
```

### Root Cause
Playwright API: `browser.createBrowserContext()` is not the correct method. Should use `browser.newPage()` directly.

### Fix Applied
- File: `scripts/capture-screenshots.mjs`
- Changed: `const context = await browser.createBrowserContext(); const page = await context.newPage();`
- To: `const page = await browser.newPage();`
- Also updated cleanup: removed `context.close()`, kept `page.close()` and `browser.close()`

### Prevention Rule
- Always check Playwright API docs for correct browser/page lifecycle
- `browser.newPage()` is the standard way to create pages
- `createBrowserContext()` is for advanced multi-context scenarios (not needed here)

### Status
✅ Fixed

---

## 2026-05-18 08:05 — Playwright Navigation Timeout

### Context
Phase 2 — Capturing screenshots; waiting for page to load with `waitUntil: 'networkidle'`.

### Error
```
page.goto: Timeout 30000ms exceeded.
Call log: navigating to "https://cosplaytele.com/", waiting until "networkidle"
```

### Root Cause
Target website takes >30s to reach full network idle state. `networkidle` is too strict for this site.

### Fix Applied
- File: `scripts/capture-screenshots.mjs`
- Changed: `waitUntil: 'networkidle'` → `waitUntil: 'domcontentloaded'`
- Added: `timeout: 15000` (15s instead of default 30s)
- Result: Screenshots captured successfully in ~5s

### Prevention Rule
- Use `domcontentloaded` for most websites (faster, sufficient for visual capture)
- Reserve `networkidle` only for data-heavy apps that need all requests complete
- Set explicit timeout to fail fast if site is unreachable

### Status
✅ Fixed

---

## 2026-05-18 08:08 — ESLint Unused Imports

### Context
Phase 5 — Build verification; linting scripts.

### Error
```
/scripts/capture-screenshots.mjs
  2:10  warning  'writeFileSync' is defined but never used
  3:10  warning  'dirname' is defined but never used
```

### Root Cause
Initial script template imported utilities that weren't used in final implementation.

### Fix Applied
- File: `scripts/capture-screenshots.mjs`
- Removed: `import { writeFileSync, mkdirSync } from 'fs';`
- Removed: `import { dirname } from 'path';`
- Kept: `import { mkdirSync } from 'fs';` (actually used)

### Prevention Rule
- Remove unused imports before final build
- ESLint warnings should be resolved (not ignored)
- Review imports after refactoring code

### Status
✅ Fixed
