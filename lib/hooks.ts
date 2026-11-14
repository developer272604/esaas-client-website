'use client';

import { useMemo } from 'react';
import { getCategory, getProduct, herbal, searchProducts } from '@/lib/catalog';
import type { Category, Product, Template } from '@/lib/types';

export type Catalog = {
  template: Template;
  freeShipAt: number;
  products: Product[];
  category: (slug: string) => Category | undefined;
  product: (id: string) => Product | undefined;
  search: (q: string) => Product[];
};

/** The Ooty Herbals catalogue. There is one store in this app. */
export function useCatalog(): Catalog {
  return useMemo(
    () => ({
      template: herbal,
      freeShipAt: herbal.freeShipAt,
      products: herbal.products,
      category: getCategory,
      product: getProduct,
      search: searchProducts,
    }),
    [],
  );
}
