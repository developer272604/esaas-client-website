'use client';

import { useCatalog } from '@/lib/hooks';
import type { ReactNode } from 'react';

/** The mark shown beside the store name. */
export function BrandLogo({ children }: { children: ReactNode }) {
  const { template } = useCatalog();
  return template.logoUrl ? <img src={template.logoUrl} alt="" width={32} height={32} /> : <>{children}</>;
}
