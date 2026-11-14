'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { armCartRoute } from '@/lib/cart-route';
import { useUiStore } from '@/store/ui';

/** The cart lives in a drawer. This address opens it over the home page. */
export function CartRoute() {
  const openCart = useUiStore((s) => s.openCart);
  const router = useRouter();
  useEffect(() => {
    armCartRoute();
    openCart();
    router.replace('/');
  }, [openCart, router]);

  return (
    <div className="wrap page">
      <h1>Your cart</h1>
      <p>Opening your cart…</p>
    </div>
  );
}
