# Fix Patterns

## Pattern: Playwright Navigation Timeout

### Symptoms
- `page.goto: Timeout 30000ms exceeded`
- Page takes >30s to reach `networkidle` state
- Screenshot capture hangs

### Best Fix
Use `waitUntil: 'domcontentloaded'` instead of `networkidle`. Add explicit timeout.

### Commands
```javascript
await page.goto(URL, { 
  waitUntil: 'domcontentloaded', 
  timeout: 15000 
});
```

### Files Usually Involved
- `scripts/capture-screenshots.mjs`
- Any Playwright navigation script

### Prevention
- Use `domcontentloaded` as default for visual captures
- Reserve `networkidle` only for data-heavy apps
- Set explicit timeout to fail fast

---

## Pattern: ESLint Unused Imports

### Symptoms
- ESLint warnings: "is defined but never used"
- Build passes but warnings remain
- Linting fails if warnings treated as errors

### Best Fix
Remove unused imports immediately after refactoring.

### Commands
```bash
npm run lint -- --fix
```

### Files Usually Involved
- Any `.ts`, `.tsx`, `.mjs` files with imports

### Prevention
- Review imports after code changes
- Run lint before final build
- Remove unused imports proactively

---

## Pattern: Next.js Image Optimization

### Symptoms
- Images not loading in production
- Placeholder images showing instead of real images
- Image paths incorrect

### Best Fix
Use `next/image` with proper `src` paths and `fill` prop for containers.

### Commands
```tsx
import Image from 'next/image';

<Image
  src="/images/path/to/image.jpg"
  alt="description"
  fill
  className="object-cover"
/>
```

### Files Usually Involved
- `src/components/sections/*.tsx`
- Any component rendering images

### Prevention
- Always use `next/image` for optimization
- Store images in `public/` directory
- Use relative paths from `public/`
