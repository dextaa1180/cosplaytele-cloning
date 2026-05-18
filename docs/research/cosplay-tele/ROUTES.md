# Route Mapping — Cosplay Tele

## Homepage
- **URL**: https://cosplaytele.com/
- **Route**: `/` → `src/app/page.tsx`
- **Purpose**: Grid/list view of cosplay posts with pagination or infinite scroll

## Detail Page (Dynamic)
- **URL Pattern**: https://cosplaytele.com/[slug]/
- **Route**: `/[slug]/page.tsx` → `src/app/[slug]/page.tsx`
- **Purpose**: Individual cosplay post detail (photos, videos, metadata)
- **Examples**:
  - /mihara-3/
  - /hatsune-miku/
  - /lynae/
  - /maid-42/
  - /school-girl-31/
  - /phoebe/
  - /jeanne-darc-jk/
  - /maid-10/
  - /ganyu-34/
  - /nicole-demara-14/
  - /marin-kitagawa-38/
  - /fox-cutie/

## Scope Decision
- **For this clone**: Build homepage structure only (grid layout, post cards, navigation)
- **Content**: Will be replaced by Ruly with custom content (non-NSFW)
- **Database**: Not required; static data or placeholder content
- **Detail pages**: Structure only (not fully built in Phase 1)
