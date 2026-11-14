import type { Metadata } from 'next';
import { WishlistView } from '@/components/views/Wishlist';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta('Wishlist', 'Products you have saved at Ooty Herbals.', '/wishlist');

export default function WishlistPage() {
  return <WishlistView />;
}
