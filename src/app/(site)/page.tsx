import Link from 'next/link';
import type { SVGProps } from 'react';
import type { Prisma } from '@/generated/prisma-client/client';

import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LinkButton } from '@/components/ui/link-button';
import { Tag } from '@/components/ui/tag';
import { NewsletterForm } from '@/components/newsletter-form';
import { ArticleStatus, ArticleCategory } from '@/generated/prisma-client/enums';
import { ARTICLE_CATEGORY_META, RAIL_CATEGORIES } from '@/lib/article-categories';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

const formatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
});

function formatDate(input: Date | null) {
  if (!input) {
    return 'Unscheduled';
  }

  return formatter.format(input);
}

function getExcerpt(summary: string | null, content: string, length = 220) {
  const source = summary?.trim() || content.trim();
  if (source.length <= length) {
    return source;
  }

  return `${source.slice(0, length - 3)}...`;
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

function SparkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3v4m0 10v4m7-7h-4m-10 0H3m14.485-6.485-2.829 2.829M9.343 14.657l-2.828 2.829m0-11.314 2.828 2.829m5.657 5.657 2.829 2.829"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function Home() {
  const articleSelect = {
    id: true,
    title: true,
    summary: true,
    content: true,
    slug: true,
    authorName: true,
    publishedAt: true,
    createdAt: true,
    category: true,
    tags: true,
  } as const satisfies Prisma.ArticleSelect;

  type ArticlePreview = Prisma.ArticleGetPayload<{ select: typeof articleSelect }>;
  type RailBucket = {
    category: ArticleCategory;
    articles: ArticlePreview[];
  };

  let latestArticles: ArticlePreview[];

  try {
    latestArticles = await prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 30,
      select: articleSelect,
    });
  } catch (error) {
    console.error('[home] failed to load latest articles', error);
    latestArticles = [];
  }

  const featuredArticle = latestArticles[0];

  if (!featuredArticle) {
    return (
      <div className="space-y-12">
        <Card
          id="briefing"
          as="section"
          className="border-dashed px-8 py-16 text-center shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            InsightSetter
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            The first analysis drop is on its way.
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Once the editorial team approves the inaugural submissions, you&apos;ll see the latest dispatches here.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <ButtonLink href="/submit" size="lg">
              Pitch a story
            </ButtonLink>
            <ButtonLink href="/admin" size="lg" variant="secondary">
              Moderator sign-in
            </ButtonLink>
          </div>
        </Card>
      </div>
    );
  }

  const [fastTakeArticles, railBuckets, deepDiveArticles]: [
    ArticlePreview[],
    RailBucket[],
    ArticlePreview[],
  ] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        category: ArticleCategory.FAST_TAKE,
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 6,
      select: articleSelect,
    }),
      Promise.all(
        RAIL_CATEGORIES.map(async (category): Promise<RailBucket> => ({
          category,
          articles: await prisma.article.findMany({
            where: { status: ArticleStatus.PUBLISHED, category },
            orderBy: [
            { publishedAt: 'desc' },
            { createdAt: 'desc' },
          ],
          take: 4,
          select: articleSelect,
        }),
      })),
    ),
    prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        category: ArticleCategory.DEEP_DIVE,
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 4,
      select: articleSelect,
    }),
  ]);

  const secondaryArticles =
    fastTakeArticles.length > 0 ? fastTakeArticles.slice(0, 3) : latestArticles.slice(1, 4);

  const deepDives =
    deepDiveArticles.length > 0
      ? deepDiveArticles
      : latestArticles.filter((article) => article.id !== featuredArticle.id).slice(0, 4);

  const rails = railBuckets.map(({ category, articles }) => ({
    category,
    title: ARTICLE_CATEGORY_META[category].railTitle ?? ARTICLE_CATEGORY_META[category].label,
    description: ARTICLE_CATEGORY_META[category].description,
    articles,
  }));

  const communitySignals = [
    {
      label: 'Operators & investors',
      stat: '6,200+',
      copy: 'Read the InsightSetter briefing every morning to see the stories moving markets.',
    },
    {
      label: 'Contributors',
      stat: '480+',
      copy: 'Analysts, founders, and domain experts sharing frameworks and hard-earned lessons.',
    },
    {
      label: 'Countries represented',
      stat: '18',
      copy: 'Global vantage points on macro shifts, capital flows, and emerging ecosystems.',
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-20">
      <Card
        id="briefing"
        as="section"
        className="relative grid gap-10 overflow-hidden border-border/70 px-8 py-10 shadow-lg md:px-10 lg:grid-cols-[1.6fr_1fr]"
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_90%_0%,rgba(102,76,255,0.22),transparent)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(246,250,255,0.55),transparent_55%)] dark:bg-[linear-gradient(120deg,rgba(41,50,73,0.65),transparent_60%)]" />
        <div className="space-y-6">
          <Tag variant="primary" size="lg" className="px-4 tracking-[0.35em] text-primary/80">
            Daily Briefing
          </Tag>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Finance, technology, and the forces shaping tomorrow.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            InsightSetter surfaces thoughtful analysis and operator perspectives so you can stay ahead of market shifts
            and understand where capital, talent, and innovation are compounding next.
          </p>
          <div className="flex flex-wrap gap-4">
            <ButtonLink href="/submit" size="lg">
              Pitch an insight
            </ButtonLink>
            <ButtonLink
              href="#newsletter"
              variant="secondary"
              size="lg"
              className="gap-2 border-border/80 bg-background/80"
            >
              <SparkIcon className="h-4 w-4" />
              Get the briefing
            </ButtonLink>
          </div>
        </div>

        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Featured dispatch
          </p>
          <article className="group relative flex h-full flex-col justify-between rounded-2xl border border-border bg-background/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                <span>{formatDate(featuredArticle.publishedAt ?? featuredArticle.createdAt)}</span>
                <span className="text-muted-foreground/50">|</span>
                <span>{featuredArticle.authorName}</span>
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-foreground transition group-hover:text-primary">
                <Link href={`/articles/${featuredArticle.slug}`}>{featuredArticle.title}</Link>
              </h2>
              <div className="flex flex-wrap gap-2">
                <Tag variant="outline" className="border-border/70 bg-background/80 px-3 py-1 text-xs">
                  {ARTICLE_CATEGORY_META[featuredArticle.category].label}
                </Tag>
                {featuredArticle.tags.map((tag) => (
                  <Tag key={tag} variant="muted" className="px-3 py-1 text-xs lowercase">
                    #{tag}
                  </Tag>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                getExcerpt(featuredArticle.summary, featuredArticle.content, 200)
              </p>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Read the full note
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </article>
        </div>
      </Card>

      <section id="fast-takes" className="space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              What else the editors are watching
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Fast takes</h2>
          </div>
          <span className="text-sm text-muted-foreground">{secondaryArticles.length} quick reads</span>
        </header>
        {secondaryArticles.length === 0 ? (
          <Card className="border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
            Add a few FAST_TAKE pieces to showcase in this rail.
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {secondaryArticles.map((article) => (
              <article
                key={article.id}
                className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold leading-tight text-foreground transition group-hover:text-primary">
                    <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {getExcerpt(article.summary, article.content, 160)}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  <span>{formatDate(article.publishedAt ?? article.createdAt)}</span>
                  <span>{article.authorName}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="rails" className="space-y-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Curated rails
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Zoom into the signal</h2>
          </div>
          <LinkButton href="/submit" icon={<ArrowIcon className="h-4 w-4" />}>
            Add your perspective
          </LinkButton>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          {rails.map(({ category, title, description, articles }) => (
            <Card key={category} as="article" className="flex h-full flex-col gap-4 p-6 shadow-sm">
              <div className="space-y-3">
                <Tag variant="outline" className="border-border/70 bg-background/80 px-3 py-1 text-xs">
                  {ARTICLE_CATEGORY_META[category].label}
                </Tag>
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <div className="space-y-4">
                {articles.length === 0 ? (
                  <p className="text-sm text-muted-foreground/80">
                    Fresh analysis from editors will appear here as submissions land in this category.
                  </p>
                ) : (
                  articles.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-border/70 bg-background/70 p-4 transition hover:border-primary/40 hover:bg-background/90"
                    >
                      <Link
                        href={`/articles/${item.slug}`}
                        className="text-sm font-semibold leading-snug text-foreground transition hover:text-primary"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {getExcerpt(item.summary, item.content, 140)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Tag key={tag} variant="muted" className="px-3 py-1 text-xs lowercase">
                            #{tag}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Card
        as="section"
        className="grid gap-6 p-8 shadow-lg md:grid-cols-[1.2fr_1fr]"
        id="newsletter"
      >
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Newsletter</p>
          <h2 className="text-3xl font-semibold text-foreground">Join the morning InsightSetter briefing.</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every weekday before markets open, we distill the most important operator takeaways across finance, tech, and
            macro. Zero fluff—just the context you need to make confident moves.
          </p>
          <NewsletterForm />
          <p className="text-xs text-muted-foreground">
            No spam-just one curated email. You can unsubscribe anytime.
          </p>
        </div>
        <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">This week&apos;s lineup</p>
          <ul className="space-y-3 text-primary">
            <li>
              <span className="font-semibold">Tuesday:</span> Global liquidity dashboards and who is buying duration.
            </li>
            <li>
              <span className="font-semibold">Wednesday:</span> Operator playbook on pricing power in choppy demand cycles.
            </li>
            <li>
              <span className="font-semibold">Thursday:</span> Venture allocation heatmap across fintech and AI infra.
            </li>
          </ul>
        </div>
      </Card>

      <section id="community" className="space-y-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Community pulse
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Who&apos;s inside the InsightSetter orbit</h2>
          </div>
          <LinkButton
            href="mailto:editor@insightsetter.com"
            icon={<ArrowIcon className="h-4 w-4" />}
          >
            Partner with us
          </LinkButton>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          {communitySignals.map((signal) => (
            <Card
              key={signal.label}
              className="p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{signal.label}</p>
              <p className="mt-4 text-3xl font-semibold text-foreground">{signal.stat}</p>
              <p className="mt-3 text-sm text-muted-foreground">{signal.copy}</p>
            </Card>
          ))}
        </div>
      </section>

      {deepDives.length > 0 && (
        <section id="deep-dives" className="space-y-6">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Long-form towers
              </p>
              <h2 className="text-2xl font-semibold text-foreground">Deep dives &amp; frameworks</h2>
            </div>
            <span className="text-sm text-muted-foreground">{deepDives.length} saved for later</span>
          </header>
          <div className="grid gap-6 md:grid-cols-2">
            {deepDives.map((article) => (
              <Card
                key={article.id}
                as="article"
                className="group flex h-full flex-col justify-between p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    <span>{formatDate(article.publishedAt ?? article.createdAt)}</span>
                    <span className="text-muted-foreground/50">|</span>
                    <span>{article.authorName}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground transition group-hover:text-primary">
                    <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {getExcerpt(article.summary, article.content, 220)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Tag variant="outline" className="border-border/70 bg-background/80 px-3 py-1 text-xs">
                      {ARTICLE_CATEGORY_META[article.category].label}
                    </Tag>
                    {article.tags.slice(0, 4).map((tag) => (
                      <Tag key={tag} variant="muted" className="px-3 py-1 text-xs lowercase">
                        #{tag}
                      </Tag>
                    ))}
                  </div>
                </div>
                <LinkButton
                  href={`/articles/${article.slug}`}
                  className="mt-6 text-primary"
                  icon={<ArrowIcon className="h-4 w-4" />}
                >
                  Read analysis
                </LinkButton>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
