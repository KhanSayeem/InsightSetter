# Category System Documentation

## Overview

InsightSetter uses a robust category system where each article belongs to exactly ONE category at a time. Categories determine where articles appear on the site.

## Key Principles

### 1. **One Article, One Category**
- Every published article has exactly one `category` field
- Moving an article to a new category automatically removes it from the old category
- Tags are supplementary metadata and don't affect category placement

### 2. **Category is Source of Truth**
- Category pages (e.g., `/case-studies`) only show articles where `category = CASE_STUDY`
- Tags like "Case Study" don't make an article appear on category pages
- This prevents confusion when articles are moved between categories

### 3. **Automatic Homepage Sections**
- When you add a new category, it automatically appears in relevant homepage sections
- No code changes needed for new categories to work

## Fixed Issues

### Problem: Articles Appearing in Wrong Categories
**Symptom:** After moving "Revolut" from Case Studies to Fast Takes, it still appeared on `/case-studies`

**Root Cause:** The case-studies page had an `OR` condition that matched articles either by:
1. Category = CASE_STUDY, OR
2. Tags contain "Case Study"

Since Revolut had "Case Study" in its tags, it still showed up even after being moved.

**Solution:** Removed tag-based filtering. Now category pages only query by `category` field.

```typescript
// BEFORE (incorrect)
where: {
  status: ArticleStatus.PUBLISHED,
  OR: [
    { category: ArticleCategory.CASE_STUDY },
    { tags: { hasSome: ['case study', 'Case Study'] } }
  ]
}

// AFTER (correct)
where: {
  status: ArticleStatus.PUBLISHED,
  category: ArticleCategory.CASE_STUDY,
}
```

## Homepage Structure

The homepage dynamically shows sections for different categories:

### Current Sections (in order):
1. **Featured Dispatch** - Latest published article
2. **Fast Takes** - Quick reads from FAST_TAKE category
3. **Curated Rails** - Articles from RAIL_CATEGORIES (Markets/Macro, Operators, Capital Strategy)
4. **Deep Dives** - Long-form content from DEEP_DIVE category
5. **Case Studies** - Real-world playbooks from CASE_STUDY category
6. **Newsletter Signup**
7. **Community Stats**

### Adding a New Category Section

To add a dedicated section for a new category (like you did for Case Studies):

1. **Add query in `loadArticles()` function:**
```typescript
const [fastTakeArticles, allCategoryBuckets, deepDiveArticles, caseStudyArticles, yourNewCategory]: [
  ArticlePreview[],
  RailBucket[],
  ArticlePreview[],
  ArticlePreview[],
  ArticlePreview[], // New category
] = await Promise.all([
  // ... existing queries
  prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      category: ArticleCategory.YOUR_NEW_CATEGORY,
    },
    orderBy: [
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 4, // Number of articles to show
    select: articleSelect,
  }),
]);
```

2. **Add to return statement:**
```typescript
return { 
  latestArticles, 
  featuredArticle, 
  secondaryArticles, 
  deepDives, 
  caseStudies,
  yourNewCategory, // Add here
  rails 
};
```

3. **Extract in component:**
```typescript
const { featuredArticle, secondaryArticles, deepDives, caseStudies, yourNewCategory, rails } = articleData;
```

4. **Add JSX section:**
```tsx
{yourNewCategory.length > 0 && (
  <section id="your-category-slug" className="space-y-6">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          {ARTICLE_CATEGORY_META.YOUR_NEW_CATEGORY.label}
        </p>
        <h2 className="text-2xl font-semibold text-foreground">Your Section Title</h2>
      </div>
      <LinkButton href="/your-category-page" icon={<ArrowIcon className="h-4 w-4" />} size="sm">
        View all
      </LinkButton>
    </header>
    <div className="grid gap-6 md:grid-cols-2">
      {yourNewCategory.map((article) => (
        {/* Article card JSX - copy from existing section */}
      ))}
    </div>
  </section>
)}
```

## Category Page Template

When creating a dedicated category page (e.g., `/case-studies`):

### Critical Requirements:
1. ✅ Query by `category` field only (not tags)
2. ✅ Include `export const revalidate = 0;`
3. ✅ Include `export const dynamic = 'force-dynamic';`
4. ✅ Filter by `status: ArticleStatus.PUBLISHED`

### Example:
```typescript
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function YourCategoryPage() {
  const articles = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      category: ArticleCategory.YOUR_CATEGORY, // Source of truth
    },
    orderBy: [
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
    select: {
      // ... fields
    },
  });
  
  // ... render
}
```

## Moving Articles Between Categories

### Via Admin Panel

1. Navigate to `/admin` or `/admin/articles`
2. Find the article (use search if needed)
3. Click "Move to →" dropdown
4. Select destination category
5. ✅ Article is moved instantly
6. ✅ All pages refresh automatically

### What Happens Behind the Scenes

When an article is moved:

1. **Database Update:**
   ```sql
   UPDATE "Article" 
   SET "category" = 'NEW_CATEGORY', "updatedAt" = NOW() 
   WHERE "id" = 'article-id'
   ```

2. **Cache Invalidation:**
   - Homepage: `/`
   - All category pages: `/case-studies`, `/deep-dives`, etc.
   - Admin dashboard: `/admin`
   - Article page: `/articles/[slug]`

3. **Client Refresh:**
   - Router refreshes to fetch new data
   - Changes visible immediately

## Tags vs Categories

### Categories (Primary Organization)
- ✅ Source of truth for article placement
- ✅ Determines which category page shows the article
- ✅ One category per article
- ✅ Used for homepage sections

### Tags (Secondary Metadata)
- ✅ Additional context/keywords
- ✅ Used for search and filtering
- ✅ Multiple tags per article
- ❌ **Do NOT use tags for category filtering**

## Testing Checklist

When working with categories:

- [ ] Move an article between categories in admin
- [ ] Verify it appears on the new category page
- [ ] Verify it does NOT appear on the old category page
- [ ] Check homepage sections update correctly
- [ ] Hard refresh (Ctrl+Shift+R) if caching issues persist
- [ ] Verify `/admin/articles` shows correct category badge

## Common Issues

### Article still shows in old category after move
**Solution:** Hard refresh the page (Ctrl+Shift+R)

### New category doesn't appear in "Move to →" dropdown
**Solution:** Check that category exists in `ARTICLE_CATEGORY_OPTIONS` in `src/lib/article-categories.ts`

### Category page not found
**Solution:** Create the page at `src/app/(site)/[category-slug]/page.tsx` following the template

## Related Files

- `src/lib/article-categories.ts` - Category metadata
- `src/app/(site)/page.tsx` - Homepage with category sections
- `src/app/(site)/case-studies/page.tsx` - Example category page
- `src/app/(admin)/admin/actions.ts` - Move action and cache invalidation
- `src/components/admin/move-to-menu.tsx` - Move UI component
- `prisma/schema.prisma` - ArticleCategory enum
