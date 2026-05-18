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

---

## Pattern: Navbar Dropdown Not Functional

### Symptoms
- Dropdown menu renders but doesn't open on hover/click
- Dropdown opens but immediately closes
- Dropdown hidden behind other content (z-index issue)
- Click on dropdown items doesn't navigate

### Root Cause
- Missing event handlers (onMouseEnter, onMouseLeave, onClick)
- No state management for open/closed state
- Missing z-index on dropdown container
- Dropdown positioned incorrectly (not absolute/relative)

### Best Fix
1. Add state management: `const [openDropdown, setOpenDropdown] = useState<string | null>(null)`
2. Add hover handlers: `onMouseEnter={() => setOpenDropdown('name')}` and `onMouseLeave={() => setOpenDropdown(null)}`
3. Add click handler for mobile: `onClick={() => setOpenDropdown(openDropdown === 'name' ? null : 'name')}`
4. Add high z-index: `className="... z-50"`
5. Ensure proper positioning: parent `relative`, dropdown `absolute`

### Commands
```typescript
// Correct dropdown structure:
<div className="relative" onMouseEnter={() => handleMouseEnter('dropdown-name')} onMouseLeave={handleMouseLeave}>
  <button onClick={() => handleClick('dropdown-name')}>
    Menu ▼
  </button>
  {openDropdown === 'dropdown-name' && (
    <div className="absolute left-0 top-full z-50 mt-2 ...">
      {/* dropdown items */}
    </div>
  )}
</div>
```

### Files Usually Involved
- `src/components/layout/Navbar.tsx`
- Any component with dropdown menus

### Prevention
- **ALWAYS test dropdowns manually in browser**, not just typecheck/build
- Test hover behavior (desktop)
- Test click behavior (mobile)
- Test navigation on dropdown item click
- Verify z-index doesn't conflict with other elements
- Check dropdown doesn't get cut off by parent overflow

### Lesson Learned
**Build passing ≠ feature working.** Interactive UI elements (dropdowns, modals, tabs) require manual browser testing, not just compile-time verification.

---

## Pattern: Double Heading on Pages

### Symptoms
- Pages display duplicate headings
- Category pages show both category-specific heading and generic "Gallery" heading
- Layout components render their own heading, then call a component that also renders a heading

### Root Cause
- Presentation components (like PostGrid) have hardcoded content (headings, descriptions)
- Layout components call these presentation components without knowing they contain headings
- Result: double headings, inconsistent page structure

### Best Fix
1. **Refactor presentation components to be pure** - accept data as props, no hardcoded content
2. **Layout components handle headings** - they know the page context and should render appropriate headings
3. **Page components assemble layouts** - pass appropriate props to layouts

### Commands
```typescript
// WRONG: PostGrid with hardcoded heading
export function PostGrid() {
  return (
    <div>
      <h1>Tunacosplay Gallery</h1>
      <div className="grid">
        {posts.map(post => <PostCard post={post} />)}
      </div>
    </div>
  );
}

// CORRECT: PostGrid as pure presentation component
export function PostGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid">
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  );
}

// Layout handles heading
export function CategoryPageLayout({ title, description, category }) {
  const filteredPosts = filterPostsByCategory(posts, category);
  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
      <PostGrid posts={filteredPosts} />
    </div>
  );
}
```

### Files Usually Involved
- Presentation components (PostGrid, CardList, etc.)
- Layout components (CategoryPageLayout, PageLayout, etc.)
- Page components (page.tsx files)

### Prevention
- **Keep presentation components pure** - no hardcoded content, accept all data as props
- **Layout components own page structure** - headings, descriptions, data filtering
- **Page components are thin** - just assemble layouts with appropriate props
- **Test each page visually** - ensure no duplicate headings or content

### Lesson Learned
Component hierarchy matters. Presentation components should be dumb (props in, UI out). Layout components should be smart (know context, filter data, render structure). Page components should be thin (just assembly).

---

## Pattern: Navbar Dropdowns Not Working

### Symptoms
- Dropdown buttons visible but clicking does nothing
- Dropdown menus never appear
- No console errors in browser
- Build passes but feature doesn't work

### Root Cause
- Missing event handlers (onClick not properly wired)
- Missing state management for open/closed state
- Missing click-outside detection
- Missing escape key handler
- Z-index too low (dropdown hidden behind other elements)
- Parent elements with overflow-hidden clipping dropdown
- Missing pointer-events-auto on dropdown panels

### Best Fix
1. **Use proper React state management** - useState for tracking which dropdown is open
2. **Add click-outside detection** - useEffect with document event listener
3. **Add escape key handler** - useEffect with keydown event listener
4. **Use high z-index** - z-[9999] or equivalent
5. **Add pointer-events-auto** - ensure dropdown panels are clickable
6. **Use button type="button"** - prevent form submission behavior
7. **Add aria attributes** - aria-expanded, aria-haspopup for accessibility
8. **Close dropdown on item click** - call closeDropdown in Link onClick
9. **Close one dropdown when another opens** - toggle logic in handleDropdownToggle

### Commands
```typescript
// CORRECT: Robust dropdown implementation
const [openDropdown, setOpenDropdown] = useState<'top' | 'level' | null>(null);

const handleDropdownToggle = (dropdown: 'top' | 'level') => {
  setOpenDropdown(openDropdown === dropdown ? null : dropdown);
};

const closeDropdown = () => {
  setOpenDropdown(null);
};

// Click outside detection
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (navRef.current && !navRef.current.contains(event.target as Node)) {
      closeDropdown();
    }
  };
  if (openDropdown) {
    document.addEventListener('mousedown', handleClickOutside);
  }
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [openDropdown]);

// Escape key handler
useEffect(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeDropdown();
    }
  };
  if (openDropdown) {
    document.addEventListener('keydown', handleEscape);
  }
  return () => {
    document.removeEventListener('keydown', handleEscape);
  };
}, [openDropdown]);
```

### Files Usually Involved
- Navbar component (src/components/layout/Navbar.tsx)
- Layout components that might clip dropdowns

### Prevention
- **Manual browser testing is MANDATORY** - Build passing does NOT mean dropdowns work
- **Test all interactive features in browser** - Click, hover, keyboard navigation
- **Do not assume build success = feature success** - Interactive UI requires manual verification
- **Use React DevTools** - Verify state changes when clicking
- **Check z-index hierarchy** - Ensure dropdowns appear above all content
- **Avoid Bootstrap + Tailwind conflicts** - Use one styling system consistently

### Lesson Learned
Build tools (typecheck, lint, build) only verify syntax and types. They cannot verify that interactive UI features work correctly. Dropdowns, modals, forms, and other interactive elements MUST be manually tested in a browser. Never claim a feature works without browser testing.

---

## Pattern: Video Category Filtering Wrong

### Symptoms
- Video Cosplay page only shows posts with category="video-cosplayy"
- Posts from other categories with videos are missing
- Filter logic is too restrictive

### Root Cause
- Using category-based filtering for video pages
- Video pages should filter by videoCount > 0, not by category
- Reusing category filter logic without considering special cases

### Best Fix
1. **Create dedicated video filter helper** - filterPostsWithVideo(posts)
2. **Add filterMode prop to layout** - 'category' | 'video'
3. **Use appropriate filter based on mode** - category filter for normal categories, video filter for video pages
4. **Keep normal category pages unchanged** - only video page uses special filtering

### Commands
```typescript
// Add helper in src/lib/posts.ts
export function filterPostsWithVideo(posts: Post[]): Post[] {
  return posts.filter((post) => post.videoCount > 0);
}

// Update CategoryPageLayout
interface CategoryPageLayoutProps {
  title: string;
  description?: string;
  category: string;
  filterMode?: 'category' | 'video';
}

const filteredPosts =
  filterMode === 'video'
    ? filterPostsWithVideo(posts)
    : filterPostsByCategory(posts, category);

// Update video page
<CategoryPageLayout
  title="Video Cosplay"
  description="Explore amazing video cosplay collections"
  category="video-cosplayy"
  filterMode="video"
/>
```

### Files Usually Involved
- src/lib/posts.ts (filter helpers)
- src/components/category/CategoryPageLayout.tsx (layout with filtering)
- src/app/category/video-cosplayy/page.tsx (video page)

### Prevention
- **Understand the business logic** - Video pages show all posts with videos, not just video category
- **Don't blindly reuse filters** - Different pages may need different filtering logic
- **Add filterMode or similar props** - Make filtering behavior explicit and configurable
- **Test with realistic data** - Ensure posts from multiple categories appear on video page

### Lesson Learned
Category-based filtering is not appropriate for all pages. Video pages, search results, and tag pages may need different filtering logic. Make filtering behavior explicit through props or separate components rather than assuming one filter fits all.

---

## Pattern: React onClick Dropdowns Not Firing in Production

### Symptoms
- Dropdown buttons visible but clicking does nothing in live preview
- No console logs appear when clicking dropdown triggers
- Build passes (typecheck, lint, build all succeed)
- Dev server works locally but production preview fails
- Browser console shows only HMR WebSocket errors, no React errors

### Root Cause
- React onClick handlers may not fire reliably in certain deployment environments
- Client-side hydration issues
- Event handler registration timing issues
- Complex React state management not working as expected in production

### Best Fix
**Use native HTML `<details>` and `<summary>` elements for simple navigation dropdowns.**

Native HTML elements work without JavaScript, are more reliable, and have better accessibility support.

### Commands
```typescript
// WRONG: React state dropdown (may not work in production)
const [open, setOpen] = useState(false);
<button onClick={() => setOpen(!open)}>Menu</button>
{open && <div>...</div>}

// CORRECT: Native HTML dropdown (always works)
<details className="group relative">
  <summary className="flex cursor-pointer list-none items-center gap-1">
    Menu
    <span className="transition group-open:rotate-180">▾</span>
  </summary>
  <div className="absolute left-0 top-full z-[9999] mt-2">
    <Link href="/page">Item</Link>
  </div>
</details>

// Hide default summary marker
<style jsx>{`
  summary::-webkit-details-marker {
    display: none;
  }
`}</style>
```

### Files Usually Involved
- src/components/layout/Navbar.tsx
- Any component with navigation dropdowns

### Prevention
- **Use native HTML elements when possible** - `<details>/<summary>` for dropdowns, `<dialog>` for modals
- **Test in production environment** - Dev server behavior ≠ production behavior
- **Prefer progressive enhancement** - Features should work without JavaScript when possible
- **Manual browser testing is MANDATORY** - Build passing does NOT verify interactive features work

### Lesson Learned
**Build passing ≠ feature working in production.** React onClick handlers that work in dev may fail in production due to hydration, timing, or environment issues. For simple navigation dropdowns, native HTML `<details>/<summary>` is more reliable than React state management. Always test interactive features in the actual deployment environment, not just local dev server.
