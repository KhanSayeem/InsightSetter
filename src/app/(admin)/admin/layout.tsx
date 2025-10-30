import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button, ButtonLink } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';
import { logoutAdmin } from './actions';

const navLinks = [
  { href: '/admin#overview', label: 'Overview' },
  { href: '/admin/submit', label: 'Submit Article' },
  { href: '/admin#stats', label: 'Stats' },
  { href: '/admin#analytics', label: 'Analytics' },
  { href: '/admin#queue', label: 'Queue' },
  { href: '/admin#recent', label: 'Recently published' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background lg:flex lg:min-h-screen">
      <aside className="hidden w-64 border-r border-border/70 bg-background/80 px-6 py-8 lg:flex lg:flex-col lg:gap-8">
        <div className="space-y-3">
          <Tag variant="primary" className="w-fit tracking-[0.3em] text-primary/80">
            InsightSetter
          </Tag>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground">Editorial Console</h1>
            <p className="text-sm text-muted-foreground">
              Moderate submissions and keep the publication queue moving.
            </p>
          </div>
        </div>
        <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-2 font-medium transition hover:bg-primary/10 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-3">
          <ButtonLink href="/" variant="secondary" className="w-full justify-center">
            View reader site
          </ButtonLink>
          <form action={logoutAdmin} className="w-full">
            <Button type="submit" variant="destructive" className="w-full justify-center">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-border bg-background/95 backdrop-blur lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2 lg:hidden">
              <Tag variant="primary" className="w-fit tracking-[0.3em] text-primary/80">
                InsightSetter
              </Tag>
              <h1 className="text-lg font-semibold text-foreground">Editorial Console</h1>
              <p className="text-sm text-muted-foreground">
                Moderate submissions and keep the publication queue moving.
              </p>
            </div>
            <div className="flex items-center gap-3 lg:justify-end">
              <ButtonLink href="/" variant="secondary" size="sm">
                View site
              </ButtonLink>
              <form action={logoutAdmin}>
                <Button type="submit" variant="destructive" size="sm">
                  Sign out
                </Button>
              </form>
            </div>
            <nav className="flex gap-3 overflow-x-auto text-sm text-muted-foreground lg:hidden">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap rounded-full border border-border/70 px-3 py-1 font-medium transition hover:border-primary/40 hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
