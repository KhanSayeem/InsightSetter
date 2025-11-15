'use server';

import { ArticleStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

export type FormActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

export async function submitArticleAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const title = (formData.get('title') ?? '').toString().trim();
  const summary = (formData.get('summary') ?? '').toString().trim();
  const content = (formData.get('content') ?? '').toString().trim();
  const authorName = (formData.get('authorName') ?? '').toString().trim();
  const authorEmail = (formData.get('authorEmail') ?? '').toString().trim();
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

  if (content.length < 200) {
    errors.content = 'Add at least a couple of paragraphs so we can review it properly.';
  }

  if (!authorName) {
    errors.authorName = 'Let us know who to credit.';
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

  if (authorEmail && !validateEmail(authorEmail)) {
    errors.authorEmail = 'That email looks off. Double-check it?';
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
      authorName,
      authorEmail: authorEmail || null,
      slug,
      status: ArticleStatus.PENDING,
    },
  });

  revalidatePath('/');
  revalidatePath('/admin');

  return {
    ok: true,
    message: "Thanks! We'll review your article soon.",
  };
}
