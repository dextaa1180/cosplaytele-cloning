# ROUTE_MAP — Tunacosplay Multi-Page Clone

## Route Mapping Summary

| Original URL | Next.js Route | Page Type | Status | Notes |
|---|---|---|---|---|
| https://cosplaytele.com/ | `/` | homepage | cloned | Grid layout with post cards |
| https://cosplaytele.com/category/video-cosplayy/ | `/category/video-cosplayy` | category | partial | Generic category layout (needs visual refinement) |
| https://cosplaytele.com/explore-categories/ | `/explore-categories` | static | cloned | Multi-section explore page with COSPLAY GAME, ANIME/MANGA, FREESTYLE, TOP VIEW |
| https://cosplaytele.com/best-cosplayer/ | `/best-cosplayer` | ranking | cloned | Cosplayer list with rank numbers |
| https://cosplaytele.com/24-hours/ | `/24-hours` | ranking | cloned | Ranking page with RankingPageLayout |
| https://cosplaytele.com/3-day/ | `/3-day` | ranking | cloned | Ranking page with RankingPageLayout |
| https://cosplaytele.com/7-day/ | `/7-day` | ranking | cloned | Ranking page with RankingPageLayout |
| https://cosplaytele.com/category/nude/ | `/category/nude` | category | partial | Generic category layout (safe placeholder) |
| https://cosplaytele.com/category/cosplay-ero/ | `/category/cosplay-ero` | category | partial | Generic category layout (safe placeholder) |
| https://cosplaytele.com/category/cosplay/ | `/category/cosplay` | category | partial | Generic category layout (needs visual refinement) |
| https://cosplaytele.com/mihara-3/ | `/mihara-3` | detail | preview-only | Cosplaytele-style preview: dark hero, metadata panel, download buttons (placeholders), preview grid. Full content not hosted. |

## Shared Components

- `src/components/layout/Header.tsx` — Top navigation
- `src/components/layout/Navbar.tsx` — Main navbar with dropdowns
- `src/components/layout/Footer.tsx` — Footer
- `src/components/posts/PostCard.tsx` — Post card (reusable)
- `src/components/posts/PostGrid.tsx` — Post grid container
- `src/components/posts/Pagination.tsx` — Pagination component
- `src/components/category/CategoryHeader.tsx` — Category page header
- `src/components/ranking/RankingCard.tsx` — Ranking card variant

## Page Types

### Homepage (`/`)
- Grid layout with post cards
- Pagination or infinite scroll
- Status: ✅ CLONED

### Category Pages (`/category/*`)
- Category header with title
- Post grid with pagination
- Same layout as homepage
- Status: PENDING

### Ranking Pages (`/24-hours`, `/3-day`, `/7-day`, `/best-cosplayer`)
- Ranking list or grid
- Possibly different card layout (with rank number)
- Status: PENDING

### Static Pages (`/explore-categories`)
- Category showcase/grid
- Links to category pages
- Status: PENDING

### Detail Pages (`/[slug]`)
- Post detail with metadata
- Photo/video gallery
- Status: PENDING

## Implementation Order

1. Build shared layout components (Header, Navbar, Footer)
2. Build category pages (reuse PostGrid)
3. Build ranking pages
4. Build explore-categories page
5. Build detail page
6. Test all routes
7. Final build & push
