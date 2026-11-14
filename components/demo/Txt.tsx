'use client';

import type { ElementType, ReactNode } from 'react';
import { productDescId, productNameId } from '@/lib/textIds';

export function useText(_id: string, fallback: string): string {
  return fallback;
}

export { productNameId, productDescId };

export const useProductName = (_id: string, fallback: string) => fallback;

export function useNameOf(): (id: string, fallback: string) => string {
  return (_id, fallback) => fallback;
}

type Props = {
  id: string;
  text: string;
  as?: ElementType;
  className?: string;
  max?: number;
  children?: ReactNode;
};

/** Renders catalogue copy. The demo editor is not part of this store. */
export function Txt({ as, text, className, children }: Props) {
  const Tag = (as ?? 'span') as ElementType;
  return (
    <Tag className={className}>
      {text}
      {children}
    </Tag>
  );
}
