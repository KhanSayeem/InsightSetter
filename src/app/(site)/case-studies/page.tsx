import Link from 'next/link';
import type { Metadata } from 'next';
import type { Prisma } from '@prisma/client';
import { ArticleCategory, ArticleStatus } from '@prisma/client';

import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import { prisma } from '@/lib/prisma';
import { ARTICLE_CATEGORY_META } from '@/lib/article-categories';
import { ShareButton } from '@/components/share-button';

export const metadata: Metadata = {
  title: 'Case Studies',
  description:
    'In-depth analyses of companies and products — strategy, execution, and outcomes.',
};

const dateFmt = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });

function excerpt(summary: string | null, content: string, len = 200) {
  const src = (summary ?? content).trim();
  return src.length <= len ? src : `${src.slice(0, len - 3)}...`;
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function CaseStudiesPage() {
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
      category: ArticleCategory.CASE_STUDY,
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
          {ARTICLE_CATEGORY_META.CASE_STUDY.label}
        </Tag>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Case studies
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          {ARTICLE_CATEGORY_META.CASE_STUDY.description}
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
            <div className="text-right">
              <ShareButton title={a.title} url={`/articles/${a.slug}`} />
            </div>
          </Card>
        ))}
        {articles.length === 0 && (
          <p className="text-sm text-muted-foreground">No case studies published yet.</p>
        )}
      </div>
    </section>
  );
}
