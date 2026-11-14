import type { Metadata } from 'next';
import { SearchView } from '@/components/views/ListViews';
import { clampQuery, shortQuery } from '@/lib/search';
import { pageMeta } from '@/lib/seo';

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const raw = Array.isArray(q) ? q[0] ?? '' : q ?? '';
  const query = shortQuery(clampQuery(raw));
  return pageMeta(query ? `Search: ${query}` : 'Search', 'Search honey, herbs, oils and gifts from Ooty Herbals.', `/search${query ? `?q=${encodeURIComponent(query)}` : ''}`);
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const raw = Array.isArray(q) ? q[0] ?? '' : q ?? '';
  return <SearchView q={raw} />;
}
