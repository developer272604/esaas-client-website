import type { Metadata } from 'next';
import { ShopView } from '@/components/views/ListViews';
import { fetchLiveCatalog } from '@/lib/catalog/live';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta('All products', 'Every honey, herbal, oil and gift in the Ooty Herbals store.', '/shop');

// Route segment config: without this, Next can fully static-optimize this
// route at build time and never re-run fetchLiveCatalog()'s fetch again,
// regardless of that fetch's own `next: { revalidate }` option. This is
// the explicit, documented way to force time-based ISR. Keep in sync with
// CATALOG_REVALIDATE_SECONDS in lib/catalog/live.ts (can't read env here —
// Next requires a literal).
export const revalidate = 60;

export default async function ShopPage() {
  const live = await fetchLiveCatalog();
  return <ShopView products={live?.products} />;
}
