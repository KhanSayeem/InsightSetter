"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'insightsetter:favorites';

type FavoritesContextValue = {
  ids: Set<string>;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function readIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function writeIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
    window.dispatchEvent(new CustomEvent('favorites:changed'));
  } catch {}
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setIds(readIds());
    const onChange = () => setIds(readIds());
    window.addEventListener('storage', onChange);
    window.addEventListener('favorites:changed', onChange as any);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener('favorites:changed', onChange as any);
    };
  }, []);

  const value = useMemo<FavoritesContextValue>(() => ({
    ids,
    has: (id: string) => ids.has(id),
    toggle: (id: string) => {
      const next = new Set(ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeIds(next);
      setIds(next);
    },
  }), [ids]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
