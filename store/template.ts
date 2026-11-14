'use client';

import { herbal } from '@/lib/catalog';
import type { Template } from '@/lib/types';

const state = { tpl: herbal.id, setTpl: (_id: string) => undefined };

/** Always the honey store. */
export const useTemplate = (): Template => herbal;

export function useTemplateStore<T>(selector: (s: typeof state) => T): T {
  return selector(state);
}

useTemplateStore.getState = () => state;
