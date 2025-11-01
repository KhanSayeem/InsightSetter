'use server';

import { ArticleStatus, ArticleCategory } from '@prisma/client';
import {
  clearAdminSession,
  establishAdminSession,
  isAdminAuthenticated,
  verifyAdminPassword,
} from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { slugify } from '@/lib/slugify';
import { ARTICLE_CATEGORY_META } from '@/lib/article-categories';
import type { FormActionState } from '@/app/actions';

export type AdminAuthState = {
  error?: string;
};

const ADMIN_HOME = '/admin';

function resolveNextPath(raw: FormDataEntryValue | null | undefined) {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return ADMIN_HOME;
  }

  const next = raw.trim();

  if (!next.startsWith('/')) {
    return ADMIN_HOME;
  }

  try {
    // Validate the path contains no protocol/host segments
    const url = new URL(next, 'https://example.com');
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return ADMIN_HOME;
  }
}

export async function authenticateAdmin(
  _prevState: AdminAuthState,
  formData: FormData,
): Promise<AdminAuthState> {
  const configuredPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!configuredPassword) {
    return {
      error: 'ADMIN_PASSWORD is not configured. Set it in your environment and redeploy.',
    };
  }

  const passwordInput = (formData.get('password') ?? '').toString();

  if (!passwordInput) {
    return { error: 'Enter the admin password.' };
  }

  if (!verifyAdminPassword(passwordInput)) {
    return { error: 'That password did not match.' };
  }

  const nextPath = resolveNextPath(formData.get('next'));

  await establishAdminSession();

  revalidatePath(ADMIN_HOME);
  if (nextPath !== ADMIN_HOME) {
    const parsedNext = new URL(nextPath, 'https://example.com');
    revalidatePath(parsedNext.pathname);
  }

  redirect(nextPath);
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect(`${ADMIN_HOME}?auth=required`);
}

async function ensureAdmin() {
  if (!(await isAdminAuthenticated())) {
    await clearAdminSession();
    redirect(`${ADMIN_HOME}?auth=expired`);
  }
}

export async function publishArticleAction(articleId: string) {
  await ensureAdmin();

  await prisma.article.update({
    where: { id: articleId },
    data: {
      status: ArticleStatus.PUBLISHED,
      reviewedAt: new Date(),
      publishedAt: new Date(),
    },
  });

  revalidatePath('/');
  revalidatePath(ADMIN_HOME);
}

export async function rejectArticleAction(articleId: string, formData: FormData) {
  await ensureAdmin();

  const noteInput = (formData.get('notes') ?? '').toString();
  const trimmedNotes = noteInput.trim();

  await prisma.article.update({
    where: { id: articleId },
    data: {
      status: ArticleStatus.REJECTED,
      reviewNotes: trimmedNotes ? trimmedNotes : null,
      reviewedAt: new Date(),
    },
  });

  revalidatePath(ADMIN_HOME);
}

export async function deleteArticleAction(articleId: string, slug: string) {
  await ensureAdmin();

  await prisma.article.delete({
    where: { id: articleId },
  });

  revalidatePath('/');
  revalidatePath(ADMIN_HOME);
  if (slug) {
    revalidatePath(`/articles/${slug}`);
  }
}

// Map of category to route paths for revalidation
const CATEGORY_ROUTES: Record<ArticleCategory, string> = {
  MARKETS_MACRO: '/markets-macro',
  OPERATORS: '/operators',
  CAPITAL_STRATEGY: '/capital-strategy',
  FAST_TAKE: '/fast-takes',
  DEEP_DIVE: '/deep-dives',
  CASE_STUDY: '/case-studies',
};

export async function moveArticleToCategoryAction(articleId: string, category: ArticleCategory) {
  await ensureAdmin();

  const article = await prisma.article.update({
    where: { id: articleId },
    data: { category },
    select: { slug: true },
  });

  // Aggressively revalidate all relevant paths
  revalidatePath('/', 'layout');
  revalidatePath(ADMIN_HOME, 'page');
  
  // Revalidate all category pages dynamically
  Object.values(CATEGORY_ROUTES).forEach(route => {
    revalidatePath(route, 'page');
  });
  
  if (article.slug) {
    revalidatePath(`/articles/${article.slug}`, 'page');
  }
}

async function buildUniqueSlug(title: string) {
  const base = slugify(title) || `article-${Date.now()}`;
  let slug = base;
  let suffix = 1;

  while (true) {
    const exists = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!exists) {
      return slug;
    }

    slug = `${base}-${suffix++}`;
  }
}

export async function submitAdminArticleAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await ensureAdmin();

  const title = (formData.get('title') ?? '').toString().trim();
  const summary = (formData.get('summary') ?? '').toString().trim();
  const content = (formData.get('content') ?? '').toString().trim();
  const categoryInput = (formData.get('category') ?? '').toString().trim();
  const tagsInput = (formData.get('tags') ?? '').toString();
  const parsedTags = tagsInput
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  const tags = Array.from(new Set(parsedTags)).slice(0, 5);

  const errors: Record<string, string> = {};

  if (!title) {
    errors.title = 'Please add a headline.';
  }

  if (title.length > 150) {
    errors.title = 'Keep the headline under 150 characters.';
  }

  if (!content) {
    errors.content = 'Article body is required.';
  }

  const categoryValues = new Set(Object.keys(ARTICLE_CATEGORY_META));
  if (!categoryInput || !categoryValues.has(categoryInput)) {
    errors.category = 'Pick the category that best fits the insight.';
  }

  if (tags.length > 5) {
    errors.tags = 'Keep it to five tags so the story stays focused.';
  }

  const category = categoryInput as ArticleCategory;

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: 'Please fix the highlighted fields before submitting.',
      errors,
    };
  }

  const slug = await buildUniqueSlug(title);

  await prisma.article.create({
    data: {
      title,
      summary: summary || null,
      content,
      category,
      tags,
      authorName: 'Admin',
      slug,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  revalidatePath('/');
  revalidatePath('/admin');

  return {
    ok: true,
    message: 'Article published successfully.',
  };
}
