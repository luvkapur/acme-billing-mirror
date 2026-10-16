import { Money } from '@acme-modular/platform.entities.money';
import type { Order } from '@acme-modular/platform.entities.order';

export type InvoiceLine = {
  description: string;
  /** unit price in minor units (cents). negative for a discount. */
  unitPriceCents: number;
  quantity: number;
};

export type InvoiceStatus = 'paid' | 'open' | 'overdue';

export type PlainInvoice = {
  id: string;
  orderId: string;
  customerId: string;
  /** ISO timestamp. */
  issuedAt: string;
  /** ISO timestamp the payment is due by. */
  dueAt: string;
  lines: InvoiceLine[];
  /** ISO timestamp of the payment. absent while unpaid. */
  paidAt?: string;
  /** ISO 4217 currency code. defaults to USD. */
  currency?: string;
};

export type FromOrderOptions = {
  /** ISO timestamp of the invoice. defaults to when the order was placed. */
  issuedAt?: string;
  /** days the customer has to pay. defaults to 30. */
  termsDays?: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * A bill for an order. Billing issues one per order; its lines add up to
 * exactly what the order charged, discount and shipping included.
 */
export class Invoice {
  constructor(
    readonly id: string,
    readonly orderId: string,
    readonly customerId: string,
    readonly issuedAt: string,
    readonly dueAt: string,
    readonly lines: InvoiceLine[],
    readonly currency: string = 'USD',
    readonly paidAt?: string
  ) {}

  /** the sum of every line, discounts included. */
  get total(): Money {
    return this.lines.reduce(
      (sum, line) => sum.add(new Money(line.unitPriceCents, this.currency).multiply(line.quantity)),
      Money.zero(this.currency)
    );
  }

  /**
   * the status at a point in time: paid once the payment has landed, overdue
   * after the due date, open before it. pass `now` to get a stable answer in
   * tests and previews.
   */
  statusAt(now: Date = new Date()): InvoiceStatus {
    const at = now.getTime();
    if (this.paidAt && Date.parse(this.paidAt) <= at) return 'paid';
    return at > Date.parse(this.dueAt) ? 'overdue' : 'open';
  }

  /** a copy of the invoice paid at the given time; the original is unchanged. */
  markPaid(paidAt: string = new Date().toISOString()): Invoice {
    return new Invoice(this.id, this.orderId, this.customerId, this.issuedAt, this.dueAt, this.lines, this.currency, paidAt);
  }

  toObject(): PlainInvoice {
    return {
      id: this.id,
      orderId: this.orderId,
      customerId: this.customerId,
      issuedAt: this.issuedAt,
      dueAt: this.dueAt,
      lines: this.lines,
      paidAt: this.paidAt,
      currency: this.currency,
    };
  }

  static from(plain: PlainInvoice) {
    return new Invoice(
      plain.id,
      plain.orderId,
      plain.customerId,
      plain.issuedAt,
      plain.dueAt,
      plain.lines,
      plain.currency ?? 'USD',
      plain.paidAt
    );
  }

  /**
   * invoices an order: one line per order line, a "Shipping" line and, when
   * the order had one, a negative "Bulk discount" line, so the invoice total
   * always equals `order.total`. the id follows the order, e.g. `o-1003` → `inv-1003`.
   */
  static fromOrder(order: Order, { issuedAt = order.createdAt, termsDays = 30 }: FromOrderOptions = {}) {
    const lines: InvoiceLine[] = order.lines.map((line) => ({
      description: line.name,
      unitPriceCents: line.unitPriceCents,
      quantity: line.quantity,
    }));
    lines.push({ description: 'Shipping', unitPriceCents: order.shipping.amountCents, quantity: 1 });
    if (order.discount.amountCents > 0) {
      lines.push({ description: 'Bulk discount', unitPriceCents: -order.discount.amountCents, quantity: 1 });
    }
    const dueAt = new Date(Date.parse(issuedAt) + termsDays * DAY_MS).toISOString();
    return new Invoice(`inv-${order.id.replace(/^o-/, '')}`, order.id, order.customerId, issuedAt, dueAt, lines, order.currency);
  }
}
