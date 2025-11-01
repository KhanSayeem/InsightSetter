# Move Functionality - Implementation Summary

## What Was Fixed

The "Move to" functionality in the admin panel now works reliably and is future-proof for new category pages.

## Changes Made

### 1. MoveToMenu Component (`src/components/admin/move-to-menu.tsx`)
**Before:** Hard-coded list of destinations
**After:** 
- Dynamically uses all categories from `ARTICLE_CATEGORY_OPTIONS`
- Added client-side state management with `useTransition()` and `useRouter()`
- Shows "Moving..." feedback during operation
- Automatically refreshes the page after moving
- Removed `method="post"` from form to fix React warning

### 2. Move Action (`src/app/(admin)/admin/actions.ts`)
**Before:** Static list of revalidation paths
**After:**
- Created `CATEGORY_ROUTES` mapping for all categories
- Dynamically revalidates all category pages using `Object.values(CATEGORY_ROUTES)`
- More aggressive cache invalidation with `'page'` and `'layout'` types

### 3. Case Studies Page (`src/app/(site)/case-studies/page.tsx`)
**Before:** Only had `export const revalidate = 0`
**After:** Added `export const dynamic = 'force-dynamic'` to prevent caching issues

### 4. Documentation
- Created `docs/ADDING_CATEGORY_PAGES.md` with step-by-step guide
- Includes complete template for new category pages
- Lists all critical configuration points

## How It Works Now

1. **Admin moves an article:**
   - User clicks "Move to →" button
   - Dropdown shows all categories except current one
   - User clicks a destination category
   - Button shows "Moving..." feedback
   
2. **Server action executes:**
   - Updates article's category in database
   - Revalidates all category page caches
   - Revalidates the specific article page
   - Returns success to client

3. **Client updates:**
   - Router refreshes to fetch new data
   - Article appears on the new category page
   - Article removed from old category page (if applicable)
   - Admin panel reflects the change

## Future-Proof Architecture

### Adding a New Category Page

You only need to do TWO things:

1. **Add route to `CATEGORY_ROUTES` map** in `src/app/(admin)/admin/actions.ts`:
```typescript
const CATEGORY_ROUTES: Record<ArticleCategory, string> = {
  // ... existing
  YOUR_NEW_CATEGORY: '/your-route-path',
};
```

2. **Create the page** at `src/app/(site)/[your-route]/page.tsx` with:
```typescript
export const revalidate = 0;
export const dynamic = 'force-dynamic';
```

That's it! Everything else is automatic:
- ✅ Dropdown automatically includes new category
- ✅ Cache invalidation happens automatically
- ✅ Move functionality works immediately

## Technical Details

### Cache Prevention Strategy
- `export const revalidate = 0`: Tells Next.js to revalidate on every request
- `export const dynamic = 'force-dynamic'`: Forces dynamic rendering (no static optimization)
- `revalidatePath(route, 'page')`: Server-side cache invalidation after mutations
- `router.refresh()`: Client-side data refresh after actions

### Why This Approach Works
1. **Dynamic category list**: `MoveToMenu` reads from `ARTICLE_CATEGORY_OPTIONS`, so new categories appear automatically
2. **Centralized routes**: `CATEGORY_ROUTES` mapping makes it easy to see all routes and add new ones
3. **Aggressive revalidation**: All category pages get invalidated on every move, preventing stale caches
4. **Client-side refresh**: `router.refresh()` forces immediate UI update without page reload

## Testing Checklist

When you add a new category page:
- [ ] Added route to `CATEGORY_ROUTES`
- [ ] Created page with `dynamic = 'force-dynamic'`
- [ ] Category appears in "Move to →" dropdown
- [ ] Moving article updates the new page
- [ ] Hard refresh shows the article (no cache issues)
- [ ] Admin panel reflects the move

## Related Files

- `src/components/admin/move-to-menu.tsx` - Move UI component
- `src/app/(admin)/admin/actions.ts` - Server actions including `moveArticleToCategoryAction`
- `src/lib/article-categories.ts` - Category metadata and options
- `src/app/(site)/case-studies/page.tsx` - Example category page implementation
- `prisma/schema.prisma` - ArticleCategory enum definition
