import { AcmeTheme } from '@acme-modular/design.theme.acme-theme';
import { mockInvoices } from '@acme-modular/billing.billing.invoice';
import { InvoiceView } from './invoice-view.js';

// a fixed date keeps the statuses stable: one open, one paid, one overdue.
const midOctober = new Date('2026-10-16T12:00:00.000Z');

export const OpenInvoice = () => (
  <AcmeTheme>
    <InvoiceView invoice={mockInvoices()[0]} now={midOctober} />
  </AcmeTheme>
);

export const PaidWithBulkDiscount = () => (
  <AcmeTheme>
    <InvoiceView invoice={mockInvoices()[1]} now={midOctober} />
  </AcmeTheme>
);

export const OverdueInvoice = () => (
  <AcmeTheme>
    <InvoiceView invoice={mockInvoices()[2]} now={midOctober} />
  </AcmeTheme>
);
