import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleStatus } from '@prisma/client';

import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import { prisma } from '@/lib/prisma';
import { ShareButton } from '@/components/share-button';
import { FavoritesProvider } from '@/components/favorites-context';
import { FavoriteButton } from '@/components/favorite-button';

const dateFmt = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });

function excerpt(summary: string | null, content: string, len = 200) {
  const src = (summary ?? content).trim();
  return src.length <= len ? src : `${src.slice(0, len - 3)}...`;
}

type PageParams = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 0;

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { label: true, description: true },
  });

  if (!category) {
    return { title: 'Category not found - InsightSetter' };
  }

  return {
    title: `${category.label} - InsightSetter`,
    description:
      category.description ??
      `Latest analysis from the ${category.label} desk at InsightSetter.`,
  };
}

export default async function CategoryPage({ params }: PageParams) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      label: true,
      description: true,
    },
  });

  if (!category) {
    notFound();
  }

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
  } as const;

  const articles = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      categoryId: category.id,
    },
    orderBy: [
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
    select,
  });

  return (
    <FavoritesProvider>
      <section className="space-y-8">
        <header className="space-y-3">
          <Tag variant="primary" className="w-fit tracking-[0.3em] text-primary/80">
            {category.label}
          </Tag>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {category.label}
          </h1>
          {category.description ? (
            <p className="max-w-2xl text-muted-foreground">{category.description}</p>
          ) : null}
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          {articles.map((article) => (
            <Card key={article.id} className="group space-y-3 p-6 shadow-md">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                <span>{dateFmt.format(article.publishedAt ?? article.createdAt)}</span>
                <span className="text-muted-foreground/50">|</span>
                <span>{article.authorName}</span>
              </div>
              <h2 className="text-xl font-semibold leading-tight">
                <Link href={`/articles/${article.slug}`} className="transition hover:text-primary">
                  {article.title}
                </Link>
              </h2>
              <p className="text-sm text-muted-foreground">{excerpt(article.summary, article.content)}</p>
              <div className="flex items-center justify-between">
                <ShareButton title={article.title} url={`/articles/${article.slug}`} />
                <FavoriteButton id={article.id} />
              </div>
            </Card>
          ))}
          {articles.length === 0 && (
            <p className="text-sm text-muted-foreground">No articles in this category yet.</p>
          )}
        </div>
      </section>
    </FavoritesProvider>
  );
}
