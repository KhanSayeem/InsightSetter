import type { Metadata } from 'next';
import type { Prisma } from '@prisma/client';
import { ArticleStatus } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import { LinkButton } from '@/components/ui/link-button';
import { CopyLinkButton } from '@/components/copy-link-button';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getAllCategories } from '@/lib/article-categories';
import { MoveToMenu } from '@/components/admin/move-to-menu';
import { deleteArticleAction } from '../actions';

export const metadata: Metadata = {
  title: 'Manage Articles - Admin',
};

export const revalidate = 0;
export const dynamic = 'force-dynamic';

const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });

type SearchParams = {
  q?: string;
  category?: string;
  page?: string;
};

type ArticlesPageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function AdminArticlesPage({ searchParams }: ArticlesPageProps) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="text-muted-foreground">Access denied. Please log in.</p>
        <LinkButton href="/admin" className="mt-4">
          Go to Admin
        </LinkButton>
      </div>
    );
  }

  const resolvedParams = (searchParams ? await searchParams : {}) ?? {};
  const query = resolvedParams.q?.trim() || '';
  const categoryFilter = resolvedParams.category || '';
  const page = parseInt(resolvedParams.page || '1', 10);
  const perPage = 50;

  // Build where clause
  const where: Prisma.ArticleWhereInput = {
    status: ArticleStatus.PUBLISHED,
  };

  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { authorName: { contains: query, mode: 'insensitive' } },
      { slug: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (categoryFilter && categoryFilter !== 'all') {
    where.categoryId = categoryFilter;
  }

  const [categories, articles, totalCount] = await Promise.all([
    getAllCategories(),
    prisma.article.findMany({
      where,
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        title: true,
        slug: true,
        authorName: true,
        publishedAt: true,
        category: {
          select: {
            id: true,
            label: true,
          },
        },
        tags: true,
      },
    }),
    prisma.article.count({ where }),
  ]);

  // Fetch view counts for the current page of articles
  const ids = articles.map(a => a.id);
  const viewGroups = ids.length > 0 ? await prisma.pageView.groupBy({
    by: ['articleId'],
    where: { articleId: { in: ids }, isBot: false },
    _count: { _all: true },
  }) : [];
  const viewCountMap = new Map<string, number>(viewGroups.map(g => [g.articleId, g._count._all]));

  const totalPages = Math.ceil(totalCount / perPage);
  const categoryOptions = categories.map((category) => ({ id: category.id, label: category.label }));

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Manage Published Articles</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Search, filter, and re-categorize your published content
            </p>
          </div>
          <LinkButton href="/admin">
            ← Back to Dashboard
          </LinkButton>
        </div>
      </Card>

      {/* Search and Filters */}
      <Card className="p-5">
        <form method="get" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by title, author, or slug..."
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground shadow-sm transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <select
              name="category"
              defaultValue={categoryFilter}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground shadow-sm transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
            <Button type="submit" size="md">
              Search
            </Button>
          </div>
          {(query || categoryFilter) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Found {totalCount} article{totalCount !== 1 ? 's' : ''}
              <a
                href="/admin/articles"
                className="ml-2 text-primary hover:underline"
              >
                Clear filters
              </a>
            </div>
          )}
        </form>
      </Card>

      {/* Articles List */}
      {articles.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {query || categoryFilter ? 'No articles match your search.' : 'No articles published yet.'}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-border/70">
            {articles.map((article) => (
              <li
                key={article.id}
                className="flex flex-col gap-3 px-5 py-4 transition hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-semibold text-foreground">{article.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {article.authorName}{' '}
                    <span className="mx-1 text-muted-foreground/60">|</span>
                    {dateFormatter.format(article.publishedAt ?? new Date())}
                    <span className="mx-1 text-muted-foreground/60">|</span>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{article.slug}</code>
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    {article.category ? (
                      <Tag variant="outline" className="border-border/70 bg-background/70 px-3 py-1 text-xs">
                        {article.category.label}
                      </Tag>
                    ) : null}
                    <span className="text-xs text-muted-foreground">
                      Views: {viewCountMap.get(article.id) ?? 0}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.slice(0, 3).map((tag) => (
                        <Tag key={tag} variant="muted" className="px-2 py-1 text-xs lowercase">
                          #{tag}
                        </Tag>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{article.tags.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
                  <LinkButton href={`/articles/${article.slug}`} prefetch={false} className="w-full sm:w-auto">
                    Read
                  </LinkButton>
                  <CopyLinkButton href={`/articles/${article.slug}`} />
                  <MoveToMenu
                    articleId={article.id}
                    currentCategoryId={article.category?.id ?? ''}
                    options={categoryOptions}
                  />
                  <form
                    action={deleteArticleAction.bind(null, article.id, article.slug)}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      type="submit"
                      variant="destructive"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Delete
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <LinkButton
                  href={`/admin/articles?q=${query}&category=${categoryFilter}&page=${page - 1}`}
                >
                  ← Previous
                </LinkButton>
              )}
              {page < totalPages && (
                <LinkButton
                  href={`/admin/articles?q=${query}&category=${categoryFilter}&page=${page + 1}`}
                >
                  Next →
                </LinkButton>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
