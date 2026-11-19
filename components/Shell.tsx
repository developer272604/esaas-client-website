'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname } from '@/lib/nav';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { WishlistDrawer } from '@/components/wishlist/WishlistDrawer';
import { ModalHost } from '@/components/common/ModalHost';
import { ToastHost } from '@/components/common/Toast';

/** Header, page, footer, cart drawer and dialogs shared by every route. */
export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      <ModalHost />
      <ToastHost />
    </>
  );
}
