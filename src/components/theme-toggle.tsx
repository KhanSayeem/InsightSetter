'use client';

import { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'insightsetter-theme';

const getStoredTheme = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Ignore storage access issues (Safari private mode, etc.)
  }
  return null;
};

const applyTheme = (theme: Theme, { persist }: { persist: boolean }) => {
  const root = document.documentElement;
  const isDark = theme === 'dark';

  root.classList.toggle('dark', isDark);
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore persistence errors
    }
  }
};

export function ThemeToggle() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Apply default dark theme if no stored preference
    const stored = getStoredTheme();
    if (stored === null) {
      applyTheme('dark', { persist: false });
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (getStoredTheme() !== null) {
        return;
      }

      // Default to dark if no stored preference
      applyTheme('dark', { persist: false });
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const handleToggle = () => {
    const root = document.documentElement;
    const nextTheme: Theme = root.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(nextTheme, { persist: true });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/90 text-muted-foreground transition hover:border-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      suppressHydrationWarning
    >
      <Moon className="h-4 w-4 transition-transform dark:hidden" aria-hidden />
      <Sun className="hidden h-4 w-4 transition-transform dark:block" aria-hidden />
    </button>
  );
}
