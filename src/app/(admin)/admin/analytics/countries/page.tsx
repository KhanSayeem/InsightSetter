import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { Card } from '@/components/ui/card';
import { LinkButton } from '@/components/ui/link-button';

export const metadata: Metadata = {
  title: 'Top countries (30d) - Admin',
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

const PER_PAGE = 100;

export default async function AdminTopCountriesPage({
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

  const [groups, totalGroups] = await Promise.all([
    prisma.pageView.groupBy({
      by: ['countryCode'],
      where: { occurredAt: { gte: since }, isBot: false },
      _count: { _all: true },
      orderBy: { _count: { articleId: 'desc' } },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.pageView.groupBy({
      by: ['countryCode'],
      where: { occurredAt: { gte: since }, isBot: false },
      _count: { _all: true },
    }).then((rows) => rows.length),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalGroups / PER_PAGE));

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Top countries (last 30 days)</h1>
            <p className="mt-1 text-sm text-muted-foreground">All countries by view count over the selected window.</p>
          </div>
          <LinkButton href="/admin">← Back to Dashboard</LinkButton>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {groups.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No view data yet.</p>
        ) : (
          <ul className="divide-y divide-border/70">
            {groups.map((row) => (
              <li key={row.countryCode ?? '??'} className="flex items-center justify-between px-5 py-3">
                <span className="text-muted-foreground">{row.countryCode ?? 'Unknown'}</span>
                <span className="shrink-0 font-semibold text-foreground">{row._count._all}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <LinkButton href={`/admin/analytics/countries?page=${Math.max(1, page - 1)}`}>Previous</LinkButton>
          <LinkButton href={`/admin/analytics/countries?page=${Math.min(totalPages, page + 1)}`}>Next</LinkButton>
        </div>
      </div>
    </div>
  );
}
