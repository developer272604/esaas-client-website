import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SuccessView } from '@/components/views/SuccessView';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta('Order placed', 'Your order confirmation.', '/success', { noindex: true });

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="wrap page" aria-busy="true" />}>
      <SuccessView />
    </Suspense>
  );
}
