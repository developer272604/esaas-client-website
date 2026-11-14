import type { Metadata } from 'next';
import { ShopView } from '@/components/views/ListViews';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta('All products', 'Every honey, herbal, oil and gift in the Ooty Herbals store.', '/shop');

export default function ShopPage() {
  return <ShopView />;
}
