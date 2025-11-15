'use client';

import type { ReactNode, SVGProps } from 'react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Menu, Twitter, X } from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';
import { ButtonLink } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { FavoritesProvider } from '@/components/favorites-context';

const navigation = [
  { href: '/#briefing', label: 'Briefing' },
  { href: '/#fast-takes', label: 'Fast Takes' },
  { href: '/#rails', label: 'Tracks' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/favorites', label: 'Favorites' },
  { href: '/#community', label: 'Community' },
  { href: '/submit', label: 'Submit' },
];

const socialLinks = [
  { href: 'https://www.facebook.com/profile.php?id=61582438600061', label: 'Facebook', Icon: Facebook },
  { href: 'https://www.instagram.com/insightsetter/', label: 'Instagram', Icon: Instagram },
  { href: 'https://www.linkedin.com/company/109363160/admin/dashboard/', label: 'LinkedIn', Icon: Linkedin },
  { href: 'https://x.com/InsightSetter', label: 'X (Twitter)', Icon: Twitter },
];

function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.5 10h9m0 0-3.5-3.5M13.5 10l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type NavCategory = {
  id: string;
  slug: string;
  label: string;
};

export function SiteShell({ children, categories }: { children: ReactNode; categories: NavCategory[] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const hasCategories = categories.length > 0;

  useEffect(() => {
    if (!isMoreOpen) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isMoreOpen]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-gradient-to-b from-primary/15 via-background to-background opacity-90"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[420px] bg-[radial-gradient(80%_70%_at_100%_20%,oklch(0.9869_0.0214_95.2774)/0.28,transparent)] md:block"
      />

      <header className="relative z-50 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-5">
          <Link href="/" className="group inline-flex">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-1 text-sm font-medium text-muted-foreground md:flex">
              {navigation.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full px-3 py-2 transition-colors hover:bg-primary/10 hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
              {hasCategories ? (
                <div ref={moreRef} className="relative">
                  <button
                    type="button"
                    className="rounded-full px-3 py-2 transition-colors hover:bg-primary/10 hover:text-foreground"
                    onClick={() => setIsMoreOpen((value) => !value)}
                    aria-haspopup="menu"
                    aria-expanded={isMoreOpen}
                  >
                    More
                  </button>
                  {isMoreOpen ? (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border/70 bg-background p-2 shadow-xl">
                      <div className="max-h-72 space-y-1 overflow-y-auto text-sm">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/categories/${category.slug}`}
                            className="block rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-primary/10 hover:text-foreground"
                            onClick={() => setIsMoreOpen(false)}
                          >
                            {category.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </nav>
            <ThemeToggle />
            <ButtonLink href="/submit" size="md" className="hidden sm:inline-flex">
              Pitch a story
            </ButtonLink>
            <button
              className="ml-2 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="absolute inset-x-0 top-full z-50 border-t border-border/60 bg-background/95 backdrop-blur-sm md:hidden">
            <nav className="flex flex-col items-center gap-4 p-6">
              {navigation.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="w-full rounded-full py-3 text-center text-lg font-medium transition-colors hover:bg-primary/10 hover:text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              {hasCategories ? (
                <div className="w-full space-y-2 border-t border-border/60 pt-4">
                  <p className="text-sm font-semibold text-muted-foreground">Explore</p>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="block rounded-full py-2 text-center text-base font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-foreground"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 sm:px-8 lg:px-10">
        <FavoritesProvider>
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </FavoritesProvider>
      </main>

      <footer className="border-t border-border/60 bg-background/90">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
              InsightSetter
            </p>
            <p className="mt-2 max-w-md text-sm">
              Curated analysis at the intersection of finance, technology, and the forces shaping tomorrow.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm sm:items-end">
            <p className="text-muted-foreground/70">
              &copy; {new Date().getFullYear()} InsightSetter. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm font-medium text-muted-foreground">
              <Link href="/privacy" className="transition hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="transition hover:text-foreground">
                Terms
              </Link>
            </div>
            <div className="flex gap-3">
              {socialLinks.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  className="text-muted-foreground transition hover:text-primary"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </Link>
              ))}
            </div>
            <Link
              href="/submit"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
            >
              Share your perspective
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
