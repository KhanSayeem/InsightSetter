import { cache } from 'react';
import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export const CATEGORY_SUMMARY_SELECT = {
  id: true,
  slug: true,
  label: true,
  description: true,
  railTitle: true,
  navPinned: true,
  navPinnedAt: true,
} as const satisfies Prisma.CategorySelect;

export type CategorySummary = Prisma.CategoryGetPayload<{ select: typeof CATEGORY_SUMMARY_SELECT }>;

export const getAllCategories = cache(async () => {
  return prisma.category.findMany({
    orderBy: { label: 'asc' },
    select: CATEGORY_SUMMARY_SELECT,
  });
});

export const getCategoryBySlug = cache(async (slug: string) => {
  return prisma.category.findUnique({
    where: { slug },
    select: CATEGORY_SUMMARY_SELECT,
  });
});

export const getCategoryById = cache(async (id: string) => {
  return prisma.category.findUnique({
    where: { id },
    select: CATEGORY_SUMMARY_SELECT,
  });
});

export const DEFAULT_CATEGORY_SEED: Array<Pick<Prisma.CategoryCreateInput, 'slug' | 'label' | 'description' | 'railTitle'>> = [
  {
    slug: 'markets-macro',
    label: 'Markets & Macro',
    description: 'Rate moves, liquidity signals, and policy decisions shaping the macro backdrop.',
    railTitle: 'Markets & Macro',
  },
  {
    slug: 'builders-operators',
    label: 'Builders & Operators',
    description: 'Playbooks from founders, product leaders, and operators executing in the arena.',
    railTitle: 'Builders & Operators',
  },
  {
    slug: 'capital-strategy',
    label: 'Capital & Strategy',
    description: 'Private markets, corporate strategy, and the capital allocation bets defining the cycle.',
    railTitle: 'Capital & Strategy',
  },
  {
    slug: 'fast-takes',
    label: 'Fast Takes',
    description: 'Quick-hit insights and charts worth 3 minutes of your attention.',
  },
  {
    slug: 'deep-dives',
    label: 'Deep Dives',
    description: 'Long-form frameworks and essays to revisit and reference.',
  },
  {
    slug: 'case-studies',
    label: 'Case Studies',
    description: 'In-depth analyses of companies and products: strategy, execution, and outcomes.',
  },
];
