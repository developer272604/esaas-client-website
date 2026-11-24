'use client';

import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { catalogTemplate, getStaticCatalogData, herbal, type CatalogData } from '@/lib/catalog';
import type { Category, Product, Template } from '@/lib/types';

export type Catalog = {
  template: Template;
  ready: boolean;
  freeShipAt: number;
  products: Product[];
  category: (slug: string) => Category | undefined;
  product: (id: string) => Product | undefined;
  search: (q: string) => Product[];
};

const CatalogContext = createContext({ template: herbal, ready: true });
const configuredStore = getStaticCatalogData()?.meta;

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [template, setTemplate] = useState(herbal);

  const [ready, setReady] = useState(!configuredStore?.store_slug);

  useEffect(() => {
    const slug = configuredStore?.store_slug;
    const id = configuredStore?.store_id;
    if (!slug || !id) return;
    const controller = new AbortController();
    let pending = false;

    async function refresh() {
      if (pending || document.visibilityState === 'hidden') return;
      pending = true;
      try {
        const response = await fetch('/store-catalog', { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]) });
        if (!response.ok) return;
        const body: { data?: Pick<CatalogData, 'products' | 'categories'>; meta?: CatalogData['meta'] } = await response.json();
        if (body.meta && body.meta.store_id === id && Array.isArray(body.data?.products) && Array.isArray(body.data.categories)) {
          setTemplate(catalogTemplate({ ...body.data, meta: body.meta }));
        }
      } catch {
        // Keep the last successful catalog when the API is unreachable.
      } finally {
        pending = false;
        if (!controller.signal.aborted) setReady(true);
      }
    }

    void refresh();
    const refreshTimer = window.setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.abort();
      window.clearInterval(refreshTimer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  return createElement(CatalogContext.Provider, { value: { template, ready } }, children);
}

export function useCatalog(): Catalog {
  const { template, ready } = useContext(CatalogContext);
  return useMemo(() => {
    const category = (slug: string) => template.cats.find((c) => c.slug === slug);
    return {
      template,
      ready,
      freeShipAt: template.freeShipAt,
      products: template.products,
      category,
      product: (id: string) => template.products.find((p) => p.id === id),
      search: (query: string) => {
        const q = query.trim().toLowerCase();
        return q ? template.products.filter((p) =>
          `${p.name} ${p.desc} ${category(p.cat)?.name ?? ''}`.toLowerCase().includes(q)
        ) : [];
      },
    };
  }, [template, ready]);
}
