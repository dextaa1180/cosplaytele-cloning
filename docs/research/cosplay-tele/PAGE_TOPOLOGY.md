# Page Topology — Cosplay Tele Homepage

## Overall Structure

```
┌─────────────────────────────────────────┐
│ Header / Navigation                     │
├─────────────────────────────────────────┤
│ Hero / Banner Section (optional)        │
├─────────────────────────────────────────┤
│ Main Content Grid                       │
│ - Post Cards (grid layout)              │
│ - Pagination / Load More                │
├─────────────────────────────────────────┤
│ Footer                                  │
└─────────────────────────────────────────┘
```

## Sections Identified

### 1. Header / Navigation
- Logo / Site Title: "Cosplaytele"
- Navigation menu (if present)
- Search bar (if present)
- Responsive hamburger menu (mobile)

### 2. Main Content Grid
- **Layout**: Multi-column grid (desktop: 3-4 columns, tablet: 2 columns, mobile: 1 column)
- **Card Components**: Each post card contains:
  - Thumbnail image
  - Cosplayer name
  - Character name
  - Source/Game name
  - Photo/video count badge
  - Link to detail page

### 3. Footer
- Links / Navigation
- Copyright / Attribution
- Social links (if present)

## Responsive Breakpoints

- **Desktop**: 1440px+ (3-4 column grid)
- **Tablet**: 768px-1439px (2 column grid)
- **Mobile**: 390px-767px (1 column grid)

## Content Placeholder Strategy

Since Ruly will replace content with custom data:
- Use TypeScript data arrays in `src/features/posts/data.ts`
- Each post object: `{ id, slug, cosplayer, character, source, photoCount, videoCount, thumbnail }`
- Thumbnail images: placeholder or local assets in `public/images/cosplay-tele/`
