'use server';

import { ArticleStatus } from '@prisma/client';
import {
  clearAdminSession,
  establishAdminSession,
  isAdminAuthenticated,
  verifyAdminPassword,
} from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { PRIMARY_NAV_CATEGORY_LIMIT } from '@/lib/nav-config';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { slugify } from '@/lib/slugify';
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

export async function moveArticleToCategoryAction(articleId: string, categoryId: string) {
  await ensureAdmin();

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, slug: true },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  const article = await prisma.article.update({
    where: { id: articleId },
    data: { categoryId: category.id },
    select: { slug: true },
  });

  // Aggressively revalidate all relevant paths
  revalidatePath('/', 'layout');
  revalidatePath(ADMIN_HOME, 'page');
  revalidatePath(`/categories/${category.slug}`, 'page');
  if (category.slug === 'case-studies') {
    revalidatePath('/case-studies', 'page');
  }

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

  const categoryRecord = categoryInput
    ? await prisma.category.findUnique({ where: { id: categoryInput }, select: { id: true } })
    : null;
  if (!categoryRecord) {
    errors.category = 'Pick the category that best fits the insight.';
  }

  if (tags.length > 5) {
    errors.tags = 'Keep it to five tags so the story stays focused.';
  }

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
      categoryId: categoryRecord!.id,
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

export type CategoryFormState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await ensureAdmin();

  const label = (formData.get('label') ?? '').toString().trim();
  const slugInput = (formData.get('slug') ?? '').toString().trim();
  const description = (formData.get('description') ?? '').toString().trim();
  const railTitle = (formData.get('railTitle') ?? '').toString().trim();
  const navPlacement = (formData.get('navPlacement') ?? 'more').toString();
  const navReplacementId = (formData.get('navReplacement') ?? '').toString();

  const errors: Record<string, string> = {};

  if (!label) {
    errors.label = 'Give the category a name readers will recognize.';
  }

  const slug = slugify(slugInput || label);
  if (!slug) {
    errors.slug = 'Provide a slug so we can link to this category.';
  } else {
    const exists = await prisma.category.findUnique({ where: { slug } });
    if (exists) {
      errors.slug = 'That slug is already in use.';
    }
  }

  const wantsNav = navPlacement === 'nav' || navPlacement === 'replace';
  const wantsReplace = navPlacement === 'replace';
  let pinnedNavCategoryIds: string[] = [];

  if (wantsNav) {
    pinnedNavCategoryIds = (
      await prisma.category.findMany({ where: { navPinned: true }, select: { id: true } })
    ).map((category) => category.id);

    if (!wantsReplace && pinnedNavCategoryIds.length >= PRIMARY_NAV_CATEGORY_LIMIT) {
      errors.navPlacement = 'Primary navigation already has the maximum number of categories.';
    }

    if (wantsReplace) {
      if (!navReplacementId) {
        errors.navReplacement = 'Choose a category to move into “More.”';
      } else if (!pinnedNavCategoryIds.includes(navReplacementId)) {
        errors.navReplacement = 'Select one of the categories currently in the nav.';
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: 'Fix the highlighted fields and try again.',
      errors,
    };
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const created = await tx.category.create({
      data: {
        label,
        slug,
        description: description || null,
        railTitle: railTitle || null,
        navPinned: wantsNav,
        navPinnedAt: wantsNav ? now : null,
      },
    });

    if (wantsReplace && navReplacementId) {
      await tx.category.update({
        where: { id: navReplacementId },
        data: { navPinned: false, navPinnedAt: null },
      });
    }

    return created;
  });

  revalidatePath('/admin/categories');
  revalidatePath('/admin');
  revalidatePath('/', 'layout');
  revalidatePath(`/categories/${slug}`);
  if (slug === 'case-studies') {
    revalidatePath('/case-studies');
  }

  return {
    ok: true,
    message: 'Category created successfully.',
  };
}

export async function deleteCategoryAction(
  categoryId: string,
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await ensureAdmin();

  const fallbackId = (formData.get('fallbackCategoryId') ?? '').toString().trim();
  const errors: Record<string, string> = {};

  if (!categoryId) {
    errors.fallbackCategoryId = 'Category id required.';
  }

  if (!fallbackId) {
    errors.fallbackCategoryId = 'Pick a category to move existing articles into.';
  }

  if (fallbackId === categoryId) {
    errors.fallbackCategoryId = 'Fallback category must be different.';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: 'Fix the highlighted fields and try again.', errors };
  }

  const [target, fallback] = await Promise.all([
    prisma.category.findUnique({ where: { id: categoryId }, select: { id: true, slug: true } }),
    prisma.category.findUnique({ where: { id: fallbackId }, select: { id: true, slug: true } }),
  ]);

  if (!target) {
    return { ok: false, message: 'Category already removed.' };
  }

  if (!fallback) {
    return { ok: false, message: 'Fallback category not found.' };
  }

  await prisma.$transaction([
    prisma.article.updateMany({
      where: { categoryId: target.id },
      data: { categoryId: fallback.id },
    }),
    prisma.category.delete({ where: { id: target.id } }),
  ]);

  revalidatePath('/admin/categories');
  revalidatePath('/admin');
  revalidatePath('/', 'layout');
  revalidatePath(`/categories/${fallback.slug}`);
  if (target.slug) {
    revalidatePath(`/categories/${target.slug}`);
    if (target.slug === 'case-studies') {
      revalidatePath('/case-studies');
    }
  }

  return { ok: true, message: 'Category removed. Existing articles were reassigned.' };
}
