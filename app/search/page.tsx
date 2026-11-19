import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchView } from '@/components/views/ListViews';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta('Search', 'Search honey, herbs, oils and gifts from Ooty Herbals.', '/search', { noindex: true });

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="wrap page" aria-busy="true" />}>
      <SearchView />
    </Suspense>
  );
}
