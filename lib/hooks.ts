'use client';

import { useMemo } from 'react';
import { herbal, products, categories, getProduct, getCategory, searchProducts } from '@/lib/catalog';
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
 * The current store's catalogue, loaded at build time: live admin-panel
 * data if STORE_SLUG was set when `npm run import-products` ran before
 * this build (see scripts/import-products.js), otherwise the built-in
 * demo catalogue. Static for the lifetime of this build — update it by
 * rebuilding and redeploying.
 */
export function useCatalog(): Catalog {
  return useMemo(
    () => ({
      template: { ...herbal, products, cats: categories },
      freeShipAt: herbal.freeShipAt,
      products,
      category: getCategory,
      product: getProduct,
      search: searchProducts,
    }),
    [],
  );
}
