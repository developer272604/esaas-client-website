import { inr } from '@/lib/format';
import { MAX_STAGE } from '@/lib/constants';
import type { Order, PayMethod, ShipSpeed } from '@/lib/types';
import type { ChargeRequest, ChargeResult, NewOrderInput } from '@/lib/adapter-types';

export const DEMO_OTP = '123456';
export { MAX_STAGE };

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const newOrderId = (): string =>
  'OH' + (globalThis.crypto?.randomUUID?.().replace(/-/g, '').slice(0, 8).toUpperCase() ?? String(Date.now()).slice(-8));

type OtpSend = { ok: true; hint?: string } | { ok: false; error: string };
type OtpCheck = { ok: true; user: { name: string; phone: string } } | { ok: false; error: string };

const auth = {
  async sendOtp(_phone: string): Promise<OtpSend> {
    await wait(150);
    return { ok: true, hint: `Demo OTP is ${DEMO_OTP}.` };
  },
  async verifyOtp({ name, phone, otp }: { name: string; phone: string; otp: string }): Promise<OtpCheck> {
    await wait(150);
    if (otp !== DEMO_OTP) return { ok: false, error: 'That OTP is not correct. Use the demo OTP shown above.' };
    return { ok: true, user: { name: name.trim(), phone } };
  },
};

const payment = {
  async charge(req: ChargeRequest): Promise<ChargeResult> {
    await wait(700);
    if (req.method !== 'cod' && req.amount <= 0) return { ok: false, error: 'Nothing to charge.' };
    return { ok: true, reference: `OH${Date.now().toString().slice(-8)}` };
  },
};

const orders = {
  async create(input: NewOrderInput): Promise<Order> {
    return {
      id: newOrderId(),
      tpl: input.tpl,
      date: Date.now(),
      items: input.items,
      t: input.totals,
      addr: input.address,
      pay: input.pay,
      ship: input.ship,
      stage: 0,
      cancelled: false,
    };
  },
  advance: (o: Order) => (o.cancelled || o.stage >= MAX_STAGE ? o : { ...o, stage: o.stage + 1 }),
  cancel: (o: Order) => (o.stage < 2 ? { ...o, cancelled: true } : o),
  etaDays: (ship: ShipSpeed): [number, number] => (ship === 'exp' ? [1, 2] : [3, 5]),
};

const notify = {
  async orderConfirmation(order: Order, brand: string) {
    const first = order.addr.name.trim().split(' ')[0] || 'there';
    const n = order.items.reduce((a, i) => a + i.qty, 0);
    const text =
      `Hi ${first}, your ${brand} order ${order.id} is confirmed.\n` +
      `${n} item${n === 1 ? '' : 's'}, total ${inr(order.t.total)}.`;
    return { channel: 'whatsapp' as const, text };
  },
};

export const adapters = { auth, payment, orders, notify };

export type { PayMethod };
