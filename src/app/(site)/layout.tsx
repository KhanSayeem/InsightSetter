import type { ReactNode, SVGProps } from 'react';
import Link from 'next/link';

import { ThemeToggle } from '@/components/theme-toggle';
import { ButtonLink } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';

const navigation = [
  { href: '/#briefing', label: 'Briefing' },
  { href: '/#fast-takes', label: 'Fast Takes' },
  { href: '/#rails', label: 'Tracks' },
  { href: '/#community', label: 'Community' },
  { href: '/submit', label: 'Submit' },
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

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-gradient-to-b from-primary/15 via-background to-background opacity-90"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[420px] bg-[radial-gradient(80%_70%_at_100%_20%,oklch(0.9869_0.0214_95.2774)/0.28,transparent)] md:block"
      />

      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-5">
          <Link href="/" className="group flex items-center gap-3">
            <Tag
              variant="primary"
              className="border-border/60 bg-primary/10 text-primary/80 transition group-hover:border-primary/40 group-hover:text-primary"
            >
              InsightSetter
            </Tag>
            <span className="text-lg font-semibold tracking-tight text-foreground transition group-hover:text-primary">
              InsightSetter
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              {navigation.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full px-3 py-2 transition-colors hover:bg-primary/10 hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
            <ButtonLink href="/submit" size="md" className="hidden sm:inline-flex">
              Pitch a story
            </ButtonLink>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
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
