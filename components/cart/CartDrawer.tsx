"use client";
import { useEffect, useRef, useState } from 'react';
import Link from '@/components/common/Link';
import { useCatalog } from '@/lib/hooks';
import { inr } from '@/lib/format';
import { usePathname } from '@/lib/nav';
import { consumeCartRoute } from '@/lib/cart-route';
import { COUPONS, computeTotals, freeShipRemaining, fromPrice, lineKey, toPriced, unitMrp, unitPrice } from '@/lib/pricing';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';
import { cartCount, useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useUiStore } from '@/store/ui';
import type { Coupon } from '@/lib/types';
import { Art } from '@/components/common/Art';
import { Icon } from '@/components/common/Icon';
import { QtyStepper } from '@/components/common/bits';
import { Txt, productNameId } from '@/components/demo/Txt';

/** Progress to free delivery. Shown at the top of the cart, and nowhere else. */
function FreeShipBar({ sub, freeAt, free }: { sub: number; freeAt: number; free: boolean }) {
  const left = freeShipRemaining(sub, freeAt);
  return (
    <div className="cd-ship">
      <p>
        <Icon name="truck" size={16} />
        {free ? <b>You have free delivery</b> : <span>Add <b>{inr(left)}</b> more for free delivery</span>}
      </p>
      <div className="bar2" role="progressbar" aria-valuemin={0} aria-valuemax={freeAt} aria-valuenow={Math.min(freeAt, sub)} aria-label="Progress to free delivery">
        <i style={{ width: `${free ? 100 : Math.min(100, (sub / freeAt) * 100)}%` }} />
      </div>
    </div>
  );
}

/**
 * The cart, as a drawer over whatever page the visitor is on. Opened by the header bag, by adding
 * something to the cart and by the old /cart address. Dialog behaviour: focus is trapped, Escape and the
 * backdrop close it, and the page behind does not scroll.
 */
export function CartDrawer() {
  const open = useUiStore((s) => s.cartOpen);
  const close = useUiStore((s) => s.closeCart);
  const openWishlist = useUiStore((s) => s.openWishlist);
  const modal = useUiStore((s) => s.modal);
  const toast = useUiStore((s) => s.showToast);
  const pathname = usePathname();
  const { product, products, freeShipAt } = useCatalog();
  const lines = useCartStore((s) => s.lines);
  const storedCoupon = useCartStore((s) => s.coupon);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const add = useCartStore((s) => s.add);
  const wishIds = useWishlistStore((s) => s.ids);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const panelRef = useRef<HTMLDivElement>(null);
  const coupon = COUPONS.includes(storedCoupon as Coupon) ? storedCoupon : null;

  // A dialog on top of the drawer (sign-in, confirm) takes Escape first.
  useFocusTrap(panelRef, open && !modal, close);

  // Moving to another page closes the drawer, except the hop from /cart, which is how the drawer gets opened by address.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (consumeCartRoute()) return;
    close();
  }, [pathname, close]);

  // The page behind does not scroll while the cart is open.
  useBodyScrollLock(open);

  const priced = toPriced(lines, product);
  const totals = computeTotals(priced, { coupon, speed: 'std', pay: 'upi', freeAt: freeShipAt });
  const freeShip = freeShipRemaining(totals.sub, freeShipAt) === 0 || coupon === 'FREESHIP';
  const count = cartCount(priced.map((l) => ({ id: l.product.id, o: l.o, qty: l.qty })));
  const inert = open ? {} : ({ inert: true } as object);

  const cartIds = new Set(priced.map((l) => l.product.id));
  const cartCats = new Set(priced.map((l) => l.product.cat));
  const crossSell = products
    .filter((p) => !cartIds.has(p.id))
    .sort((a, b) => Number(cartCats.has(b.cat)) - Number(cartCats.has(a.cat)))
    .slice(0, 8);

  return (
    <>
      <div className={`overlay cd-overlay${open ? ' on' : ''}`} data-no-capture onClick={close} aria-hidden="true" />
      <div id="cart-drawer" data-no-capture className={open ? 'on' : ''} ref={panelRef} role="dialog" aria-modal={open} aria-label="Shopping cart" tabIndex={-1} {...inert}>
        <div className="cd-head">
          <h2>
            <Txt id="page.cart.title" text="Your cart" /> <span>({count})</span>
          </h2>
          <button type="button" className="icon" aria-label="Close cart" onClick={close}>
            <Icon name="x" />
          </button>
        </div>

        {!priced.length ? (
          <div className="cd-empty">
            <img className="cd-empty-art" src="/images/cart/empty-cart.webp" alt="" width={140} height={104} />
            <h3>Nothing in your cart yet</h3>
            <p>Shop to add items here, or go to your saved items to see what you bookmarked earlier.</p>
            <div className="cd-empty-acts">
              <Link className="btn block" href="/shop" onClick={close}>
                Start shopping
              </Link>
              <button
                type="button"
                className="btn ghost block"
                onClick={() => {
                  close();
                  openWishlist();
                }}
              >
                Go to saved items
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="cd-body">
              <FreeShipBar sub={totals.sub} freeAt={freeShipAt} free={freeShip} />
              <ul className="cd-lines">
                {priced.map((l) => {
                  const p = l.product;
                  const key = lineKey(p.id, l.o);
                  return (
                    <li className="cd-line" key={key}>
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
                          <b>{inr(unitPrice(p, l.o) * l.qty)}</b>
                        </div>
                        {p.opts && (
                          <small>
                            {p.opts.label}: {p.opts.values[l.o]}
                          </small>
                        )}
                        <small className="each">
                          {inr(unitPrice(p, l.o))} each
                          {unitMrp(p, l.o) > unitPrice(p, l.o) && <s aria-label={`Original price ${inr(unitMrp(p, l.o))}`}> {inr(unitMrp(p, l.o))}</s>}
                        </small>
                        <div className="cd-act">
                          <QtyStepper value={l.qty} onChange={(n) => setQty(key, n)} label={` for ${p.name}`} />
                          <div className="lk">
                            <button
                              type="button"
                              className={`icon sm heart${wishIds.includes(p.id) ? ' on' : ''}`}
                              aria-label={`${wishIds.includes(p.id) ? 'Remove from' : 'Add to'} wishlist: ${p.name}`}
                              aria-pressed={wishIds.includes(p.id)}
                              onClick={() => {
                                const added = toggleWish(p.id);
                                toast(added ? 'Saved to wishlist' : 'Removed from wishlist', added ? { label: 'View wishlist', href: '/wishlist' } : undefined);
                              }}
                            >
                              <Icon name="heart" size={16} filled={wishIds.includes(p.id)} />
                            </button>
                            <button type="button" className="icon sm" aria-label={`Remove ${p.name}`} onClick={() => remove(key)}>
                              <Icon name="trash" size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="cd-foot">
              {crossSell.length > 0 && (
                <div className="cd-xsell">
                  <h3>Frequently purchased with</h3>
                  <ul>
                    {crossSell.map((p) => {
                      const { price } = fromPrice(p);
                      return (
                        <li key={p.id}>
                          <div>
                            <Link href={`/product/${p.id}`} tabIndex={-1} aria-hidden="true" className="cd-xs-img">
                              <Art id={p.id} emoji={p.emoji} name={p.name} image={p.image} sizes="90px" />
                            </Link>
                            <button
                              type="button"
                              className="cd-xs-add"
                              onClick={() => {
                                add(p.id, 0, 1);
                                toast(`Added ${p.name} to cart`, { label: 'View cart', href: '/cart' });
                              }}
                            >
                              Add
                            </button>
                            <Link href={`/product/${p.id}`} className="cd-xs-name">
                              <Txt id={productNameId(p.id)} text={p.name} />
                            </Link>
                          </div>
                          <p className="cd-xs-price">{inr(price)}</p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <dl className="cd-sum">
                <div className="t">
                  <dt>Estimated total</dt>
                  <dd>{inr(totals.total)}</dd>
                </div>
              </dl>
              <Link className="btn block" href="/checkout" onClick={close}>
                Proceed to checkout
              </Link>
              <button type="button" className="linkbtn cd-more" onClick={close}>
                Continue shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
