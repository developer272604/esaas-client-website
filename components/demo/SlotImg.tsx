'use client';

import type { ReactNode } from 'react';
import Img from '@/components/common/Img';

export function useSlotImage(_slot: string): string | undefined {
  return undefined;
}

export function ImageControls(_props: { slot: string }) {
  return null;
}

type Props = {
  slot: string;
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallback?: ReactNode;
};

/** Fills its positioned parent with the catalogue photo. */
export function SlotImg({ src, alt, className = '', sizes, priority, fallback }: Props) {
  if (!src) return <>{fallback}</>;
  return <Img src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
}
