/**
 * Catalog Module - Main Entry Point
 * 
 * This module provides access to catalog data from:
 * 1. Hardcoded data (for development/fallback) - DEFAULT
 * 2. Static JSON export (for production builds) - OPTIONAL
 * 
 * For backward compatibility, all original exports are maintained.
 * 
 * Usage:
 *   // Original usage (still works!)
 *   import { herbal, products, categories, getProduct, getCategory, searchProducts } from '@/lib/catalog';
 * 
 *   // New JSON-based usage (when products.json exists)
 *   import { getProducts, getCategories } from '@/lib/catalog';
 */

import { herbal } from './config';

// Re-export hardcoded data for backward compatibility
export { herbal };
export const products = herbal.products;
export const categories = herbal.cats;

export const getProduct = (id: string) => herbal.products.find((p) => p.id === id);
export const getCategory = (slug: string) => herbal.cats.find((c) => c.slug === slug);

/** Case-insensitive match on name, description and category name. */
export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const catName = (slug: string) => herbal.cats.find((c) => c.slug === slug)?.name ?? '';
  return herbal.products.filter((p) => `${p.name} ${p.desc} ${catName(p.cat)}`.toLowerCase().includes(q));
}

// Re-export types from data module for new code
export type {
  Product,
  ProductVariant,
  ProductImage,
  ProductCategory,
  Category,
  CatalogMeta,
  CatalogData,
} from './data';

// Re-export utility functions from data module for new code
export {
  adaptProductToOldFormat,
  adaptCategoryToOldFormat,
  getStaticCatalogData,
  resetCache,
} from './data';
