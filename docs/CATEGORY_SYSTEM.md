# Category System Overview

> Status: ✅ Dynamic – Categories live in the database and can be managed entirely through the admin UI.

## Data and schema

- `prisma/schema.prisma` defines a `Category` model with `label`, `slug`, `description`, `railTitle`, timestamps, and the `articles` relation.
- `Article.categoryId` is a required FK (set via Prisma relation). All reads now join `category` when we need labels, slugs, or descriptions.
- The helper `src/lib/article-categories.ts` exports:
  - `getAllCategories()` – cached server function to fetch categories for navigation/forms.
  - `getCategoryBySlug()`/`getCategoryById()` – helpers for dynamic pages.
  - `DEFAULT_CATEGORY_SEED` – source of truth for the initial set if you need to bootstrap an environment.

## Admin flows

- `/admin/categories` lists existing categories and exposes the create form (`CategoryCreateForm`).
- The form submits to `createCategoryAction`, which validates the slug, creates the row, and revalidates:
  - `/admin/categories`
  - `/admin`
  - `/` (layout + nav)
  - `/categories/[slug]` and `/case-studies` (if the slug matches)
- `/admin/articles` and `/admin` dashboards preload category options once per request and pass them into `MoveToMenu`.
- All submission forms (`/admin/submit`, `/submit`) load categories on the server and feed them to client components so authors always see the latest list.

## Reader-facing surfaces

1. **Navigation:** `SiteShell` renders a “More” dropdown fed by `getAllCategories()`. Mobile menu shows them inline.
2. **Homepage rails:** Any category with a `railTitle` appears automatically in the “Tracks” section. The cards use the category’s label/description.
3. **Section blocks:** Fast Takes, Deep Dives, Case Studies, etc., now look up categories by slug (e.g., `fast-takes`, `deep-dives`, `case-studies`). Labels/links stay in sync with admin edits.
4. **Dynamic pages:** `/categories/[slug]` renders every published article for that category. `/case-studies` simply redirects to the `case-studies` slug for backwards compatibility.
5. **Article details / favorites / API:** All cards display `article.category?.label` and link to `/categories/[slug]`.
6. **Newsletter digest:** Pulls `article.category.label` for each entry.

## Author & reader workflows

- Authors pick from the live category list when submitting pitches (client forms receive the categories via props).
- Admins can move articles via the dropdown; `moveArticleToCategoryAction` now takes a `categoryId`, ensures the record exists, and revalidates `/categories/${slug}` plus `/case-studies` if needed.
- Readers discover categories from the nav dropdown, homepage rails, card tags, and the `/categories/[slug]` route.

## Migration + maintenance tips

1. **Bootstrap categories:** Run `seed.js` (now upserts “Markets & Macro”) or use `/admin/categories` before creating articles; otherwise mutations will fail because `categoryId` is required.
2. **Backfill legacy data:** After deploying the schema, update existing rows with the appropriate `categoryId` (one-off SQL or Prisma script).
3. **Slug collisions:** The admin action prevents duplicates. If you rename a category, update the slug via direct DB edit or a script—then revalidate `/categories/[old-slug]` if you keep redirects.
4. **Homepage rails management:** Ask editors to fill the “Homepage rail title” field for any category that should appear in the Tracks grid. Leaving it blank hides that category from the rail section but still keeps it accessible via `/categories/[slug]` and the “More” dropdown.
5. **Testing:** When adding new surfaces, import `getAllCategories()` server-side instead of hardcoding enums to keep everything in sync.

With this system, adding or renaming a category is an operational task: no code changes, no redeploy, and every surface stays consistent. Use the admin UI for day-to-day management and only touch code if you need bespoke layouts for a specific category.
