import type { Metadata } from 'next';

import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import LoginForm from '../login-form';
import { CategoryCreateForm } from './category-create-form';
import { CategoryDeleteForm } from './category-delete-form';

export const metadata: Metadata = {
  title: 'Manage Categories',
};

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <header className="space-y-4 text-center">
          <Tag variant="primary" className="w-fit tracking-[0.3em] text-primary/80">
            InsightSetter
          </Tag>
          <h1 className="text-3xl font-semibold text-foreground">Moderator access</h1>
          <p className="text-sm text-muted-foreground">
            Enter the admin password to manage editorial categories.
          </p>
        </header>
        <LoginForm nextPath="/admin/categories" passwordConfigured />
      </div>
    );
  }

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      label: true,
      slug: true,
      description: true,
      railTitle: true,
      createdAt: true,
      navPinned: true,
      _count: {
        select: {
          articles: true,
        },
      },
    },
  });
  const pinnedCategories = categories.filter((category) => category.navPinned);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Create new editorial buckets and keep track of where the published work lives.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4 rounded-2xl border border-border/70 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Existing categories</h2>
            <span className="text-sm text-muted-foreground">{categories.length} total</span>
          </div>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No categories yet. Use the form on the right to create your first one.
            </p>
          ) : (
            <ul className="space-y-4">
              {categories.map((category) => {
                const fallbackOptions = categories.filter((c) => c.id !== category.id);
                return (
                <li
                  key={category.id}
                  className="rounded-2xl border border-border/60 bg-background/60 p-4 transition hover:border-primary/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-base font-semibold text-foreground">{category.label}</p>
                      <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground/70">
                        /categories/{category.slug}
                      </p>
                    </div>
                    <Tag variant="outline" className="border-border/70 text-xs">
                      {category._count.articles} articles
                    </Tag>
                  </div>
                  {category.description ? (
                    <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground/70">
                      No description yet. Readers will see this on category pages and share cards.
                    </p>
                  )}
                  {category.railTitle ? (
                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Homepage rail: {category.railTitle}
                    </p>
                  ) : null}
                  <div className="mt-4">
                    {fallbackOptions.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Add another category before deleting this one.
                      </p>
                    ) : (
                      <CategoryDeleteForm categoryId={category.id} fallbackOptions={fallbackOptions} />
                    )}
                  </div>
                </li>
              );
            })}
            </ul>
          )}
        </Card>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Create a new category</h2>
          <CategoryCreateForm pinnedCategories={pinnedCategories.map(({ id, label }) => ({ id, label }))} />
        </div>
      </div>
    </div>
  );
}
