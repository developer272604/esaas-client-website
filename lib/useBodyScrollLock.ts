import { useEffect } from 'react';

/**
 * Locks page scroll while `active`. `overflow: hidden` alone is unreliable on phones (touch-drag
 * and scroll-chaining bounce can still move the page behind an open drawer), so this pins the body
 * in place with `position: fixed` at its current scroll offset instead, and restores the scroll
 * position when it unlocks. This is the same technique dialog libraries use for this exact problem.
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const scrollY = window.scrollY;
    const { position, top, left, right, width, overflow } = document.body.style;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.position = position;
      document.body.style.top = top;
      document.body.style.left = left;
      document.body.style.right = right;
      document.body.style.width = width;
      document.body.style.overflow = overflow;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}
