# ROUTE_MAP — Tunacosplay Multi-Page Clone

## Route Mapping Summary

| Original URL | Next.js Route | Page Type | Status | Notes |
|---|---|---|---|---|
| https://cosplaytele.com/ | `/` | homepage | cloned | Grid layout with post cards |
| https://cosplaytele.com/category/video-cosplayy/ | `/category/video-cosplayy` | category | cloned | Video cosplay category listing |
| https://cosplaytele.com/explore-categories/ | `/explore-categories` | static | cloned | Category exploration page |
| https://cosplaytele.com/best-cosplayer/ | `/best-cosplayer` | ranking | cloned | Best cosplayer ranking |
| https://cosplaytele.com/24-hours/ | `/24-hours` | ranking | cloned | Top 24 hours ranking |
| https://cosplaytele.com/3-day/ | `/3-day` | ranking | cloned | Top 3 days ranking |
| https://cosplaytele.com/7-day/ | `/7-day` | ranking | cloned | Top 7 days ranking |
| https://cosplaytele.com/category/nude/ | `/category/nude` | category | cloned | Nude category (safe placeholder) |
| https://cosplaytele.com/category/cosplay-ero/ | `/category/cosplay-ero` | category | cloned | Cosplay ero category (safe placeholder) |
| https://cosplaytele.com/category/cosplay/ | `/category/cosplay` | category | cloned | Cosplay category listing |
| https://cosplaytele.com/mihara-3/ | `/mihara-3` | detail | cloned | Detail post page |

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
