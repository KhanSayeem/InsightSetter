import type { ReactNode } from 'react';

import { getAllCategories } from '@/lib/article-categories';
import { SiteShell } from '@/components/site-shell';

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const categories = await getAllCategories();
  const navCategories = categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    label: category.label,
    navPinned: category.navPinned,
    navPinnedAt: category.navPinnedAt ? category.navPinnedAt.toISOString() : null,
  }));

  return <SiteShell categories={navCategories}>{children}</SiteShell>;
}
