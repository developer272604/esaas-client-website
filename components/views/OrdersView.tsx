"use client";
import Link from '@/components/common/Link';
import { adapters, MAX_STAGE } from '@/lib/adapters';
import { useCatalog } from '@/lib/hooks';
import { fmtDate, inr } from '@/lib/format';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { useOrdersStore } from '@/store/orders';
import { useUiStore } from '@/store/ui';
import { Art } from '@/components/common/Art';
import { Icon } from '@/components/common/Icon';
import { Crumbs, EmptyState } from '@/components/common/bits';
import { Txt } from '@/components/demo/Txt';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import type { Order } from '@/lib/types';

export const STAGES = ['Placed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];

function OrderCard({ o }: { o: Order }) {
  const { product } = useCatalog();
  const replace = useOrdersStore((s) => s.replace);
  const add = useCartStore((s) => s.add);
  const toast = useUiStore((s) => s.showToast);
  const openCart = useUiStore((s) => s.openCart);
  const canCancel = !o.cancelled && o.stage < 2;
  const canAdvance = !o.cancelled && o.stage < MAX_STAGE;
  const itemCount = o.items.reduce((n, i) => n + i.qty, 0);
  const delivered = !o.cancelled && o.stage === MAX_STAGE;

  return (
    <article className="oc" data-order={o.id}>
      <div className="od-head">
        <h2>Order details</h2>
        <button type="button" className="btn ghost sm" onClick={() => toast('Demo store — there is no real invoice to download.')}>
          <Icon name="download" size={16} /> Download invoice
        </button>
      </div>
      <div className="od-stats">
        <div>
          <small>Order number</small>
          <b>{o.id}</b>
        </div>
        <div>
          <small>Order placed</small>
          <b>{fmtDate(o.date)}</b>
        </div>
        <div>
          <small>Order delivered</small>
          <b>{delivered ? fmtDate(o.date) : '—'}</b>
        </div>
        <div>
          <small>No of items</small>
          <b>{itemCount} item{itemCount === 1 ? '' : 's'}</b>
        </div>
        <div>
          <small>Status</small>
          <b className={o.cancelled ? 'bad' : delivered ? 'ok' : ''}>{o.cancelled ? 'Cancelled' : STAGES[o.stage]}</b>
        </div>
      </div>

      {!o.cancelled && (
        <div className="od-track">
          <div className="od-track-head">
            <h3>Order tracking</h3>
            <span className="muted">Order ID: {o.id}</span>
          </div>
          <ol className="tl" aria-label="Order progress">
            {STAGES.map((s, i) => (
              <li key={s} className={i <= o.stage ? 'd' : ''} aria-current={i === o.stage ? 'step' : undefined}>
                <span className="tl-n">{i + 1}</span>
                <b>{s}</b>
                <small>{i <= o.stage ? fmtDate(o.date) : ''}</small>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="od-items">
        <h3>Items from the order</h3>
        <div className="od-table">
          <div className="od-row od-row-head" aria-hidden="true">
            <span>Product</span>
            <span>Variant</span>
            <span>Quantity</span>
            <span>Price</span>
          </div>
          {o.items.map((i) => {
            const p = product(i.id);
            return (
              <div className="od-row" key={i.id + i.opt}>
                <Link href={`/product/${i.id}`} className="od-prod">
                  <Art id={i.id} emoji={i.emoji} name={i.name} image={p?.image} sizes="56px" />
                  <span>
                    <b>{i.name}</b>
                    <small className="muted">Product ID: {i.id}</small>
                  </span>
                </Link>
                <span data-label="Variant">{i.opt || '—'}</span>
                <span data-label="Quantity">{i.qty}</span>
                <span data-label="Price">{inr(i.price * i.qty)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="od-totals">
        <div className="od-tbox">
          {o.t.disc > 0 && (
            <div className="r">
              <span>Discount</span>
              <span>−{inr(o.t.disc)}</span>
            </div>
          )}
          <div className="r">
            <span>Delivery</span>
            <span>{o.t.ship ? inr(o.t.ship) : 'Free'}</span>
          </div>
        </div>
        <div className="od-tbox">
          <div className="r">
            <span>Subtotal</span>
            <span>{inr(o.t.sub)}</span>
          </div>
          <div className="r t">
            <span>Total</span>
            <span>{inr(o.t.total)}</span>
          </div>
        </div>
      </div>

      <div className="oacts">
        <button
          type="button"
          className="btn ghost sm"
          onClick={() => {
            o.items.forEach((i) => {
              const p = product(i.id);
              if (p) add(i.id, p.opts ? Math.max(0, p.opts.values.indexOf(i.opt)) : 0, i.qty);
            });
            openCart();
          }}
        >
          Buy again
        </button>
        {canAdvance && (
          <button type="button" className="btn ghost sm" onClick={() => replace(adapters.orders.advance(o))}>
            Demo: move to next stage
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => {
              replace(adapters.orders.cancel(o));
              toast('Order cancelled');
            }}
          >
            Cancel order
          </button>
        )}
      </div>
    </article>
  );
}

export function OrdersView() {
  const { template } = useCatalog();
  const user = useAuthStore((s) => s.user);
  const orders = useOrdersStore((s) => s.orders);
  const openModal = useUiStore((s) => s.openModal);
  useDocumentTitle('My orders');

  if (!user) {
    return (
      <div className="wrap page">
        <EmptyState emoji="🔐" title="Sign in to see your orders" page text="Use your mobile number. It takes ten seconds." action={{ label: 'Sign in', onClick: () => openModal({ t: 'auth' }) }} />
      </div>
    );
  }
  const mine = orders.filter((o) => o.tpl === template.id);
  return (
    <div className="wrap page">
      <Crumbs trail={[{ label: 'My orders' }]} />
      <div className="ph">
        <h1>
          <Txt id="page.orders.title" text="My orders" />
        </h1>
      </div>
      {mine.length ? (
        mine.map((o) => <OrderCard key={o.id} o={o} />)
      ) : (
        <EmptyState emoji="📦" title="No orders yet" text="Orders you place will appear here." action={{ label: 'Start shopping', href: '/shop' }} />
      )}
    </div>
  );
}
