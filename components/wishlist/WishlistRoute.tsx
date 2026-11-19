'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { armWishlistRoute } from '@/lib/wishlist-route';
import { useUiStore } from '@/store/ui';

/** The wishlist lives in a drawer. This address opens it over the home page. */
export function WishlistRoute() {
  const openWishlist = useUiStore((s) => s.openWishlist);
  const router = useRouter();
  useEffect(() => {
    armWishlistRoute();
    openWishlist();
    router.replace('/');
  }, [openWishlist, router]);

  return (
    <div className="wrap page">
      <h1>Your wishlist</h1>
      <p>Opening your wishlist…</p>
    </div>
  );
}
