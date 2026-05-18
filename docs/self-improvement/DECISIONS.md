# Decisions

## Decision: Use Tailwind CSS for Styling

**Date**: 2026-05-18
**Rationale**: Template includes Tailwind; provides rapid responsive design without custom CSS
**Impact**: All components use Tailwind utility classes
**Status**: ✅ Applied

---

## Decision: Static Data Instead of Database

**Date**: 2026-05-18
**Rationale**: Ruly will replace content with custom data; database not required per scope
**Impact**: Posts stored in `src/features/posts/data.ts` as TypeScript array
**Status**: ✅ Applied

---

## Decision: Next.js Image Component for Optimization

**Date**: 2026-05-18
**Rationale**: Built-in optimization, lazy loading, responsive sizing
**Impact**: All images use `next/image` with proper sizing
**Status**: ✅ Applied

---

## Decision: Client Component for PostGrid

**Date**: 2026-05-18
**Rationale**: Grid needs interactivity (hover states, links); 'use client' directive added
**Impact**: PostGrid and PostCard marked as client components
**Status**: ✅ Applied

---

## Decision: Playwright for Screenshot Capture

**Date**: 2026-05-18
**Rationale**: Deterministic, fixed viewport, supports both desktop and mobile
**Impact**: Screenshots captured at 1440px and 390px for QA reference
**Status**: ✅ Applied

---

## Decision: 4-Column Grid on Desktop

**Date**: 2026-05-18
**Rationale**: Matches original site structure; good balance of content density and readability
**Impact**: Grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
**Status**: ✅ Applied
