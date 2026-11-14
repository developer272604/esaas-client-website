import type { Metadata } from 'next';
import { OrdersView } from '@/components/views/OrdersView';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta('My orders', 'Track orders placed in this browser.', '/orders');

export default function OrdersPage() {
  return <OrdersView />;
}
