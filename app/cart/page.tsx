import type { Metadata } from 'next';
import { CartRoute } from '@/components/cart/CartRoute';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta('Cart', 'Review the honey and herbal products in your cart.', '/cart', { noindex: true });

export default function CartPage() {
  return <CartRoute />;
}
