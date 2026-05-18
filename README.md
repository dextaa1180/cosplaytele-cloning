# cosplaytele-cloning

**Tunacosplay** — A clean Next.js clone of https://cosplaytele.com/ homepage structure.

## Project Info

- **Target Website**: https://cosplaytele.com/
- **Project Name**: Tunacosplay
- **Repository**: https://github.com/dextaa1180/cosplaytele-cloning
- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS
- **Status**: ✅ Build PASS

## Tech Stack

- **Next.js 14+** — React framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Utility-first styling
- **ESLint** — Code quality
- **Prettier** — Code formatting

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage route
│   └── [slug]/page.tsx       # Detail page (structure ready)
├── components/
│   ├── PostCard.tsx          # Reusable card component
│   └── PostGrid.tsx          # Grid container
├── data/
│   └── posts.ts              # Post data + types
├── lib/
│   └── cn.ts                 # Utility functions
└── types/
    └── index.ts              # Shared types

public/
├── images/tunacosplay/       # Local image assets
└── ...

docs/
├── research/tunacosplay/     # Design research
└── self-improvement/         # Error logs & patterns
```

## Features

- ✅ Responsive grid layout (4 columns desktop, 2 tablet, 1 mobile)
- ✅ Dark mode support
- ✅ Hover animations and transitions
- ✅ Next.js Image optimization
- ✅ TypeScript for type safety
- ✅ ESLint + Prettier configured

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## Build Status

- **TypeScript**: ✅ PASS
- **ESLint**: ✅ PASS
- **Build**: ✅ PASS (8.6s)
- **Desktop QA**: ✅ PASS (1440px)
- **Mobile QA**: ✅ PASS (390px)

## Documentation

- **Research**: `docs/research/tunacosplay/` — Design tokens, page topology, component specs
- **QA Report**: `docs/research/tunacosplay/QA.md` — Build status and visual QA results
- **Self-Improvement**: `docs/self-improvement/` — Error log, fix patterns, decisions

## Next Steps

1. Replace sample data in `src/data/posts.ts`
2. Add custom images to `public/images/tunacosplay/`
3. Build detail pages (`src/app/[slug]/page.tsx`)
4. Add pagination or infinite scroll if needed
5. Deploy to production

## License

MIT
