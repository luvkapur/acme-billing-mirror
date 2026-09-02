import { invoiceTotal } from './invoice-total.js';

it('sums line items', () => {
  expect(invoiceTotal([{ unitPrice: 2.5, quantity: 2 }, { unitPrice: 1, quantity: 3 }])).toBe(8);
});
