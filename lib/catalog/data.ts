/**
 * Catalog Data Reader for the Static JSON Export
 *
 * `public/products.json` is generated before every build by
 * `scripts/import-products.js` (run via `npm run import-products`, which
 * `npm run build` runs automatically — see package.json's `prebuild`
 * script). It holds one store's products/categories, pulled from the admin
 * backend's public `GET /api/storefront/{slug}/catalog` endpoint.
 *
 * It's imported here as plain JSON (not read with `fs`) so this module is
 * safe to use from both server and client components — a JSON import
 * becomes a plain bundled object, unlike `fs.readFileSync`, which only
 * works on the server and would break the browser bundle.
 *
 * A repo without a configured STORE_SLUG (e.g. local development) ships a
 * products.json with empty arrays; `getStaticCatalogData()` returns null in
 * that case so callers (see ./index.ts) fall back to the built-in demo
 * catalogue in ./config.ts.
 */

import rawCatalog from '../../public/products.json';

export interface ProductVariant {
  id: number;
  sku: string;
  title: string | null;
  /** Selling price. */
  price: number;
  /** "Compare at" price shown struck through; equal to `price` when there is no discount. */
  mrp: number;
  /** The public catalog shares availability, not exact counts. */
  in_stock?: boolean;
  low_stock?: boolean;
  /** Older catalog files only. */
  stock?: number;
  position: number | null;
}

export interface ProductImage {
  id: number;
  url: string;
  is_primary: boolean;
  alt: string | null;
  position: number | null;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  brand: string | null;
  tags: string[];
  weight_grams: number | null;
  is_cod_allowed: boolean;
  hsn_code: string | null;
  gst_rate: number | null;
  category: ProductCategory | null;
  variants: ProductVariant[];
  images: ProductImage[];
  updated_at: string | null;
  created_at: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  position: number | null;
  is_active: boolean;
}

export interface CatalogMeta {
  store_id?: number | null;
  store_name?: string | null;
  store_slug?: string | null;
  exported_at: string | null;
  product_count: number;
  category_count: number;
}

export interface CatalogData {
  products: Product[];
  categories: Category[];
  meta: CatalogMeta;
}

/**
 * The store's real catalog, if this build was configured with STORE_SLUG
 * and the import ran successfully — otherwise null, meaning "use the
 * built-in demo catalogue".
 */
export function getStaticCatalogData(): CatalogData | null {
  const data = rawCatalog as Partial<CatalogData> | null;

  if (!data || !Array.isArray(data.products) || data.products.length === 0) {
    return null;
  }

  return {
    products: data.products,
    categories: Array.isArray(data.categories) ? data.categories : [],
    meta: data.meta ?? {
      exported_at: null,
      product_count: data.products.length,
      category_count: Array.isArray(data.categories) ? data.categories.length : 0,
    },
  };
}

/**
 * Adapt a backend product into the storefront's own `Product` shape (see
 * lib/types.ts), so the real catalogue can drop into the same components
 * that render the hardcoded demo catalogue.
 */
export function adaptProductToOldFormat(p: Product): import('@/lib/types').Product {
  const variants = [...p.variants].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const base = variants[0];
  const basePrice = base?.price ?? 0;
  const baseMrp = base?.mrp ?? basePrice;

  const images = [...p.images]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((img) => img.url);

  // Only build size/pack options when there's more than one variant to choose from.
  const opts =
    variants.length > 1
      ? {
          label: 'Option',
          values: variants.map((v) => v.title || v.sku),
          mult: variants.map((v) => (basePrice ? v.price / basePrice : 1)),
          mrpMult: variants.map((v) => (baseMrp ? v.mrp / baseMrp : 1)),
        }
      : undefined;

  return {
    // The SEO-friendly slug, not the numeric backend id — this is what
    // shows up in the product URL (/product/<slug>), matching the "SEO
    // URL" field on the admin's product editor.
    id: p.slug,
    cat: p.category?.slug ?? 'other',
    name: p.name,
    price: basePrice,
    mrp: baseMrp,
    // No emoji/rating data comes from the admin catalog yet; these fields are
    // only used as decorative fallbacks when a product has no photo.
    emoji: '🛍️',
    rating: 0,
    rev: 0,
    desc: p.description ?? '',
    short: p.seo_description || (p.description ? p.description.slice(0, 140) : ''),
    image: images[0],
    images: images.length ? images : undefined,
    opts,
    weight: p.weight_grams ? `${p.weight_grams} g` : undefined,
    sku: base?.sku || undefined,
    brand: p.brand || undefined,
    inStock: variants.some((v) => v.in_stock ?? (v.stock ?? 0) > 0),
    seoTitle: p.seo_title || undefined,
    updatedAt: p.updated_at || undefined,
  };
}

/** Adapt a backend category into the storefront's own `Category` shape. */
export function adaptCategoryToOldFormat(c: Category): import('@/lib/types').Category {
  return {
    slug: c.slug,
    name: c.name,
    emoji: '🏷️',
    blurb: c.description ?? '',
  };
}
