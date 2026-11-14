/**
 * Catalog Module - Main Entry Point
 *
 * Products and categories come from one of two places:
 * 1. The store's real catalog (public/products.json), pulled from the admin
 *    backend at build time — used whenever this build was configured with
 *    STORE_SLUG and the import succeeded (see scripts/import-products.js).
 * 2. The built-in demo catalogue (./config.ts) — the fallback when no store
 *    is configured, so local development keeps working out of the box.
 *
 * Everything else about the site (home page sections, theme, testimonials)
 * still comes from the hardcoded template in ./config.ts — only the
 * product/category data itself is swapped out.
 */

import { herbal as herbalConfig } from './config';
import { adaptCategoryToOldFormat, adaptProductToOldFormat, getStaticCatalogData } from './data';
import type { Category, Product } from '@/lib/types';

const live = getStaticCatalogData();

const liveProducts: Product[] | null = live ? live.products.map(adaptProductToOldFormat) : null;
const liveCategories: Category[] | null = live ? live.categories.map(adaptCategoryToOldFormat) : null;

/** True when this build is serving a real store's catalog instead of the demo one. */
export const isLiveCatalog = live !== null;

// Re-export the hardcoded template for backward compatibility (home page sections, theme, etc.),
// but with products/categories swapped for the live store's data when available.
export const herbal = { ...herbalConfig, products: liveProducts ?? herbalConfig.products, cats: liveCategories ?? herbalConfig.cats };

export const products: Product[] = herbal.products;
export const categories: Category[] = herbal.cats;

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

/** Case-insensitive match on name, description and category name. */
export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? '';
  return products.filter((p) => `${p.name} ${p.desc} ${catName(p.cat)}`.toLowerCase().includes(q));
}

// Re-export types from data module for new code
export type {
  Product as LiveProduct,
  ProductVariant,
  ProductImage,
  ProductCategory,
  Category as LiveCategory,
  CatalogMeta,
  CatalogData,
} from './data';

// Re-export utility functions from data module for new code
export { adaptProductToOldFormat, adaptCategoryToOldFormat, getStaticCatalogData };
