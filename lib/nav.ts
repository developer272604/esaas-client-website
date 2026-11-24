'use client';

import { needsDocumentNavigation } from '@/lib/catalog';
import { useCallback, useMemo } from 'react';
import { usePathname as useNextPathname, useRouter as useNextRouter } from 'next/navigation';

/** `router.push(href)` for components. */
export function useRouter() {
  const router = useNextRouter();
  const push = useCallback((href: string) => {
    if (needsDocumentNavigation(href)) window.location.assign(href);
    else router.push(href);
  }, [router]);
  return useMemo(() => ({ push }), [push]);
}

export const usePathname = (): string => useNextPathname() ?? '/';
