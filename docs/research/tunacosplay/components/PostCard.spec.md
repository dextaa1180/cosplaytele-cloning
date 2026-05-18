# PostCard Component Specification

## Target
- Target file: `src/components/PostCard.tsx`
- Page route: `/` (homepage grid)
- Screenshot reference: `docs/design-references/tunacosplay/homepage-desktop-1440.png`

## Purpose
Reusable card component for displaying individual cosplay posts in grid layout.

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
  - Width: 100%
  - Background: white / dark surface
  - Border radius: 8px
  - Box shadow: md
  - Overflow: hidden
  - Transition: all 300ms ease-in-out

- **Image Wrapper**:
  - Position: relative
  - Aspect ratio: 1 / 1 (square)
  - Background: #f0f0f0
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

- **Cosplayer Name (h3)**:
  - Font size: 16px
  - Font weight: 600
  - Color: #1a1a1a / #f5f5f5
  - Margin: 0 0 4px 0

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

## States and Behavior
- **Default**: Card displayed normally
- **Hover**: Image scales 1.05x, shadow increases
- **Click**: Navigate to `/[slug]` detail page

## Responsive Behavior
- **Desktop (1440px)**: 4 columns, gap 16px
- **Tablet (768px)**: 2 columns, gap 16px
- **Mobile (390px)**: 1 column, gap 12px

## QA Checklist
- [ ] Image loads correctly
- [ ] Badge shows correct counts
- [ ] Hover state works smoothly
- [ ] Click navigates to detail page
- [ ] Responsive on all breakpoints
- [ ] No console errors
