import { Suspense } from 'react';
import { CatalogEntry } from './CatalogEntry';

export const metadata = { robots: { index: false, follow: true } };

export default function CatalogEntryPage() {
  return <Suspense fallback={<div className="wrap page" aria-busy="true" />}><CatalogEntry /></Suspense>;
}
