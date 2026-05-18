# Error Log

## 2026-05-18 08:25 — Project Path Confusion

### Context
Initial clone task for Tunacosplay; misunderstood project structure.

### Error
Pushed template base to GitHub instead of cloning target website.

### Root Cause
Misunderstood that template base was separate from target cloning task.

### Fix Applied
- Clarified: Template base (`JCodesMore/ai-website-cloner-template`) is scaffold only
- Target cloning (Tunacosplay from https://cosplaytele.com/) is separate workflow
- Used existing project base for Tunacosplay clone

### Prevention Rule
- Always confirm: template base ≠ target cloning
- Wait for explicit target URL + project name before starting clone workflow
- Template is reusable scaffold; each clone is independent project

### Status
✅ Fixed

---

## Error: Double Heading on Category Pages

**Date:** 2026-05-18

**Symptom:**
Category pages (e.g., `/category/video-cosplayy`) displayed two headings:
1. Category-specific heading from CategoryPageLayout
2. Generic "Tunacosplay Gallery" heading from PostGrid component

**Root Cause:**
PostGrid component had hardcoded heading and description inside it. CategoryPageLayout called PostGrid, resulting in double headings.

**Fix:**
1. Refactored PostGrid to accept `posts` as props and removed hardcoded heading
2. Updated CategoryPageLayout to filter posts by category and pass to PostGrid
3. Updated homepage to render its own heading and pass all posts to PostGrid
4. Updated all category pages to pass `category` prop to CategoryPageLayout

**Files Changed:**
- `src/components/PostGrid.tsx` - Removed heading, added posts prop
- `src/components/category/CategoryPageLayout.tsx` - Added category filtering
- `src/app/page.tsx` - Added homepage heading
- `src/app/category/*/page.tsx` - Added category prop

**Prevention:**
- Keep presentation components (like PostGrid) pure - no hardcoded content
- Layout components should handle headings and data filtering
- Page components should only assemble layouts with appropriate props
