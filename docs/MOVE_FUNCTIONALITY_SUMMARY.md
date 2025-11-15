# Move Functionality – Current Architecture (Nov 2025)

## What changed

- The “Move to …” dropdown no longer reads from a hard-coded enum. It now receives the live category list fetched on the server (`getAllCategories`) and passed as props to `MoveToMenu`.
- `moveArticleToCategoryAction` accepts a `categoryId`, validates it, and revalidates all affected paths:
  - `/` (layout + rails + hero blocks)
  - `/admin`
  - `/categories/[slug]` for the target category
  - `/case-studies` when the slug is `case-studies`
  - The specific article page
- Admin dashboards (`/admin`, `/admin/articles`) preload the category list once per request and reuse it for filters and dropdowns, so every surface stays in sync without redeploys.

## Updated flow

1. **Admin clicks “Move to …”**
   - `MoveToMenu` receives `{ currentCategoryId, options }`.
   - Menu filters out the current category and shows labels pulled from the DB.
   - When a destination is clicked, the button closes immediately and the server action runs inside `useTransition`.

2. **Server action executes**
   - Validates the session (via `ensureAdmin`).
   - Fetches the destination category (`slug` needed for revalidation).
   - Updates the article’s `categoryId`.
   - Revalidates the homepage layout, admin pages, `/categories/${slug}`, `/case-studies` (if needed), and the article detail route.

3. **Client refresh**
   - When the action resolves, `router.refresh()` invalidates the current admin page so the move is visible without manual reloads.

## How to add a new category destination

No code changes required. Just visit `/admin/categories`, create the bucket, and it will appear automatically in:

- The Move dropdowns
- Submit forms
- Navigation “More” menu
- `/categories/[slug]` dynamic route

## Testing checklist when touching this area

- [ ] The dropdown lists every category except the current one.
- [ ] Moving an article updates the admin list immediately.
- [ ] The article appears on `/categories/[slug]` without stale data.
- [ ] `/case-studies` (redirect) reflects the change when applicable.
- [ ] Homepage hero/rails show the new category labels (if `railTitle` is set and the category has content).

## Relevant files

- `src/components/admin/move-to-menu.tsx`
- `src/app/(admin)/admin/articles/page.tsx`
- `src/app/(admin)/admin/page.tsx`
- `src/app/(admin)/admin/actions.ts` (`moveArticleToCategoryAction`, `createCategoryAction`)
- `src/lib/article-categories.ts` (shared category helpers)
