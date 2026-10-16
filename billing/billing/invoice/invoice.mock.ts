import { mockOrders } from '@acme-modular/platform.entities.order';
import type { PlainInvoice } from './invoice.js';
import { Invoice } from './invoice.js';

/**
 * demo invoices for the demo orders, newest first. one of each status as of
 * mid-October 2026: o-1003 is open, o-1002 was paid at checkout and o-1001
 * is past its 30-day terms.
 */
export function mockInvoices(): Invoice[] {
  const [recent, lamps, chair] = mockOrders();
  return [Invoice.fromOrder(recent), Invoice.fromOrder(lamps).markPaid('2026-09-28T15:06:00.000Z'), Invoice.fromOrder(chair)];
}

/** the demo invoices as plain objects, e.g. for a mock `GET /invoices` route. */
export const plainMockInvoices: PlainInvoice[] = mockInvoices().map((invoice) => invoice.toObject());
