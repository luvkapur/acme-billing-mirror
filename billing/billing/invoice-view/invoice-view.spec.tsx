import { render, screen } from '@testing-library/react';
import { mockInvoices } from '@acme-modular/billing.billing.invoice';
import { InvoiceView } from './invoice-view.js';

const midOctober = new Date('2026-10-16T12:00:00.000Z');

it('lists every line with its amount and the total', () => {
  render(<InvoiceView invoice={mockInvoices()[0]} now={midOctober} />);
  // header, standing desk, monitor arms, shipping, total
  expect(screen.getAllByRole('row')).toHaveLength(5);
  expect(screen.getByText('Monitor Arm').closest('tr')?.textContent).toContain('$178.00');
  expect(screen.getByRole('rowheader', { name: 'Total' }).closest('tr')?.textContent).toContain('$602.00');
});

it('shows the bulk discount as a negative line', () => {
  render(<InvoiceView invoice={mockInvoices()[1]} now={midOctober} />);
  expect(screen.getByText('Bulk discount').closest('tr')?.textContent).toContain('-$58.80');
  expect(screen.getByRole('rowheader', { name: 'Total' }).closest('tr')?.textContent).toContain('$538.20');
});

it('computes the status badge for the given date', () => {
  const { rerender } = render(<InvoiceView invoice={mockInvoices()[2]} now={midOctober} />);
  expect(screen.getByText('Overdue')).toBeTruthy();
  rerender(<InvoiceView invoice={mockInvoices()[2]} now={new Date('2026-08-10T00:00:00.000Z')} />);
  expect(screen.getByText('Open')).toBeTruthy();
  expect(screen.getByText('Sep 2, 2026')).toBeTruthy();
});
