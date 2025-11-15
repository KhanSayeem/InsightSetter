"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import { LinkButton } from '@/components/ui/link-button';
import { FavoritesProvider } from '@/components/favorites-context';
import { FavoriteButton } from '@/components/favorite-button';
import { ShareButton } from '@/components/share-button';

type FavoriteItem = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  tags: string[];
  category: { label: string | null } | null;
};

export default function FavoritesPageClient() {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('insightsetter:favorites');
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [items, setItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const readIds = () => {
      try {
        const raw = localStorage.getItem('insightsetter:favorites');
        setIds(raw ? (JSON.parse(raw) as string[]) : []);
      } catch {
        setIds([]);
      }
    };

    window.addEventListener('storage', readIds);
    window.addEventListener('favorites:changed', readIds as EventListener);
    return () => {
      window.removeEventListener('storage', readIds);
      window.removeEventListener('favorites:changed', readIds as EventListener);
    };
  }, []);

  useEffect(() => {
    if (ids.length === 0) {
      Promise.resolve().then(() => setItems([]));
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch('/api/articles/by-ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!cancelled) {
        const payload = Array.isArray(data.items) ? (data.items as FavoriteItem[]) : [];
        setItems(payload);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <FavoritesProvider>
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Favorites</h1>
          <p className="text-sm text-muted-foreground">Your saved articles on this device.</p>
        </header>
        {items.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">No favorites yet. Tap the ♥ on any article to save it here.</Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((article) => (
              <Card key={article.id} as="article" className="group flex h-full flex-col justify-between p-6 shadow-sm">
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-foreground transition group-hover:text-primary">
                    <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {(article.summary ?? article.content)?.slice(0, 200)}{(article.summary ?? article.content)?.length > 200 ? '…' : ''}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {article.category?.label ? (
                      <Tag variant="outline" className="border-border/70 bg-background/80 px-3 py-1 text-xs">
                        {article.category.label}
                      </Tag>
                    ) : null}
                    {article.tags?.slice(0, 3)?.map((t: string) => (
                      <Tag key={t} variant="muted" className="px-3 py-1 text-xs lowercase">#{t}</Tag>
                    ))}
                    <span className="mx-2 text-muted-foreground/50">|</span>
                    <div className="flex items-center gap-3">
                      <ShareButton title={article.title} url={`/articles/${article.slug}`} />
                      <FavoriteButton id={article.id} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <LinkButton href={`/articles/${article.slug}`}>Read →</LinkButton>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </FavoritesProvider>
  );
}
