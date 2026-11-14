'use client';

import { useMemo } from 'react';
import { products, categories, getProduct, getCategory, searchProducts } from '@/lib/catalog';
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
 * The Ooty Herbals catalogue.
 * Maintains backward compatibility with existing components.
 */
export function useCatalog(): Catalog {
  return useMemo(
    () => ({
      template: { ...herbal, products, cats: categories },
      freeShipAt: 499, // Default from herbal
      products,
      category: getCategory,
      product: getProduct,
      search: searchProducts,
    }),
    [],
  );
}

/**
 * For TypeScript - import herbal from catalog
 * This is a type-safe wrapper
 */
import { herbal } from '@/lib/catalog';
