import { create } from 'zustand';
import type { Category, Product } from '@/lib/types';
import { categories as demoCategories, products as demoProducts } from '@/lib/catalog';

type CatalogState = {
  products: Product[];
  categories: Category[];
  /** Replaces the catalog with live admin-panel data. Call only from the browser (see CatalogHydrator) — never during server rendering, since this is a shared singleton per server process. */
  hydrate: (data: { products: Product[]; categories: Category[] } | null) => void;
};

/**
 * Client-only, browser-side cache of the current store's catalog, used by
 * code that isn't a React component rendering from page props (cart totals
 * at checkout, the search box) — see store/actions.ts and lib/search.
 *
 * Starts with the built-in demo catalogue and is swapped for live data by
 * <CatalogHydrator>, which runs once per page load, after hydration, in
 * the user's own browser — never touched during server-side rendering.
 */
export const useCatalogStore = create<CatalogState>((set) => ({
  products: demoProducts,
  categories: demoCategories,
  hydrate: (data) => {
    if (!data || !data.products.length) return;
    set({ products: data.products, categories: data.categories });
  },
}));
