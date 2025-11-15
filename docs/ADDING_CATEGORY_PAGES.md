# Adding Category Pages

The publication now treats categories as first-class records in the database instead of compile-time enums. Every reader surface (home rails, article cards, navigation, newsletter digests, etc.) reads from the `Category` table, so creating a new category is a content operation rather than a code change.

## 1. Create the category

1. Sign in to `/admin`.
2. Open `/admin/categories`.
3. Fill out the form:
   - **Display name** – Shown across the UI.
   - **Slug** – Becomes the URL under `/categories/[slug]`. Leave blank to auto-generate from the name.
   - **Description** – Appears on the category landing page and in the admin dashboard.
   - **Homepage rail title** *(optional)* – If set, the category will show up in the curated “Tracks” section on the homepage with this heading.
4. Submit the form. The layout, nav menu, and `/categories/[slug]` page will revalidate automatically.

## 2. Link to the page

Readers can now visit `/categories/<your-slug>` where a dynamic page lists every published article assigned to the category. You can:

- Drop the URL anywhere in the marketing site.
- Update navigation (if you want a top-level link) by editing `src/components/site-shell.tsx`.
- Reference it in newsletters or social posts—the route is pre-rendered on first request and stays in sync with future moves.

## 3. Highlight it on the homepage (optional)

If you want the category to appear in the “Tracks” rail on the homepage:

- Provide a **Homepage rail title** in the admin form.
- Add a compelling description so the card doesn’t render empty copy.
- Publish or move a few articles into the category so the carousel has content.

## 4. Assign articles

Use either submission flow or the admin Move menu:

1. From `/admin` or `/admin/articles`, click “Move to …”.
2. Pick the newly created category.
3. The system revalidates `/`, `/categories/[slug]`, `/admin`, and (if applicable) `/case-studies`.

All forms (`/submit`, `/admin/submit`) and the API now read categories from the database, so writers can immediately file into the new bucket without another deploy.

## When do I need custom code?

Only if the category requires a bespoke layout that differs from the shared template at `src/app/(site)/categories/[slug]/page.tsx`. In that case, create a dedicated route (e.g., `/special-series`) and reuse the data fetching logic, but most categories should rely on the dynamic page and require **zero** code changes.
