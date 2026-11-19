"use client";
import { Fragment, useState } from 'react';
import { useRouter } from '@/lib/nav';
import { useCatalog } from '@/lib/hooks';
import { COUPONS, computeTotals, normaliseCoupon, toPriced, unitPrice } from '@/lib/pricing';
import { validateCheckout, type CheckoutErrors } from '@/lib/validation';
import type { Coupon } from '@/lib/types';
import { useCartStore } from '@/store/cart';
import { useUiStore } from '@/store/ui';
import { useCheckoutStore } from '@/store/checkout';
import { firstErrorField, placeOrder } from '@/store/actions';
import { EmptyState } from '@/components/common/bits';
import Link from '@/components/common/Link';
import { Icon } from '@/components/common/Icon';
import { Txt, useNameOf } from '@/components/demo/Txt';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { AddressForm, OrderSummary, PaymentOptions, ShippingOptions } from '@/components/checkout/parts';
import { inr } from '@/lib/format';

const LABELS: Record<keyof CheckoutErrors, string> = {
  name: 'Full name', phone: 'Mobile number', addr: 'Address', city: 'City', pin: 'Pincode', state: 'State',
  upi: 'UPI ID', card: 'Card number', exp: 'Expiry', cvv: 'CVV',
};

const STEPS = [
  { n: 1, label: 'Shipping' },
  { n: 2, label: 'Payment' },
  { n: 3, label: 'Review' },
];

export function CheckoutView() {
  const { product, freeShipAt } = useCatalog();
  const nameOf = useNameOf();
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const storedCoupon = useCartStore((s) => s.coupon);
  const setCoupon = useCartStore((s) => s.setCoupon);
  const coupon = COUPONS.includes(storedCoupon as Coupon) ? storedCoupon : null;
  const form = useCheckoutStore((s) => s.form);
  const set = useCheckoutStore((s) => s.set);
  const busy = useUiStore((s) => s.modal?.t === 'busy');
  const toast = useUiStore((s) => s.showToast);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [announce, setAnnounce] = useState('');
  const [code, setCode] = useState('');
  useDocumentTitle('Checkout');

  const applyCoupon = () => {
    const c = normaliseCoupon(code);
    if (!c) return toast('That coupon is not valid. Try WELCOME10 or FREESHIP.');
    setCoupon(c);
    setCode('');
    toast('Coupon applied');
  };

  // Drives the (decorative) step indicator: live progress, not the submit-time field errors.
  // Everything here is one page, so "Review" is never a separate step the shopper is "in" —
  // it only ever shows as reached once the order is actually placed.
  const liveErrs = validateCheckout(form);
  const addressDone = !liveErrs.name && !liveErrs.phone && !liveErrs.addr && !liveErrs.city && !liveErrs.pin && !liveErrs.state;
  const activeStep = addressDone ? 2 : 1;

  const priced = toPriced(lines, product);
  if (!priced.length) {
    return (
      <div className="wrap page">
        <EmptyState emoji="🛍️" title="Nothing to check out" page text="Your cart is empty." action={{ label: 'Start shopping', href: '/shop' }} />
      </div>
    );
  }
  const totals = computeTotals(priced, { coupon, speed: form.ship, pay: form.pay, freeAt: freeShipAt });

  const onSet: typeof set = (patch) => {
    set(patch);
    // Clear an error as soon as that field is touched.
    const touched = Object.keys(patch) as (keyof CheckoutErrors)[];
    if (touched.some((k) => errors[k])) setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !touched.includes(k as keyof CheckoutErrors))));
  };

  const submit = () => {
    const errs = placeOrder((href) => router.push(href));
    setErrors(errs);
    const names = Object.keys(errs).map((k) => LABELS[k as keyof CheckoutErrors]);
    setAnnounce(names.length ? `${names.length} field${names.length === 1 ? ' needs' : 's need'} attention: ${names.join(', ')}.` : '');
    const first = firstErrorField(errs);
    if (first) {
      const el = document.getElementById(`ck-${first}`);
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el?.focus({ preventScroll: true });
    }
  };

  return (
    <div className="wrap page ck-page">
      <div className="ck-status">
        <Link href="/cart" className="ck-back">
          <Icon name="chevronLeft" size={16} /> Back to Cart
        </Link>
        <span className="ck-secure">
          <Icon name="shield" size={16} /> Secure Checkout
        </span>
      </div>
      <div className="ph">
        <h1>
          <Txt id="page.checkout.title" text="Checkout" />
        </h1>
      </div>
      <ol className="ck-steps" aria-hidden="true">
        {STEPS.map((s, i) => (
          <Fragment key={s.n}>
            {i > 0 && <li className="ck-step-line" />}
            <li className={s.n === activeStep ? 'on' : s.n === 1 && addressDone ? 'done' : ''}>
              <span className="ck-step-n">{s.n === 1 && addressDone && activeStep !== 1 ? <Icon name="check" size={12} /> : s.n}</span>
              <span>{s.label}</span>
            </li>
          </Fragment>
        ))}
      </ol>
      <div className="two">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="sr-only" role="alert" aria-live="assertive">
            {announce}
          </div>
          <AddressForm form={form} errors={errors} set={onSet} />
          <ShippingOptions value={form.ship} onChange={(ship) => set({ ship })} freeAt={freeShipAt} />
          <PaymentOptions form={form} errors={errors} set={onSet} />
        </form>
        <OrderSummary
          totals={totals}
          lines={priced.map((l) => ({
            id: l.product.id,
            name: nameOf(l.product.id, l.product.name),
            image: l.product.image,
            art: l.product.art,
            emoji: l.product.emoji,
            variant: l.product.opts ? `${l.product.opts.label}: ${l.product.opts.values[l.o]}` : undefined,
            qty: l.qty,
            amount: unitPrice(l.product, l.o) * l.qty,
          }))}
          footer={
            <>
              <button type="button" className="btn block place" onClick={submit} disabled={busy}>
                {form.pay === 'cod' ? 'Place order' : `Pay ${inr(totals.total)}`}
                <Icon name="chevronRight" size={18} />
              </button>
              <p className="hint">Demo store. No money is charged.</p>
            </>
          }
        >
          {coupon ? (
            <p className="hint">
              Coupon {coupon} applied.{' '}
              <button type="button" className="linkbtn" onClick={() => setCoupon(null)}>
                Remove
              </button>
            </p>
          ) : (
            <>
              <div className="cp">
                <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyCoupon()} placeholder="Coupon code" aria-label="Coupon code" />
                <button type="button" className="btn ghost sm" onClick={applyCoupon}>
                  Apply
                </button>
              </div>
              <p className="hint">Try WELCOME10 or FREESHIP</p>
            </>
          )}
        </OrderSummary>
      </div>
    </div>
  );
}
