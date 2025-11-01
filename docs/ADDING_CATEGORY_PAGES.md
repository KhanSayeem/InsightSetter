# Adding New Category Pages

This guide explains how to add new category pages (like `/case-studies`, `/deep-dives`, etc.) to ensure they work seamlessly with the admin "Move to" functionality.

## Prerequisites

1. Ensure your category exists in the `ArticleCategory` enum in `prisma/schema.prisma`
2. Add the category metadata to `src/lib/article-categories.ts` in the `ARTICLE_CATEGORY_META` object

## Steps to Add a New Category Page

### 1. Update the Category Routes Map

In `src/app/(admin)/admin/actions.ts`, update the `CATEGORY_ROUTES` constant:

```typescript
const CATEGORY_ROUTES: Record<ArticleCategory, string> = {
  MARKETS_MACRO: '/markets-macro',
  OPERATORS: '/operators',
  CAPITAL_STRATEGY: '/capital-strategy',
  FAST_TAKE: '/fast-takes',
  DEEP_DIVE: '/deep-dives',
  CASE_STUDY: '/case-studies',
  // Add your new category here:
  // YOUR_NEW_CATEGORY: '/your-route-path',
};
```

### 2. Create the Category Page

Create a new page at `src/app/(site)/[your-category-slug]/page.tsx` using this template:

```typescript
import Link from 'next/link';
import type { Metadata } from 'next';
import type { Prisma } from '@prisma/client';
import { ArticleCategory, ArticleStatus } from '@prisma/client';

import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import { prisma } from '@/lib/prisma';
import { ARTICLE_CATEGORY_META } from '@/lib/article-categories';

export const metadata: Metadata = {
  title: 'Your Category Title',
  description: 'Your category description',
};

const dateFmt = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });

function excerpt(summary: string | null, content: string, len = 200) {
  const src = (summary ?? content).trim();
  return src.length <= len ? src : `${src.slice(0, len - 3)}...`;
}

// IMPORTANT: These exports prevent caching issues
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function YourCategoryPage() {
  const select = {
    id: true,
    title: true,
    summary: true,
    content: true,
    slug: true,
    authorName: true,
    publishedAt: true,
    createdAt: true,
    tags: true,
  } as const satisfies Prisma.ArticleSelect;

  const articles = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      // Option 1: Simple category filter
      category: ArticleCategory.YOUR_CATEGORY,
      
      // Option 2: Category + tags filter (like case-studies does)
      // OR: [
      //   { category: ArticleCategory.YOUR_CATEGORY },
      //   {
      //     tags: {
      //       hasSome: ['your-tag', 'Your Tag', 'another-tag'],
      //     },
      //   },
      // ],
    },
    orderBy: [
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
    select,
  });

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <Tag variant="primary" className="w-fit tracking-[0.3em] text-primary/80">
          {ARTICLE_CATEGORY_META.YOUR_CATEGORY.label}
        </Tag>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Your Category Title
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          {ARTICLE_CATEGORY_META.YOUR_CATEGORY.description}
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {articles.map((a) => (
          <Card key={a.id} className="group space-y-3 p-6 shadow-md">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              <span>{dateFmt.format(a.publishedAt ?? a.createdAt)}</span>
              <span className="text-muted-foreground/50">|</span>
              <span>{a.authorName}</span>
            </div>
            <h2 className="text-xl font-semibold leading-tight">
              <Link href={`/articles/${a.slug}`} className="transition hover:text-primary">
                {a.title}
              </Link>
            </h2>
            <p className="text-sm text-muted-foreground">{excerpt(a.summary, a.content)}</p>
          </Card>
        ))}
        {articles.length === 0 && (
          <p className="text-sm text-muted-foreground">No articles published yet.</p>
        )}
      </div>
    </section>
  );
}
```

## Key Points

### ⚠️ Critical for "Move to" Functionality

1. **Add route to `CATEGORY_ROUTES`**: This ensures the page gets revalidated when articles are moved
2. **Include `export const dynamic = 'force-dynamic'`**: Prevents caching issues in dev and production
3. **Include `export const revalidate = 0`**: Additional cache control

### Automatic Features

Once you follow the steps above, the following will work automatically:

- ✅ Articles can be moved to your new category from the admin panel
- ✅ The "Move to →" dropdown will include your new category
- ✅ Cache invalidation happens automatically when articles are moved
- ✅ Category label/description comes from `ARTICLE_CATEGORY_META`

## Example: Adding a "Deep Dives" Page

1. Update `CATEGORY_ROUTES`:
```typescript
const CATEGORY_ROUTES: Record<ArticleCategory, string> = {
  // ... existing routes
  DEEP_DIVE: '/deep-dives',
};
```

2. Create `src/app/(site)/deep-dives/page.tsx` following the template above

3. Replace `YOUR_CATEGORY` with `DEEP_DIVE` in the template

4. Done! The admin "Move to" functionality will automatically include "Deep Dives"

## Troubleshooting

If articles don't appear after moving:

1. Check that `CATEGORY_ROUTES` includes your route
2. Verify `export const dynamic = 'force-dynamic'` is present
3. Hard refresh the page (Ctrl+Shift+R)
4. Restart the dev server

## Testing

After adding a new category page:

1. Navigate to `/admin`
2. Click "Move to →" on any published article
3. Confirm your new category appears in the dropdown
4. Move an article to your category
5. Visit your new category page and verify the article appears
