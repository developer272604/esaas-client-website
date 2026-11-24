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
import type { Category, Product, Template } from '@/lib/types';

export function catalogTemplate(data: import('./data').CatalogData): Template {
  return {
    ...herbalConfig,
    name: data.meta.store_name || herbalConfig.name,
    logoUrl: data.meta.store_logo_url ?? undefined,
    products: data.products.map(adaptProductToOldFormat),
    cats: data.categories.filter((c) => c.is_active !== false).map(adaptCategoryToOldFormat),
  };
}
const live = getStaticCatalogData();

export const isLiveCatalog = live !== null;
export const herbal = live ? catalogTemplate(live) : herbalConfig;

export const products: Product[] = herbal.products;
export const categories: Category[] = herbal.cats;

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

export function needsDocumentNavigation(href: string) {
  const [, kind, slug] = href.match(/^\/(product|category)\/([^/?#]+)\/?(?:[?#]|$)/) ?? [];
  return kind === 'product' ? !getProduct(slug) : kind === 'category' && !getCategory(slug);
}

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
