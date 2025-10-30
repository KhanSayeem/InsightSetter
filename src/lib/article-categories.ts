import type { ArticleCategory } from '@prisma/client';

type CategoryMeta = {
  label: string;
  description: string;
  railTitle?: string;
};

export const ARTICLE_CATEGORY_META: Record<ArticleCategory, CategoryMeta> = {
  MARKETS_MACRO: {
    label: 'Markets & Macro',
    description: 'Rate moves, liquidity signals, and policy decisions shaping the macro backdrop.',
    railTitle: 'Markets & Macro',
  },
  OPERATORS: {
    label: 'Builders & Operators',
    description: 'Playbooks from founders, product leaders, and operators executing in the arena.',
    railTitle: 'Builders & Operators',
  },
  CAPITAL_STRATEGY: {
    label: 'Capital & Strategy',
    description: 'Private markets, corporate strategy, and the capital allocation bets defining the cycle.',
    railTitle: 'Capital & Strategy',
  },
  FAST_TAKE: {
    label: 'Fast Takes',
    description: 'Quick-hit insights and charts worth 3 minutes of your attention.',
  },
  DEEP_DIVE: {
    label: 'Deep Dives',
    description: 'Long-form frameworks and essays to revisit and reference.',
  },
};

export const ARTICLE_CATEGORY_OPTIONS = Object.entries(ARTICLE_CATEGORY_META).map(
  ([value, meta]) => ({
    value: value as ArticleCategory,
    label: meta.label,
  }),
);

export const RAIL_CATEGORIES: ArticleCategory[] = [
  'MARKETS_MACRO',
  'OPERATORS',
  'CAPITAL_STRATEGY',
];
