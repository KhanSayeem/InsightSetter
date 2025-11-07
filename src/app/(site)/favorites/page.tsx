import type { Metadata } from 'next';
import FavoritesPageClient from './client';

export const metadata: Metadata = {
  title: 'Favorites - InsightSetter',
};

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function FavoritesPage() {
  return <FavoritesPageClient />;
}
