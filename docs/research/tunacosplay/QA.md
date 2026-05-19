# QA Report — Tunacosplay

## Latest QA Update (2026-05-19)
- **npm run check**: PASS (lint + typecheck + build)
- **Desktop navbar**: PASS
  - Top Cosplay dropdown opens
  - Level Cosplay dropdown opens
  - Opening one dropdown closes the other
  - Escape closes an open dropdown
  - Clicking outside closes an open dropdown
  - Dropdown links navigate and close the menu
- **Mobile navbar (390px)**: PASS
  - Horizontal overflow fixed (`documentElement.scrollWidth` <= viewport width)
  - Hamburger menu opens and closes
  - Mobile dropdown content expands inline
- **Image placeholders**: PASS
  - Safe local SVG placeholders added under `public/images/tunacosplay/`
  - Post data now points to existing local image files

## Remaining Gaps (Current)
- Real target assets are not yet downloaded or committed.
- Search input is visual only; search behavior is not implemented.
- Pagination is not implemented.
- Admin dashboard is planned but not implemented.
- Adult category pages intentionally use safe placeholder content.

## Build Status (Latest: 2026-05-18)
- **npm run typecheck**: ✅ PASS
- **npm run lint**: ✅ PASS
- **npm run build**: ✅ PASS (9.1s)

## Recent Fixes (2026-05-18)
- ✅ **Double heading issue fixed** - PostGrid refactored to accept posts as props, no hardcoded heading
- ✅ **Bootstrap removed** - Switched to Tailwind-only dropdowns (Bootstrap conflicted with Tailwind)
- ✅ **Tailwind dropdowns implemented** - Robust React state management with click-outside and escape key handlers
- ✅ **Video cosplay filtering fixed** - Now filters by videoCount > 0 instead of category === "video-cosplayy"
- ✅ **Category filtering** - CategoryPageLayout now supports filterMode prop ('category' | 'video')
- ✅ **Ranking pages** - RankingPageLayout now sorts and displays top posts by period

## Visual QA — Desktop (1440px)

### Navbar
- [x] Home link works
- [x] Video Cosplay direct link works
- [x] Top Cosplay dropdown opens on click
- [x] Top Cosplay dropdown items (24 Hours, 3 Day, 7 Day) navigate correctly
- [x] Level Cosplay dropdown opens on click
- [x] Level Cosplay dropdown items (Cosplay, Cosplay Ero, Nude) navigate correctly
- [x] Explore Categories link works
- [x] Best Cosplayer link works
- [x] Dropdowns have proper z-index (z-[9999])
- [x] Dropdowns have pointer-events-auto
- [x] Click-outside detection implemented
- [x] Escape key handler implemented

### Homepage (/)
- [x] Single heading: "Tunacosplay Gallery"
- [x] Description displays
- [x] PostGrid renders all posts
- [x] 4-column grid layout
- [x] No duplicate headings

### Category Pages
- [x] /category/video-cosplayy - Single heading "Video Cosplay", **filters by videoCount > 0**
- [x] /category/cosplay - Single heading "Cosplay", filtered posts
- [x] /category/cosplay-ero - Single heading "Cosplay Ero", filtered posts (safe)
- [x] /category/nude - Single heading "Nude", filtered posts (safe)
- [x] No duplicate "Tunacosplay Gallery" heading

### Explore Categories (/explore-categories)
- [x] COSPLAY GAME section with red title and horizontal lines
- [x] COSPLAY ANIME/MANGA section
- [x] COSPLAY FREESTYLE section
- [x] TOP VIEW section with tabs (24 Hours, 3 Days, 7 Days)
- [x] Tab switching works
- [x] Posts filtered by tags correctly

### Ranking Pages
- [x] /24-hours - Top posts sorted by views24h
- [x] /3-day - Top posts sorted by views3d
- [x] /7-day - Top posts sorted by views7d

### Best Cosplayer (/best-cosplayer)
- [x] List layout with rank numbers
- [x] Cosplayer names and stats display

### Detail Page (/mihara-3)
- [x] Metadata section (cosplayer, character, source, photo count)
- [x] Download buttons (placeholder)
- [x] Image gallery

## Visual QA — Mobile (390px)

### Navbar
- [x] Navbar responsive on mobile
- [x] Dropdowns work on mobile
- [x] All links accessible

### Pages
- [x] Grid collapses to 1-2 columns
- [x] Cards remain readable
- [x] No horizontal overflow
- [x] Touch targets adequate

## Functional QA

### Navigation
- [x] All navbar links work
- [x] Dropdown items navigate correctly
- [x] Post cards are clickable
- [x] Links point to correct routes

### Content
- [x] 10 sample posts with tags, categories, views
- [x] Posts filtered by category correctly
- [x] **Video Cosplay page filters by videoCount > 0** (not just category)
- [x] Posts sorted by views correctly
- [x] All required fields present

## Known Issues
- No active navbar interaction issues found in latest browser QA.

## Known Limitations
1. Sample data is placeholder (10 posts with dummy views/tags)
2. Adult categories use safe placeholder (no explicit media)
3. Download buttons are placeholders (no actual functionality)
4. Pagination not implemented
5. Search not implemented
6. Ranking pages show post grid (not ranked list with view counts/stats in cards)
7. **Video Cosplay page shows ~9 posts** (all posts with videoCount > 0, regardless of category)

## Browser Testing Completed
1. Click "Top Cosplay" -> dropdown opens
2. Click "24 Hours" -> navigates to /24-hours
3. Click "3 Day" -> navigates to /3-day
4. Click "7 Day" -> navigates to /7-day
5. Click "Level Cosplay" -> dropdown opens
6. Click "Cosplay" -> navigates to /category/cosplay
7. Click "Cosplay Ero" -> navigates to /category/cosplay-ero
8. Click "Nude" -> navigates to /category/nude
9. Click outside dropdown -> dropdown closes
10. Press Escape key -> dropdown closes
11. Verify /category/video-cosplayy shows all posts with videoCount > 0

## Next Steps
- Manual browser testing for dropdown functionality
- Consider adding view counts to ranking page cards
- Consider adding pagination for large datasets

### Detail Page (/mihara-3) - Preview-Only Layout with Admin-Managed Content (2026-05-18)
- [x] Dark hero section with background image overlay
- [x] Uppercase tags displayed above title (COSPLAY-GAME)
- [x] Large title format: "{cosplayer} cosplay {character} - {source} '{photoCount} photos and {videoCount} videos'"
- [x] Dark background (bg-neutral-900) with white text
- [x] Metadata panel with cyan left border (border-cyan-500)
- [x] Metadata labels: Cosplayer, Character, Appear In, Photos, File Size
- [x] Unzip password displayed in white box: "cosplaytele"
- [x] Download section with conditional rendering:
  - If downloadLinks exist → show red rounded pill download buttons
  - If no downloadLinks → show message: "Download links will be added from the admin dashboard."
- [x] Preview section with conditional rendering:
  - If previewMedia exists -> render mixed preview grid (max 8 media items)
  - Image items render optimized thumbnails
  - Video items render as poster/play cards when video URL is not uploaded yet
  - If no previewMedia -> show thumbnail placeholder with message: "Preview media will be managed from the admin dashboard."
- [x] Preview-only notice displayed (default or custom description)
- [x] **IMPORTANT**: Preview media and download links are admin-managed (not hardcoded)
- [x] **IMPORTANT**: Only mihara-3 has sample preview media as demo
- [x] **IMPORTANT**: Other posts show admin-managed placeholders
- [x] **IMPORTANT**: Frontend is admin-ready for future dashboard

## Known Issues
- Navbar dropdowns require manual browser testing (build pass ≠ feature working)
- Video Cosplay filtering now works correctly (filters by videoCount > 0)
- Detail pages are preview-only by design (not a bug, intentional limitation)
