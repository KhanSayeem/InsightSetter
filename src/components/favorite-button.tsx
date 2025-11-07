"use client";

import { useEffect, useState } from 'react';
import { useFavorites } from './favorites-context';

function Heart({ filled, className }: { filled: boolean; className?: string }) {
  return filled ? (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 21s-6.716-4.26-9.193-7.49C.406 10.64 1.06 7.5 3.514 6.07c1.738-1.03 4.02-.72 5.51.7L12 9.65l2.976-2.88c1.49-1.42 3.772-1.73 5.51-.7 2.454 1.43 3.108 4.57.707 7.44C18.716 16.74 12 21 12 21z"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M12 21s-6.716-4.26-9.193-7.49C.406 10.64 1.06 7.5 3.514 6.07c1.738-1.03 4.02-.72 5.51.7L12 9.65l2.976-2.88c1.49-1.42 3.772-1.73 5.51-.7 2.454 1.43 3.108 4.57.707 7.44C18.716 16.74 12 21 12 21z"/>
    </svg>
  );
}

export function FavoriteButton({ id, className, stopNavigation }: { id: string; className?: string; stopNavigation?: boolean }) {
  const { has, toggle } = useFavorites();
  const [active, setActive] = useState(false);

  useEffect(() => setActive(has(id)), [has, id]);

  function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (stopNavigation) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggle(id);
    setActive((v) => !v);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      className={["inline-flex items-center text-muted-foreground hover:text-foreground transition", className].filter(Boolean).join(' ')}
    >
      <Heart filled={active} className="h-5 w-5" />
    </button>
  );
}
