'use client';

import { herbal } from '@/lib/catalog';
import { adapters } from '@/lib/adapters';
import { computeTotals, toPriced, unitPrice } from '@/lib/pricing';
import { FIELD_ORDER, validateCheckout, type CheckoutErrors } from '@/lib/validation';
import { useAuthStore } from './auth';
import { useCartStore } from './cart';
import { useCatalogStore } from './catalog';
import { useCheckoutStore } from './checkout';
import { useOrdersStore } from './orders';
import { useUiStore } from './ui';

/** Resolves a product by id against whatever catalog this browser has live right now (see store/catalog.ts). */
const getProduct = (id: string) => useCatalogStore.getState().products.find((p) => p.id === id);

export function checkCheckout(): CheckoutErrors {
  return validateCheckout(useCheckoutStore.getState().form);
}

export const firstErrorField = (e: CheckoutErrors) => FIELD_ORDER.find((k) => e[k]);

let placing = false;

/** Runs the preview payment, saves the order, and opens the confirmation page. */
export async function runPlaceOrder(navigate: (href: string) => void): Promise<void> {
  if (placing) return;
  const cart = useCartStore.getState();
  const form = useCheckoutStore.getState().form;
  const lines = toPriced(cart.lines, getProduct);
  if (!lines.length) return;
  const totals = computeTotals(lines, { coupon: cart.coupon, speed: form.ship, pay: form.pay, freeAt: herbal.freeShipAt });

  placing = true;
  useUiStore.getState().openModal({ t: 'busy', title: 'Processing payment', text: 'Please do not close this page.' });
  try {
    const charge = await adapters.payment.charge({
      method: form.pay,
      amount: totals.total,
      upi: form.upi,
      cardLast4: form.card.replace(/\s/g, '').slice(-4),
    });
    if (!charge.ok) {
      useUiStore.setState({ modal: null });
      useUiStore.getState().showToast(charge.error);
      return;
    }
    const order = await adapters.orders.create({
      tpl: herbal.id,
      items: lines.map((l) => ({
        id: l.product.id,
        name: l.product.name,
        emoji: l.product.emoji,
        opt: l.product.opts ? l.product.opts.values[l.o] ?? '' : '',
        qty: l.qty,
        price: unitPrice(l.product, l.o),
      })),
      totals,
      address: { name: form.name, phone: form.phone, addr: form.addr, city: form.city, pin: form.pin, state: form.state },
      pay: form.pay,
      ship: form.ship,
    });
    useOrdersStore.getState().add(order);
    useCartStore.getState().clear();
    useCheckoutStore.getState().set({ card: '', exp: '', cvv: '' });
    navigate(`/success?orderId=${encodeURIComponent(order.id)}`);
  } catch {
    useUiStore.setState({ modal: null });
    useUiStore.getState().showToast('Something went wrong. You were not charged. Please try again.');
  } finally {
    placing = false;
  }
}

/** Validate, ask for sign-in when needed, then place the order. */
export function placeOrder(navigate: (href: string) => void): CheckoutErrors {
  const errors = checkCheckout();
  if (Object.keys(errors).length) return errors;
  if (!useAuthStore.getState().user) {
    const ui = useUiStore.getState();
    ui.setAfterAuth(() => void runPlaceOrder(navigate));
    ui.openModal({ t: 'auth' });
    return {};
  }
  void runPlaceOrder(navigate);
  return {};
}
