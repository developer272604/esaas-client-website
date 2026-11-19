"use client";
import { useCartStore, lineKey } from '@/store/cart';
import { useUiStore } from '@/store/ui';
import { Icon } from '@/components/common/Icon';
import { MAX_QTY } from '@/lib/constants';
import type { Product } from '@/lib/types';

/**
 * Add-to-cart control for a product card: a plain button until the product is in the cart, then a
 * +/- quantity stepper in its place, so adjusting quantity doesn't require opening the cart drawer.
 */
export function CardAddToCart({ product: p, className = '' }: { product: Product; className?: string }) {
  const lines = useCartStore((s) => s.lines);
  const add = useCartStore((s) => s.add);
  const setQty = useCartStore((s) => s.setQty);
  const toast = useUiStore((s) => s.showToast);

  const cartLines = lines.filter((l) => l.id === p.id);
  const totalQty = cartLines.reduce((acc, l) => acc + l.qty, 0);

  if (totalQty > 0) {
    return (
      <div className={`card-qty-stepper ${className}`.trim()} role="group" aria-label={`Quantity for ${p.name}`}>
        <button
          type="button"
          className="card-qty-btn card-qty-dec"
          aria-label={`Decrease quantity for ${p.name}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (cartLines.length > 0) {
              const target = cartLines[0];
              const k = lineKey(target.id, target.o);
              setQty(k, target.qty - 1);
            }
          }}
        >
          <Icon name="minus" size={14} />
        </button>
        <span className="card-qty-count" aria-live="polite">
          {totalQty}
        </span>
        <button
          type="button"
          className="card-qty-btn card-qty-inc"
          aria-label={`Increase quantity for ${p.name}`}
          disabled={totalQty >= MAX_QTY}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (cartLines.length > 0) {
              const target = cartLines[0];
              const k = lineKey(target.id, target.o);
              setQty(k, target.qty + 1);
            } else {
              add(p.id, 0, 1);
            }
          }}
        >
          <Icon name="plus" size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`ot-btn ${className}`.trim()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add(p.id, 0, 1);
        toast(`Added ${p.name} to cart`, { label: 'View cart', href: '/cart' });
      }}
    >
      Add to cart
    </button>
  );
}
