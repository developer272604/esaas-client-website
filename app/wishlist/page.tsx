import type { Metadata } from 'next';
import { WishlistRoute } from '@/components/wishlist/WishlistRoute';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta('Wishlist', 'Products you have saved at Ooty Herbals.', '/wishlist', { noindex: true });

export default function WishlistPage() {
  return <WishlistRoute />;
}
