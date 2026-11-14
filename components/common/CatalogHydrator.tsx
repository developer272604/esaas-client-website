'use client';

import { useEffect } from 'react';
import { useCatalogStore } from '@/store/catalog';
import type { Category, Product } from '@/lib/types';

/**
 * Feeds this request's server-fetched live catalog into the client-side
 * catalog store, so cart/checkout/search (which run entirely in the
 * browser, outside of any page's render) see the same live products the
 * page itself rendered. Renders nothing; runs once per mount, client-side
 * only (a server-rendered pass of this component does nothing, since
 * effects never run during SSR).
 */
export function CatalogHydrator({ data }: { data: { products: Product[]; categories: Category[] } | null }) {
  const hydrate = useCatalogStore((s) => s.hydrate);

  useEffect(() => {
    hydrate(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return null;
}
