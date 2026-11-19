"use client";
import { useEffect, useRef } from 'react';
import Link from '@/components/common/Link';
import { useCatalog } from '@/lib/hooks';
import { fromPrice } from '@/lib/pricing';
import { usePathname } from '@/lib/nav';
import { consumeWishlistRoute } from '@/lib/wishlist-route';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useUiStore } from '@/store/ui';
import { Art } from '@/components/common/Art';
import { Icon } from '@/components/common/Icon';
import { Price } from '@/components/common/bits';
import { Txt, productNameId } from '@/components/demo/Txt';

/**
 * The wishlist, as a drawer over whatever page the visitor is on, the same way the cart is.
 * Opened by the header heart, and by the old /wishlist address. Dialog behaviour matches
 * CartDrawer: focus is trapped, Escape and the backdrop close it, and the page behind does not scroll.
 */
export function WishlistDrawer() {
  const open = useUiStore((s) => s.wishlistOpen);
  const close = useUiStore((s) => s.closeWishlist);
  const modal = useUiStore((s) => s.modal);
  const toast = useUiStore((s) => s.showToast);
  const pathname = usePathname();
  const { product } = useCatalog();
  const ids = useWishlistStore((s) => s.ids);
  const removeWish = useWishlistStore((s) => s.remove);
  const add = useCartStore((s) => s.add);
  const panelRef = useRef<HTMLDivElement>(null);

  // A dialog on top of the drawer (sign-in, confirm) takes Escape first.
  useFocusTrap(panelRef, open && !modal, close);

  // Moving to another page closes the drawer, except the hop from /wishlist, which is how it gets opened by address.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (consumeWishlistRoute()) return;
    close();
  }, [pathname, close]);

  // The page behind does not scroll while the wishlist is open.
  useBodyScrollLock(open);

  const list = ids.flatMap((id) => product(id) ?? []);
  const inert = open ? {} : ({ inert: true } as object);

  return (
    <>
      <div className={`overlay cd-overlay${open ? ' on' : ''}`} data-no-capture onClick={close} aria-hidden="true" />
      <div id="wishlist-drawer" data-no-capture className={open ? 'on' : ''} ref={panelRef} role="dialog" aria-modal={open} aria-label="Wishlist" tabIndex={-1} {...inert}>
        <div className="cd-head">
          <h2>
            <Txt id="page.wishlist.title" text="Your wishlist" /> <span>({list.length})</span>
          </h2>
          <button type="button" className="icon" aria-label="Close wishlist" onClick={close}>
            <Icon name="x" />
          </button>
        </div>

        {!list.length ? (
          <div className="cd-empty">
            <Icon name="heart" size={64} className="wd-empty-art" />
            <h3>Nothing saved yet</h3>
            <p>Tap the heart on any product to save it here, or browse the shop.</p>
            <div className="cd-empty-acts">
              <Link className="btn block" href="/shop" onClick={close}>
                Start shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="cd-body">
            <ul className="cd-lines">
              {list.map((p) => {
                const { price, mrp, from } = fromPrice(p);
                return (
                  <li className="cd-line" key={p.id}>
                    <Link href={`/product/${p.id}`} tabIndex={-1} aria-hidden="true" className="cd-img">
                      <Art id={p.id} emoji={p.emoji} name={p.name} image={p.image} sizes="90px" />
                    </Link>
                    <div className="cd-info">
                      <div className="cd-top">
                        <h3>
                          <Link href={`/product/${p.id}`}>
                            <Txt id={productNameId(p.id)} text={p.name} />
                          </Link>
                        </h3>
                        <button type="button" className="icon sm" aria-label={`Remove ${p.name} from wishlist`} onClick={() => removeWish(p.id)}>
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                      <Price price={price} mrp={mrp} from={from} />
                      <div className="cd-act">
                        <button
                          type="button"
                          className="btn sm"
                          onClick={() => {
                            add(p.id, 0, 1);
                            removeWish(p.id);
                            toast(`Moved ${p.name} to cart`, { label: 'View cart', href: '/cart' });
                          }}
                        >
                          <Icon name="bag" size={14} /> Add to cart
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
