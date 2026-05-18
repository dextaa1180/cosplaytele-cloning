# Fix Patterns

## Pattern: Import Path Mismatch

### Symptoms
- Import error: `Cannot find module '@/components/sections/PostGrid'`
- Component exists but path is wrong
- Build fails with module resolution error

### Best Fix
Update import path to match actual component location.

### Commands
```typescript
// Wrong:
import { PostGrid } from '@/components/sections/PostGrid';

// Correct:
import { PostGrid } from '@/components/PostGrid';
```

### Files Usually Involved
- `src/app/page.tsx`
- Any file importing components

### Prevention
- Verify component location before importing
- Use consistent folder structure (components at root level)
- Check tsconfig paths if using path aliases

---

## Pattern: Data Import Path

### Symptoms
- Import error: `Cannot find module '@/features/posts/data'`
- Data file exists but path is wrong

### Best Fix
Update import path to match data location.

### Commands
```typescript
// Wrong:
import { posts } from '@/features/posts/data';

// Correct:
import { posts } from '@/data/posts';
```

### Files Usually Involved
- `src/components/PostGrid.tsx`
- Any component using data

### Prevention
- Keep data files in `src/data/` directory
- Use consistent naming: `posts.ts` not `posts-data.ts`
- Update all imports when moving files
