'use client';

import { useMemo } from 'react';
import { herbal } from '@/lib/catalog';
import { useCatalogStore } from '@/store/catalog';
import type { Category, Product, Template } from '@/lib/types';

export type Catalog = {
  template: Template;
  freeShipAt: number;
  products: Product[];
  category: (slug: string) => Category | undefined;
  product: (id: string) => Product | undefined;
  search: (q: string) => Product[];
};

/**
 * The current store's catalogue: live admin-panel data once
 * <CatalogHydrator> has run (see app/layout.tsx), the built-in demo
 * catalogue until then or if no store is configured. Reactive — components
 * using this hook re-render when the live catalog is hydrated.
 */
export function useCatalog(): Catalog {
  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.categories);

  return useMemo(
    () => ({
      template: { ...herbal, products, cats: categories },
      freeShipAt: herbal.freeShipAt,
      products,
      category: (slug: string) => categories.find((c) => c.slug === slug),
      product: (id: string) => products.find((p) => p.id === id),
      search: (query: string) => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? '';
        return products.filter((p) => `${p.name} ${p.desc} ${catName(p.cat)}`.toLowerCase().includes(q));
      },
    }),
    [products, categories],
  );
}
