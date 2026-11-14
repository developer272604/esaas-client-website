import type { Metadata } from 'next';
import { SuccessView } from '@/components/views/SuccessView';
import { pageMeta } from '@/lib/seo';

type Props = { params: Promise<{ orderId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderId } = await params;
  return pageMeta('Order placed', `Confirmation for order ${orderId}.`, `/success/${orderId}`);
}

export default async function SuccessPage({ params }: Props) {
  const { orderId } = await params;
  return <SuccessView orderId={orderId} />;
}
