# Decisions

## Decision: Restructure Component Paths

**Date**: 2026-05-18
**Rationale**: Simplify folder structure; move components to root level instead of nested folders
**Impact**: 
- `src/components/PostCard.tsx` (not `src/components/sections/PostCard.tsx`)
- `src/components/PostGrid.tsx` (not `src/components/sections/PostGrid.tsx`)
**Status**: ✅ Applied

---

## Decision: Data in Dedicated Folder

**Date**: 2026-05-18
**Rationale**: Keep data separate from components; easier to manage and replace
**Impact**: Data stored in `src/data/posts.ts` (not `src/features/posts/data.ts`)
**Status**: ✅ Applied

---

## Decision: Use Tailwind CSS for Styling

**Date**: 2026-05-18
**Rationale**: Template includes Tailwind; rapid responsive design without custom CSS
**Impact**: All components use Tailwind utility classes
**Status**: ✅ Applied

---

## Decision: Static Data Instead of Database

**Date**: 2026-05-18
**Rationale**: Ruly will replace content with custom data; database not required
**Impact**: Posts stored in `src/data/posts.ts` as TypeScript array
**Status**: ✅ Applied

---

## Decision: Next.js Image Component

**Date**: 2026-05-18
**Rationale**: Built-in optimization, lazy loading, responsive sizing
**Impact**: All images use `next/image` with proper sizing
**Status**: ✅ Applied

---

## Decision: Client Component for PostGrid

**Date**: 2026-05-18
**Rationale**: Grid needs interactivity (hover states, links)
**Impact**: PostGrid and PostCard marked as client components
**Status**: ✅ Applied
