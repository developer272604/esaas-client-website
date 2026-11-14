'use client';

import { useMemo } from 'react';
import { 
  getCategory as getStaticCategory, 
  getProduct as getStaticProduct, 
  searchProducts as staticSearchProducts,
  getProducts as getStaticProducts,
  getCategories as getStaticCategories,
  getCatalogData,
} from '@/lib/catalog';
import { getCategory, getProduct, herbal, searchProducts, products as hardcodedProducts, categories as hardcodedCategories } from '@/lib/catalog/config';
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
 * Adapt static JSON product to old format
 * This allows gradual migration from hardcoded to JSON data
 */
function adaptProductToOldFormat(staticProduct: any): Product {
  return {
    id: String(staticProduct.id),
    name: staticProduct.name,
    cat: staticProduct.category?.slug || 'other',
    desc: staticProduct.description || '',
    short: staticProduct.seo_description || staticProduct.description?.substring(0, 100) || '',
    price: staticProduct.variants?.[0]?.price || 0,
    mrp: staticProduct.variants?.[0]?.mrp || 0,
    rating: 4.5, // Default rating
    rev: Math.floor(Math.random() * 50) + 10, // Default reviews
    image: staticProduct.images?.[0]?.url || '/images/honey.webp',
    images: staticProduct.images?.map((img: any) => img.url) || [],
    opts: null,
    stock: staticProduct.variants?.[0]?.stock || 0,
    tags: staticProduct.tags || [],
    weight: staticProduct.weight_grams || 0,
    multi: null,
    d: staticProduct.seo_description || '',
  };
}

/**
 * Adapt static JSON category to old format
 */
function adaptCategoryToOldFormat(staticCategory: any): Category {
  return {
    slug: staticCategory.slug,
    name: staticCategory.name,
    blurb: staticCategory.description || '',
    image: '',
  };
}

/**
 * Check if static JSON data is available
 */
function hasStaticData(): boolean {
  try {
    const staticProducts = getStaticProducts();
    return staticProducts && staticProducts.length > 0;
  } catch {
    return false;
  }
}

/**
 * The Ooty Herbals catalogue with fallback to hardcoded data.
 * Tries to use static JSON data first, falls back to hardcoded if not available.
 */
export function useCatalog(): Catalog {
  return useMemo(
    () => {
      // Try to use static JSON data if available
      if (hasStaticData()) {
        const staticProducts = getStaticProducts();
        const staticCategories = getStaticCategories();
        
        // Adapt to old format
        const adaptedProducts = staticProducts.map(adaptProductToOldFormat);
        const adaptedCategories = staticCategories.map(adaptCategoryToOldFormat);
        
        return {
          template: {
            ...herbal,
            products: adaptedProducts,
            cats: adaptedCategories,
          },
          freeShipAt: herbal.freeShipAt,
          products: adaptedProducts,
          category: (slug: string) => adaptedCategories.find(c => c.slug === slug),
          product: (id: string) => adaptedProducts.find(p => p.id === id),
          search: (q: string) => {
            const results = staticSearchProducts(q);
            return results.map(adaptProductToOldFormat);
          },
        };
      }
      
      // Fallback to hardcoded data (original behavior)
      return {
        template: herbal,
        freeShipAt: herbal.freeShipAt,
        products: hardcodedProducts,
        category: getCategory,
        product: getProduct,
        search: searchProducts,
      };
    },
    [],
  );
}

/**
 * Direct access to static catalog data (new format)
 * Use this for new components that work with the JSON data structure
 */
export function useStaticCatalog() {
  return useMemo(() => {
    const data = getCatalogData();
    return {
      products: data.products,
      categories: data.categories,
      meta: data.meta,
    };
  }, []);
}
