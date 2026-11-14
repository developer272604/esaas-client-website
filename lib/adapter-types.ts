import type { Address, OrderItem, PayMethod, ShipSpeed, Totals } from '@/lib/types';

export type ChargeRequest = {
  method: PayMethod;
  amount: number;
  upi?: string;
  cardLast4?: string;
};

export type ChargeResult = { ok: true; reference: string } | { ok: false; error: string };

export type NewOrderInput = {
  tpl: string;
  items: OrderItem[];
  totals: Totals;
  address: Address;
  pay: PayMethod;
  ship: ShipSpeed;
};
