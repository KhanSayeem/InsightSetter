import type { Metadata } from 'next';
import type { SVGProps } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LinkButton } from '@/components/ui/link-button';
import { Tag } from '@/components/ui/tag';
import { ArticleStatus } from '@/generated/prisma-client/enums';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { ARTICLE_CATEGORY_META } from '@/lib/article-categories';
import { DigestSenderForm } from '@/components/admin/digest-sender-form';
import { SubscriberStatus } from '@/generated/prisma-client/enums';
import { publishArticleAction, rejectArticleAction } from './actions';
import LoginForm from './login-form';

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});

const dateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
});

export const metadata: Metadata = {
  title: 'Admin dashboard',
};

export const revalidate = 0;

type AdminPageSearchParams = { auth?: string; next?: string };

type AdminPageProps = {
  searchParams?: AdminPageSearchParams | Promise<AdminPageSearchParams>;
};

function timeAgo(date: Date) {
  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (Math.abs(diffMinutes) < 60) {
    return relativeTimeFormatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeTimeFormatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  return relativeTimeFormatter.format(diffDays, 'day');
}

function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.5 10h9m0 0-3.5-3.5M13.5 10l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const authed = await isAdminAuthenticated();
  const passwordConfigured = Boolean(process.env.ADMIN_PASSWORD?.trim());
  const resolvedSearchParams: AdminPageSearchParams =
    (searchParams ? await searchParams : undefined) ?? {};
  const nextPath = resolvedSearchParams.next ?? undefined;
  const authStatus = resolvedSearchParams.auth;

  if (!authed) {
    if (!passwordConfigured) {
      return (
        <div className="mx-auto max-w-xl">
          <Card className="space-y-4 p-8 shadow-lg">
            <header className="space-y-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                InsightSetter admin
              </p>
              <h1 className="text-2xl font-semibold text-foreground">Moderator access unavailable</h1>
            </header>
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <strong>ADMIN_PASSWORD</strong> is not configured. Add it to your environment and redeploy to unlock the
              editorial console.
            </p>
            <p className="text-sm text-muted-foreground">
              Example <code>.env.local</code> entry:&nbsp;
              <code>ADMIN_PASSWORD=super-secure-passphrase</code>.
            </p>
          </Card>
        </div>
      );
    }

    const statusMessage =
      authStatus === 'expired'
        ? 'Your session expired. Re-enter the password to continue.'
        : authStatus === 'required'
          ? 'Enter the admin password to continue.'
          : undefined;

    return (
      <div className="mx-auto max-w-xl space-y-6">
        <header className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            InsightSetter admin
          </p>
          <h1 className="text-3xl font-semibold text-foreground">Moderator access</h1>
          <p className="text-sm text-muted-foreground">
            Use the shared password to review submissions, publish stories, and manage the queue.
          </p>
        </header>
        {statusMessage ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {statusMessage}
          </p>
        ) : null}
        <LoginForm nextPath={nextPath} passwordConfigured />
      </div>
    );
  }

  const [pending, recentPublished, publishedCount, rejectedCount] = await Promise.all([
    prisma.article.findMany({
      where: { status: ArticleStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        authorName: true,
        authorEmail: true,
        createdAt: true,
        category: true,
        tags: true,
      },
    }),
    prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        authorName: true,
        publishedAt: true,
        category: true,
        tags: true,
      },
    }),
    prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
    prisma.article.count({ where: { status: ArticleStatus.REJECTED } }),
  ]);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    submissionsLast7Days,
    publishedLast7Days,
    queuedByCategory,
    publishedByCategory,
    reviewDurations,
    tagSamples,
    totalSubscribers,
    newSubscribersLast7Days,
  ] = await Promise.all([
    prisma.article.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.article.count({
      where: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.article.groupBy({
      by: ['category'],
      _count: { _all: true },
      where: { status: ArticleStatus.PENDING },
    }),
    prisma.article.groupBy({
      by: ['category'],
      _count: { _all: true },
      where: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.article.findMany({
      select: { submittedAt: true, reviewedAt: true },
    }),
    prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: { gte: thirtyDaysAgo },
        tags: { isEmpty: false },
      },
      select: { tags: true },
    }),
    prisma.subscriber.count({
      where: { status: SubscriberStatus.ACTIVE },
    }),
    prisma.subscriber.count({
      where: {
        status: SubscriberStatus.ACTIVE,
        createdAt: { gte: sevenDaysAgo },
      },
    }),
  ]);

  const completedReviews = reviewDurations.filter(
    (item): item is { submittedAt: Date; reviewedAt: Date } =>
      Boolean(item.submittedAt && item.reviewedAt),
  );

  const averageReviewHours =
    completedReviews.length === 0
      ? null
      : completedReviews.reduce((total, item) => {
          const diffMs = item.reviewedAt.getTime() - item.submittedAt.getTime();
          return total + diffMs / (1000 * 60 * 60);
        }, 0) / completedReviews.length;

  const tagCounts = new Map<string, number>();
  for (const { tags } of tagSamples) {
    tags.forEach((tag) => {
      const key = tag.toLowerCase();
      tagCounts.set(key, (tagCounts.get(key) ?? 0) + 1);
    });
  }

  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-10">
      <Card
        as="header"
        id="overview"
        className="flex flex-col gap-6 p-8 shadow-lg sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            InsightSetter admin
          </p>
          <h1 className="text-3xl font-semibold text-foreground">Editorial queue</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Review pending submissions, keep track of recent publications, and share notes with contributors.
          </p>
        </div>
      </Card>

      <section id="stats" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Pending</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{pending.length}</p>
          <p className="text-sm text-muted-foreground">Awaiting review</p>
        </Card>
        <Card className="rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Published</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{publishedCount}</p>
          <p className="text-sm text-muted-foreground">Live on site</p>
        </Card>
        <Card className="rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Rejected</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{rejectedCount}</p>
          <p className="text-sm text-muted-foreground">With notes</p>
        </Card>
        <Card className="rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Subscribers</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{totalSubscribers}</p>
          <p className="text-sm text-muted-foreground">{newSubscribersLast7Days} new this week</p>
        </Card>
      </section>

      <section id="analytics" className="space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Analytics
            </p>
            <h2 className="text-xl font-semibold text-foreground">Signal from the queue</h2>
            <p className="text-sm text-muted-foreground">
              Submission velocity, reviewer throughput, and the formats readers are gravitating toward.
            </p>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-4">
          <Card className="space-y-3 rounded-2xl border border-border/70 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Submissions (7d)
            </p>
            <p className="text-3xl font-semibold text-foreground">{submissionsLast7Days}</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">{publishedLast7Days}</span> approved during the same window.
            </p>
          </Card>
          <Card className="space-y-3 rounded-2xl border border-border/70 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Avg. review turnaround
            </p>
            <p className="text-3xl font-semibold text-foreground">
              {averageReviewHours === null ? '—' : `${Math.round(averageReviewHours)}h`}
            </p>
            <p className="text-sm text-muted-foreground">
              Across {completedReviews.length} reviewed submissions all-time.
            </p>
          </Card>
          <Card className="space-y-3 rounded-2xl border border-border/70 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Categories spotlight
            </p>
            <div className="space-y-2">
              {publishedByCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Publish a few pieces to see the monthly mix.
                </p>
              ) : (
                publishedByCategory.map(({ category, _count }) => (
                  <div key={category} className="flex items-center justify-between text-sm">
                    <span>{ARTICLE_CATEGORY_META[category].label}</span>
                    <span className="font-semibold text-foreground">{_count?._all ?? 0}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
          <Card className="space-y-3 rounded-2xl border border-border/70 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Latest approvals
            </p>
            <div className="space-y-2">
              {recentPublished.length === 0 ? (
                <p className="text-sm text-muted-foreground">Approve a few stories to populate this list.</p>
              ) : (
                recentPublished.slice(0, 3).map((article) => (
                  <div key={article.id} className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{article.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {ARTICLE_CATEGORY_META[article.category].label} •{' '}
                      {dateFormatter.format(article.publishedAt ?? new Date())}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Card className="space-y-4 rounded-2xl border border-border/70 p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Queue by category</h3>
              <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Pending
              </span>
            </header>
            <div className="space-y-3">
              {queuedByCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing in review right now. Fresh pitches will appear here automatically.
                </p>
              ) : (
                queuedByCategory.map(({ category, _count }) => (
                  <div key={category} className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {ARTICLE_CATEGORY_META[category].label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ARTICLE_CATEGORY_META[category].description}
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{_count?._all ?? 0}</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="space-y-4 rounded-2xl border border-border/70 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">Top tags (30d)</h3>
            {topTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Encourage contributors to add tags so readers can find related stories.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {topTags.map(([tag, count]) => (
                  <li key={tag} className="flex items-center justify-between">
                    <span className="lowercase text-muted-foreground">#{tag}</span>
                    <span className="font-semibold text-foreground">{count}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-border/70 pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Send digest
              </h4>
              <DigestSenderForm />
            </div>
          </Card>
        </div>
      </section>

      <section id="queue" className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Pending submissions</h2>
            <p className="text-sm text-muted-foreground">
              Approve standout insights, or send notes back to the contributor.
            </p>
          </div>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            {pending.length} in queue
          </span>
        </header>

        {pending.length === 0 ? (
          <Card className="border-dashed px-6 py-10 text-center text-muted-foreground">
            The submission queue is clear. New pitches will appear here automatically.
          </Card>
        ) : (
          <div className="space-y-5">
            {pending.map((submission) => (
              <Card
                key={submission.id}
                as="article"
                className="space-y-5 p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{submission.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {submission.authorName}
                      {submission.authorEmail ? (
                        <>
                          <span className="mx-2 text-muted-foreground/60">|</span>
                          <a
                            href={`mailto:${submission.authorEmail}`}
                            className="font-medium text-primary transition hover:text-primary/80 hover:underline"
                          >
                            {submission.authorEmail}
                          </a>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Submitted {timeAgo(submission.createdAt)}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {(submission.summary && submission.summary.trim()) ||
                    `${submission.content.slice(0, 240)}.`}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Tag variant="outline" className="border-border/70 bg-background/70 px-3 py-1">
                    {ARTICLE_CATEGORY_META[submission.category].label}
                  </Tag>
                  {submission.tags.map((tag) => (
                    <Tag key={tag} variant="muted" className="px-3 py-1 text-xs lowercase">
                      #{tag}
                    </Tag>
                  ))}
                </div>
                <details className="rounded-2xl border border-border/80 bg-background/60 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-foreground">
                    Read full submission
                  </summary>
                  <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground whitespace-pre-wrap">
                    {submission.content}
                  </div>
                </details>

                <div className="flex flex-col gap-4 border-t border-border/70 pt-4 sm:flex-row sm:items-start sm:justify-between">
                  <form action={publishArticleAction.bind(null, submission.id)}>
                    <Button type="submit" size="md">
                      Approve & publish
                    </Button>
                  </form>
                  <details className="w-full sm:w-auto">
                    <summary className="cursor-pointer text-sm font-semibold text-muted-foreground transition hover:text-foreground">
                      Send back with notes
                    </summary>
                    <form
                      action={rejectArticleAction.bind(null, submission.id)}
                      className="mt-3 space-y-3 rounded-xl border border-border bg-background/80 p-4"
                    >
                      <label htmlFor={`notes-${submission.id}`} className="text-xs font-medium text-muted-foreground">
                        Moderator notes (optional)
                      </label>
                      <textarea
                        id={`notes-${submission.id}`}
                        name="notes"
                        rows={3}
                        placeholder="Share why it isn't a fit right now."
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <Button type="submit" variant="destructive" size="md">
                        Reject submission
                      </Button>
                    </form>
                  </details>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section id="recent" className="space-y-4">
        <header className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Recently published</h2>
          <LinkButton href="/" icon={<ArrowIcon className="h-4 w-4" />}>
            View site
          </LinkButton>
        </header>
        {recentPublished.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card px-4 py-5 text-sm text-muted-foreground">
            Once you publish articles, they will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-border/70 overflow-hidden rounded-3xl border border-border bg-card">
            {recentPublished.map((article) => (
              <li
                key={article.id}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">{article.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {article.authorName}{' '}
                    <span className="mx-1 text-muted-foreground/60">|</span>
                    {dateFormatter.format(article.publishedAt ?? new Date())}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Tag variant="outline" className="border-border/70 bg-background/70 px-3 py-1 text-xs">
                      {ARTICLE_CATEGORY_META[article.category].label}
                    </Tag>
                    {article.tags.map((tag) => (
                      <Tag key={tag} variant="muted" className="px-3 py-1 text-xs lowercase">
                        #{tag}
                      </Tag>
                    ))}
                  </div>
                </div>
                <LinkButton
                  href={`/articles/${article.slug}`}
                  prefetch={false}
                  icon={<ArrowIcon className="h-4 w-4" />}
                >
                  Read
                </LinkButton>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}



