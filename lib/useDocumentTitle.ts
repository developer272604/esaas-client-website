'use client';

import { useEffect } from 'react';

const BRAND = 'Ooty Herbals';

/** Keeps the tab title in step with client navigation. Server metadata is the SEO source. */
export function useDocumentTitle(page?: string): void {
  useEffect(() => {
    document.title = page ? `${page} – ${BRAND}` : `${BRAND} – Natural honey from the Nilgiris`;
  }, [page]);
}
