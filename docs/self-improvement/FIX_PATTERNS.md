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
