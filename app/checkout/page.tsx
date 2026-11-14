import type { Metadata } from 'next';
import { CheckoutView } from '@/components/views/CheckoutView';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta('Checkout', 'Delivery address, shipping and payment for your Ooty Herbals order.', '/checkout');

export default function CheckoutPage() {
  return <CheckoutView />;
}
