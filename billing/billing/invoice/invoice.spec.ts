import { mockOrders } from '@acme-modular/platform.entities.order';
import { Invoice } from './invoice.js';
import { mockInvoices, plainMockInvoices } from './invoice.mock.js';

const midOctober = new Date('2026-10-16T12:00:00.000Z');

it('totals exactly what the order charged, discount and shipping included', () => {
  for (const order of mockOrders()) {
    expect(Invoice.fromOrder(order).total.amountCents).toBe(order.total.amountCents);
  }
  // o-1002: 12 lamps at $49.00, $9.00 shipping, $58.80 bulk discount
  const lamps = Invoice.fromOrder(mockOrders()[1]);
  expect(lamps.lines.slice(-2)).toEqual([
    { description: 'Shipping', unitPriceCents: 900, quantity: 1 },
    { description: 'Bulk discount', unitPriceCents: -5880, quantity: 1 },
  ]);
  expect(lamps.total.format()).toBe('$538.20');
});

it('adds no discount line when the order had none and sets the due date from the terms', () => {
  const invoice = Invoice.fromOrder(mockOrders()[0], { issuedAt: '2026-10-12T00:00:00.000Z', termsDays: 14 });
  expect(invoice.id).toBe('inv-1003');
  expect(invoice.lines.map((line) => line.description)).toEqual(['Standing Desk', 'Monitor Arm', 'Shipping']);
  expect(invoice.dueAt).toBe('2026-10-26T00:00:00.000Z');
});

it('is open before the due date, overdue after it and paid once paid', () => {
  expect(mockInvoices().map((invoice) => invoice.statusAt(midOctober))).toEqual(['open', 'paid', 'overdue']);
  const [open] = mockInvoices();
  expect(open.statusAt(new Date('2026-11-12T00:00:00.000Z'))).toBe('overdue');
  // a payment recorded later does not count yet
  expect(open.markPaid('2026-10-20T00:00:00.000Z').statusAt(midOctober)).toBe('open');
});

it('round-trips through a plain object', () => {
  expect(Invoice.from(plainMockInvoices[1]).toObject()).toEqual(plainMockInvoices[1]);
  expect(Invoice.from(plainMockInvoices[0]).total.amountCents).toBe(60200);
});
