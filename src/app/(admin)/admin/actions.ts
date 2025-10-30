'use server';

import { ArticleStatus } from '@prisma/client';
import {
  clearAdminSession,
  establishAdminSession,
  isAdminAuthenticated,
  verifyAdminPassword,
} from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
