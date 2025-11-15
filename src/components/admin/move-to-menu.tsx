"use client";

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { moveArticleToCategoryAction } from '@/app/(admin)/admin/actions';

type CategoryOption = { id: string; label: string };

type MoveToMenuProps = {
  articleId: string;
  currentCategoryId: string;
  options: CategoryOption[];
};

export function MoveToMenu({ articleId, currentCategoryId, options }: MoveToMenuProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
  const [maxHeight, setMaxHeight] = useState<number>(256);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('mousedown', onDocClick);
        document.removeEventListener('keydown', onKey);
      };
    }
  }, [open]);

  // Auto-flip above if there isn't enough space below; also cap height to fit viewport
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const gap = 8;
      const desired = 256; // px
      const bottomSpace = window.innerHeight - rect.bottom - gap;
      const topSpace = rect.top - gap;
      if (bottomSpace < 160 && topSpace > bottomSpace) {
        setPlacement('top');
        setMaxHeight(Math.max(140, Math.min(desired, topSpace)));
      } else {
        setPlacement('bottom');
        setMaxHeight(Math.max(140, Math.min(desired, bottomSpace)));
      }
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  const menuOptions = options.filter((option) => option.id !== currentCategoryId);
  if (menuOptions.length === 0) return null;

  function toggleMenu() {
    setOpen((v) => !v);
  }

  function handleMove(categoryId: string) {
    setOpen(false);
    startTransition(() => {
      // Fire and refresh; no await inside transition to keep UI responsive
      moveArticleToCategoryAction(articleId, categoryId).finally(() => {
        router.refresh();
      });
    });
  }

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggleMenu}
        disabled={isPending}
      >
        {isPending ? 'Moving...' : 'Move to →'}
      </Button>

      {open ? (
        <div
          role="menu"
          className={
            `absolute right-0 z-50 w-56 overflow-hidden rounded-xl border border-border/70 bg-background p-1 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150 ` +
            (placement === 'bottom' ? 'mt-2 top-full' : 'mb-2 bottom-full')
          }
        >
          <div className="overflow-y-auto" style={{ maxHeight }}>
            {menuOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition hover:bg-primary/10 disabled:opacity-50"
                onClick={() => handleMove(opt.id)}
                disabled={isPending}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
