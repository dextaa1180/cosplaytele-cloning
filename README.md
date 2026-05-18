# Tunacosplay — Website Clone Project

## Project Overview

**Tunacosplay** is a clean Next.js clone of https://cosplaytele.com/ homepage structure. Built with modern web standards, Separation of Concerns, and ready for custom content replacement.

## Project Details

- **Target Website**: https://cosplaytele.com/
- **Project Name**: Tunacosplay
- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS
- **Build Status**: ✅ PASS (typecheck, lint, build)
- **Repository**: https://github.com/dextaa1180/cosplaytele-cloning

## Architecture

### Separation of Concerns (SOC)

```
src/
├── app/
│   ├── page.tsx              # Homepage route (assembly only)
│   └── [slug]/page.tsx       # Detail page (structure ready)
├── components/
│   ├── PostCard.tsx          # Reusable card component
│   └── PostGrid.tsx          # Grid container
├── data/
│   └── posts.ts              # Post data + TypeScript types
├── lib/
│   └── cn.ts                 # Utility functions
└── types/
    └── index.ts              # Shared types

public/
├── images/tunacosplay/       # Local image assets
└── ...

docs/
├── research/tunacosplay/
│   ├── ROUTES.md             # Route mapping
│   ├── PAGE_TOPOLOGY.md      # Page structure
│   ├── DESIGN_TOKENS.md      # Design system
│   ├── QA.md                 # QA report
│   └── components/
│       └── PostCard.spec.md  # Component specification
└── self-improvement/
    ├── ERROR_LOG.md          # Error tracking
    ├── FIX_PATTERNS.md       # Common fixes
    ├── DECISIONS.md          # Architecture decisions
    └── CHECKLIST.md          # Project checklist
```

## Key Features

- ✅ Responsive grid layout (4 columns desktop, 2 tablet, 1 mobile)
- ✅ Dark mode support (Tailwind dark: classes)
- ✅ Hover animations and transitions
- ✅ Next.js Image optimization
- ✅ TypeScript for type safety
- ✅ ESLint + Prettier configured
- ✅ Self-improvement documentation

## Build & Development

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Quality Checks
```bash
npm run lint      # ESLint
npm run typecheck # TypeScript
npm run build     # Full build
```

## Content Replacement

To replace sample content with custom data:

1. **Edit `src/data/posts.ts`**:
   - Update `posts` array with your content
   - Each post needs: `id`, `slug`, `cosplayer`, `character`, `source`, `photoCount`, `videoCount`, `thumbnail`

2. **Add Images**:
   - Place images in `public/images/tunacosplay/`
   - Update `thumbnail` paths in data

3. **Rebuild**:
   ```bash
   npm run build
   ```

## Documentation

- **Research**: `docs/research/tunacosplay/` — Design tokens, page topology, component specs
- **QA Report**: `docs/research/tunacosplay/QA.md` — Build status and visual QA results
- **Self-Improvement**: `docs/self-improvement/` — Error log, fix patterns, decisions, checklist

## Build Status

- **TypeScript**: ✅ PASS
- **ESLint**: ✅ PASS
- **Build**: ✅ PASS (8.6s)
- **Desktop QA**: ✅ PASS (1440px)
- **Mobile QA**: ✅ PASS (390px)

## Next Steps

1. Replace sample data in `src/data/posts.ts`
2. Add custom images to `public/images/tunacosplay/`
3. Build detail pages (`src/app/[slug]/page.tsx`)
4. Add pagination or infinite scroll if needed
5. Deploy to production

## License

MIT
