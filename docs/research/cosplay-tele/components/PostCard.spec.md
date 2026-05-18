# PostCard Component Specification

## Target
- Target file: `src/components/sections/PostCard.tsx`
- Page route: `/` (homepage grid)
- Screenshot reference: `docs/design-references/cosplay-tele/homepage-desktop-1440.png`

## Purpose
Reusable card component for displaying individual cosplay posts in grid layout. Shows thumbnail, cosplayer name, character, source, and media count.

## DOM Structure
```
<article class="post-card">
  <div class="post-card__image-wrapper">
    <img src="..." alt="..." />
    <div class="post-card__badge">
      📷 112 | 🎥 9
    </div>
  </div>
  <div class="post-card__content">
    <h3 class="post-card__cosplayer">Cosplayer Name</h3>
    <p class="post-card__character">Character Name</p>
    <p class="post-card__source">Source / Game</p>
  </div>
</article>
```

## Exact Styles
- **Container**: 
  - Width: 100% (responsive)
  - Background: white / dark surface
  - Border radius: 8px
  - Box shadow: md (0 4px 6px rgba(0,0,0,0.1))
  - Overflow: hidden
  - Transition: all 300ms ease-in-out

- **Image Wrapper**:
  - Position: relative
  - Aspect ratio: 1 / 1 (square)
  - Background: #f0f0f0 (placeholder)
  - Overflow: hidden

- **Image**:
  - Width: 100%
  - Height: 100%
  - Object fit: cover
  - Transition: transform 300ms ease-in-out

- **Badge**:
  - Position: absolute
  - Bottom: 8px
  - Right: 8px
  - Background: rgba(0, 0, 0, 0.7)
  - Color: white
  - Padding: 4px 8px
  - Border radius: 4px
  - Font size: 12px
  - Font weight: 600

- **Content**:
  - Padding: 16px
  - Background: white / dark surface

- **Cosplayer Name (h3)**:
  - Font size: 16px
  - Font weight: 600
  - Color: #1a1a1a / #f5f5f5
  - Margin: 0 0 4px 0
  - Line height: 1.4

- **Character Name (p)**:
  - Font size: 14px
  - Font weight: 500
  - Color: #666666 / #999999
  - Margin: 0 0 4px 0

- **Source (p)**:
  - Font size: 12px
  - Font weight: 400
  - Color: #999999 / #666666
  - Margin: 0

## Content
- Cosplayer name: text from data
- Character name: text from data
- Source/Game: text from data
- Photo count: number from data
- Video count: number from data
- Thumbnail: image URL from data

## Assets
- Thumbnail images: `public/images/cosplay-tele/[slug].jpg`
- Icons: emoji or SVG icons for photo/video

## States and Behavior
- **Default**: Card displayed normally
- **Hover**: 
  - Image scales up 1.05x
  - Shadow increases to lg
  - Cursor: pointer
- **Active**: Link underline on text
- **Click**: Navigate to `/[slug]` detail page

## Responsive Behavior
- **Desktop (1440px)**: 4 columns, gap 16px
- **Tablet (768px)**: 2 columns, gap 16px
- **Mobile (390px)**: 1 column, gap 12px

## Implementation Notes
- Use Next.js Link for navigation
- Accept props: `post: { id, slug, cosplayer, character, source, photoCount, videoCount, thumbnail }`
- Lazy load images with next/image
- No database required; data from TypeScript array

## QA Checklist
- [ ] Image loads and displays correctly
- [ ] Badge shows correct counts
- [ ] Hover state works smoothly
- [ ] Click navigates to detail page
- [ ] Responsive on mobile/tablet/desktop
- [ ] No console errors
