/**
 * Live catalog fetch — SERVER-SIDE ONLY.
 *
 * Unlike data.ts (which reads a JSON file baked in at build time), this
 * calls the admin backend's public storefront endpoint on every request,
 * using Next's fetch cache with a short revalidation window so the website
 * reflects admin-panel product changes without a rebuild or redeploy.
 *
 * Only import this from Server Components (page.tsx / layout.tsx files).
 * Never import it from a "use client" file — it has no business there, and
 * it would pull server-only env vars (API_URL/STORE_SLUG) into the browser
 * bundle for no reason.
 */

import { adaptCategoryToOldFormat, adaptProductToOldFormat, type Category as RawCategory, type Product as RawProduct } from './data';
import type { Category, Product } from '@/lib/types';

const API_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8491').replace(/\/+$/, '');
const STORE_SLUG = process.env.STORE_SLUG || process.env.NEXT_PUBLIC_STORE_SLUG || '';
const REVALIDATE_SECONDS = Number(process.env.CATALOG_REVALIDATE_SECONDS) || 60;

export type LiveCatalog = { products: Product[]; categories: Category[] };

/**
 * This store's live products/categories, or null when STORE_SLUG isn't
 * configured or the backend couldn't be reached — callers fall back to the
 * built-in demo catalogue (lib/catalog/config.ts) in that case.
 */
export async function fetchLiveCatalog(): Promise<LiveCatalog | null> {
  if (!STORE_SLUG) return null;

  try {
    const res = await fetch(`${API_URL}/api/storefront/${encodeURIComponent(STORE_SLUG)}/catalog`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;

    const body = await res.json();
    const rawProducts = body?.data?.products;
    if (!Array.isArray(rawProducts)) return null;
    const rawCategories = Array.isArray(body?.data?.categories) ? body.data.categories : [];

    return {
      products: (rawProducts as RawProduct[]).map(adaptProductToOldFormat),
      categories: (rawCategories as RawCategory[]).map(adaptCategoryToOldFormat),
    };
  } catch {
    // Network error, backend down, etc. — never let catalog fetch failures break the page.
    return null;
  }
}

/** A single live product by id, or null if not found / live data unavailable. */
export async function fetchLiveProduct(id: string): Promise<Product | null> {
  const catalog = await fetchLiveCatalog();
  return catalog?.products.find((p) => p.id === id) ?? null;
}

/** A single live category by slug, or null if not found / live data unavailable. */
export async function fetchLiveCategory(slug: string): Promise<Category | null> {
  const catalog = await fetchLiveCatalog();
  return catalog?.categories.find((c) => c.slug === slug) ?? null;
}
