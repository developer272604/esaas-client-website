"use client";
import { useState } from 'react';
import Link from '@/components/common/Link';
import { useRouter } from '@/lib/nav';
import { useCatalog } from '@/lib/hooks';
import { inr } from '@/lib/format';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { unitMrp, unitPrice } from '@/lib/pricing';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useUiStore } from '@/store/ui';
import { Icon } from '@/components/common/Icon';
import { Crumbs, EmptyState, Price, QtyStepper, SectionHead, Stars } from '@/components/common/bits';
import { ProductGrid } from '@/components/common/ProductCard';
import { Gallery, OptionPicker, PincodeCheck, Tabs } from '@/components/product/parts';
import { Txt, productDescId, productNameId, useProductName } from '@/components/demo/Txt';

export function ProductView({ id }: { id: string }) {
  return <DefaultProductView id={id} />;
}

function DefaultProductView({ id }: { id: string }) {
  const { product, products, category, freeShipAt } = useCatalog();
  const p = product(id);
  const pageName = useProductName(p?.id ?? '', p?.name ?? '');
  useDocumentTitle(p ? pageName : 'Product not found');
  if (!p) {
    return (
      <div className="wrap page">
        <EmptyState emoji="🧭" title="Product not found" page text="It may belong to another template, or it is no longer in the catalogue." action={{ label: 'Browse all products', href: '/shop' }} />
      </div>
    );
  }
  return <ProductDetail key={p.id} id={p.id} products={products} category={category} freeShipAt={freeShipAt} />;
}

function ProductDetail({ id, products, category, freeShipAt }: { id: string; products: ReturnType<typeof useCatalog>['products']; category: ReturnType<typeof useCatalog>['category']; freeShipAt: number }) {
  const p = products.find((x) => x.id === id)!;
  const router = useRouter();
  const [opt, setOpt] = useState(0);
  const [qty, setQty] = useState(1);
  const [view, setView] = useState(0);
  const add = useCartStore((s) => s.add);
  const wished = useWishlistStore((s) => s.ids.includes(id));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const toast = useUiStore((s) => s.showToast);
  const openCart = useUiStore((s) => s.openCart);
  const c = category(p.cat);
  const name = useProductName(p.id, p.name);
  const related = products.filter((q) => q.cat === p.cat && q.id !== id);
  const more = (related.length ? related : products.filter((q) => q.id !== id)).slice(0, 4);
  const inStock = (p.optionAvailability?.[opt] ?? p.inStock) !== false;
  const tags = [c?.name, p.tag, p.opts?.label].filter(Boolean).join(', ');

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) return void (await navigator.share({ title: name, url }));
      await navigator.clipboard.writeText(url);
      toast('Link copied to clipboard');
    } catch {
      // dismissed, or the clipboard is blocked: nothing to report
    }
  };

  return (
    <div className="wrap page">
      <Crumbs trail={[...(c ? [{ label: c.name, href: `/category/${c.slug}` }] : []), { label: name }]} />
      <div className="pg">
        <Gallery product={p} view={view} onView={setView} />
        <div className="info">
          {c && <p className="pcat">{c.name}</p>}
          <div className="pname-row">
            <Txt as="h1" id={productNameId(p.id)} text={p.name} />
            <span className="stock-badge">{inStock ? 'In stock' : 'Out of stock'}</span>
          </div>
          <div className="info-rating">
            {p.rev > 0 && <Stars rating={p.rating} />}
            <span className="rc">{p.rev > 0 ? `${p.rating} (${p.rev.toLocaleString('en-IN')} reviews)` : 'No reviews yet'}</span>
          </div>
          <Price price={unitPrice(p, opt)} mrp={unitMrp(p, opt)} large />
          <p className="tax">Inclusive of all taxes</p>
          <Txt as="p" className="lead" id={productDescId(p.id)} text={p.desc} />
          {p.opts && <OptionPicker opts={p.opts} value={opt} onChange={setOpt} />}
          <div className="buy">
            <QtyStepper value={qty} onChange={setQty} />
            <button
              type="button"
              className="btn"
              disabled={!inStock}
              onClick={() => {
                add(id, opt, qty);
                openCart();
              }}
            >
              Add to cart
            </button>
            <button
              type="button"
              className="btn accent"
              disabled={!inStock}
              onClick={() => {
                add(id, opt, qty);
                router.push('/checkout');
              }}
            >
              Buy now
            </button>
            <button
              type="button"
              className={`sqr${wished ? ' on' : ''}`}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={wished}
              onClick={() => {
                const added = toggleWish(id);
                if (added) toast('Saved to wishlist', { label: 'View wishlist', href: '/wishlist' });
                else toast('Removed from wishlist');
              }}
            >
              <Icon name="heart" size={20} filled={wished} />
            </button>
          </div>
          <PincodeCheck />
          <div className="pmeta">
            <span>SKU: {p.id.toUpperCase()}</span>
            {tags && <span>Tags: {tags}</span>}
            <button type="button" className="linkbtn" onClick={share}>
              <Icon name="share" size={14} /> Share
            </button>
          </div>
          <div className="perks">
            <div><Icon name="truck" />Free delivery over {inr(freeShipAt)}</div>
            <div><Icon name="refresh" /><Link href="/returns">7-day easy returns</Link></div>
            <div><Icon name="shield" />Secure payments with Devduo Pay</div>
          </div>
        </div>
      </div>
      <Tabs product={p} />
      <section className="s related">
        <SectionHead title="You may also like" link={c ? { label: 'See all', href: `/category/${c.slug}` } : undefined} />
        <ProductGrid products={more} />
      </section>
      <p className="tax"><Link href="/shop">Continue browsing</Link></p>
    </div>
  );
}
