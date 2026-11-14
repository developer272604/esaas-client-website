import type { Metadata } from 'next';
import { EmptyState } from '@/components/common/bits';

export const metadata: Metadata = { title: 'Page not found', description: 'That page does not exist in the Ooty Herbals store.' };

export default function NotFound() {
  return (
    <div className="wrap page">
      <EmptyState emoji="🧭" title="Page not found" page text="That page does not exist in this store." action={{ label: 'Back to home', href: '/' }} />
    </div>
  );
}
