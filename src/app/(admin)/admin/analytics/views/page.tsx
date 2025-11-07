import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { Card } from '@/components/ui/card';
import { LinkButton } from '@/components/ui/link-button';

export const metadata: Metadata = {
  title: 'Most viewed (30d) - Admin',
};

export const revalidate = 0;
export const dynamic = 'force-dynamic';

function windowToDate(window: string | undefined) {
  const now = new Date();
  const w = (window ?? '30d').toLowerCase();
  const days = w === '7d' ? 7 : w === '90d' ? 90 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function parsePage(input: string | undefined, defaultValue = 1) {
  const n = Number(input);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : defaultValue;
}

const PER_PAGE = 50;

export default async function AdminMostViewedPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; window?: string }>;
}) {
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

  const params = (searchParams ? await searchParams : {}) ?? {};
  const page = parsePage(params.page);
  const since = windowToDate(params.window);

  // Fetch groups and total count
  const [groups, totalGroups] = await Promise.all([
    prisma.pageView.groupBy({
      by: ['articleId'],
      where: { occurredAt: { gte: since }, isBot: false },
      _count: { _all: true },
      orderBy: { _count: { articleId: 'desc' } },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.pageView.groupBy({
      by: ['articleId'],
      where: { occurredAt: { gte: since }, isBot: false },
      _count: { _all: true },
    }).then((rows) => rows.length),
  ]);

  const ids = groups.map((g) => g.articleId);
  const articles = ids.length
    ? await prisma.article.findMany({
        where: { id: { in: ids } },
        select: { id: true, title: true, slug: true },
      })
    : [];
  const byId = new Map(articles.map((a) => [a.id, a] as const));
  const rows = groups
    .map((g) => ({ article: byId.get(g.articleId), views: g._count._all }))
    .filter((x): x is { article: { id: string; title: string; slug: string }; views: number } => Boolean(x.article));

  const totalPages = Math.max(1, Math.ceil(totalGroups / PER_PAGE));

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Most viewed (last 30 days)</h1>
            <p className="mt-1 text-sm text-muted-foreground">All articles by view count over the selected window.</p>
          </div>
          <LinkButton href="/admin">← Back to Dashboard</LinkButton>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No view data yet.</p>
        ) : (
          <ul className="divide-y divide-border/70">
            {rows.map(({ article, views }) => (
              <li key={article.id} className="flex items-center justify-between px-5 py-3">
                <Link href={`/articles/${article.slug}`} className="truncate text-muted-foreground hover:text-foreground hover:underline">
                  {article.title}
                </Link>
                <span className="shrink-0 font-semibold text-foreground">{views}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <LinkButton href={`/admin/analytics/views?page=${Math.max(1, page - 1)}`}>Previous</LinkButton>
          <LinkButton href={`/admin/analytics/views?page=${Math.min(totalPages, page + 1)}`}>Next</LinkButton>
        </div>
      </div>
    </div>
  );
}
