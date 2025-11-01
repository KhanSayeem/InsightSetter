"use client";

import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { moveArticleToCategoryAction } from '@/app/(admin)/admin/actions';
import { ARTICLE_CATEGORY_OPTIONS } from '@/lib/article-categories';
import type { ArticleCategory } from '@prisma/client';

type MoveToMenuProps = {
  articleId: string;
  currentCategory: ArticleCategory;
};

export function MoveToMenu({ articleId, currentCategory }: MoveToMenuProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const options = ARTICLE_CATEGORY_OPTIONS.filter((d) => d.value !== currentCategory);
  if (options.length === 0) return null;

  async function handleMove(category: ArticleCategory) {
    setOpen(false);
    startTransition(async () => {
      await moveArticleToCategoryAction(articleId, category);
      router.refresh();
    });
  }

  return (
    <div ref={ref} className="relative">
      <Button 
        type="button" 
        variant="secondary" 
        size="sm" 
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
      >
        {isPending ? 'Moving...' : 'Move to →'}
      </Button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border/70 bg-background p-1 shadow-xl">
          <div className="max-h-64 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-primary/10 disabled:opacity-50"
                onClick={() => handleMove(opt.value)}
                disabled={isPending}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
