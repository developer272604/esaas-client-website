'use client';

import { useEffect, useState } from 'react';
import { ProductView } from '@/components/views/ProductView';
import { CategoryView } from '@/components/views/ListViews';
import { useCatalog } from '@/lib/hooks';

export function CatalogEntry() {
  const { ready } = useCatalog();
  const [path, setPath] = useState('');
  useEffect(() => setPath(window.location.pathname), []);
  if (!ready || !path) return <div className="wrap page" aria-busy="true">Loading catalog…</div>;
  const [, kind, slug] = path.split('/');
  if (kind === 'product') return <ProductView id={slug} />;
  if (kind === 'category') return <CategoryView slug={slug} />;
  return <p className="wrap page">Catalog entry unavailable.</p>;
}
