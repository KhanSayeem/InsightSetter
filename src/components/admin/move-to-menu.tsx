"use client";

import { useState, useRef, useEffect, useTransition } from 'react';
import { createPortal } from 'react-dom';
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
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current || !dropdownRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node) && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (open && wrapperRef.current) {
      const updatePosition = () => {
        if (wrapperRef.current) {
          const rect = wrapperRef.current.getBoundingClientRect();
          setPosition({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX,
            width: rect.width,
          });
        }
      };

      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [open]);

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
    <div ref={wrapperRef} className="inline-block">
      <Button 
        type="button" 
        variant="secondary" 
        size="sm" 
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
      >
        {isPending ? 'Moving...' : 'Move to →'}
      </Button>
      {open && typeof window !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed z-[1000] w-56 overflow-hidden rounded-xl border border-border/70 bg-background p-1 shadow-xl transition-opacity duration-200"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            minWidth: `${position.width}px`,
          }}
        >
          <div className="max-h-64 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition hover:bg-primary/10 disabled:opacity-50"
                onClick={() => handleMove(opt.value)}
                disabled={isPending}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
