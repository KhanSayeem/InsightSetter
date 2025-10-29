import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Tag } from '@/components/ui/tag';
import { ARTICLE_CATEGORY_META } from '@/lib/article-categories';
import { prisma } from '@/lib/prisma';
import { ArticleStatus } from '@/generated/prisma-client/enums';

const dateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'long',
});

export const revalidate = 0;

async function getArticle(slug: string) {
  return prisma.article.findFirst({
    where: {
      slug,
      status: ArticleStatus.PUBLISHED,
    },
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      authorName: true,
      publishedAt: true,
      createdAt: true,
      category: true,
      tags: true,
    },
  });
}

type PageParams = {
  params: { slug: string };
};

export async function generateMetadata(props: PageParams): Promise<Metadata> {
  const { slug } = props.params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: 'Article not found - InsightSetter' };
  }

  const description =
    article.summary?.slice(0, 160) ?? article.content.slice(0, 160);

  return {
    title: article.title,
    description,
  };
}

export default async function ArticlePage(props: PageParams) {
  const { slug } = props.params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const publishedDate = article.publishedAt ?? article.createdAt;

  return (
    <article className="mx-auto max-w-3xl space-y-8 rounded-3xl border border-border bg-card p-8 shadow-lg">
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
        >
          <span aria-hidden>{'<'}</span>
          Back to all stories
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {article.title}
        </h1>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>{dateFormatter.format(publishedDate)}</span>
          <span className="text-muted-foreground/50">|</span>
          <span>{article.authorName}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Tag variant="outline" className="border-border/70 bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.25em]">
            {ARTICLE_CATEGORY_META[article.category].label}
          </Tag>
          {article.tags.map((tag) => (
            <Tag key={tag} variant="muted" className="px-3 py-1 text-xs lowercase">
              #{tag}
            </Tag>
          ))}
        </div>
        {article.summary && (
          <p className="mt-2 rounded-xl border border-primary/20 bg-primary/10 p-4 text-base text-muted-foreground">
            {article.summary}
          </p>
        )}
      </div>
      <div className="space-y-4 text-base leading-7 text-muted-foreground">
        <div className="whitespace-pre-wrap text-foreground">{article.content}</div>
      </div>
    </article>
  );
}
