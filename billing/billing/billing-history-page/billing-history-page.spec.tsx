import { render, screen, fireEvent, within } from '@testing-library/react';
import { createHttpClient, createMockTransport } from '@acme-modular/platform.utils.http-client';
import { plainMockInvoices } from '@acme-modular/billing.billing.invoice';
import { BillingHistoryPage } from './billing-history-page.js';

const midOctober = new Date('2026-10-16T12:00:00.000Z');

// zero latency keeps the tests fast.
const client = createHttpClient({
  baseUrl: 'http://mock.local',
  transport: createMockTransport({ 'GET /invoices': () => plainMockInvoices }, { latencyMs: 0 }),
});

it('lists every invoice with its date, total and status', async () => {
  render(<BillingHistoryPage client={client} now={midOctober} />);
  expect(screen.getByRole('status', { name: 'Loading invoices' })).toBeTruthy();

  const row = (await screen.findByText('inv-1003')).closest('tr')!;
  expect(row.textContent).toContain('Oct 12, 2026');
  expect(row.textContent).toContain('$602.00');
  expect(within(row).getByText('Open')).toBeTruthy();
  expect(within(screen.getByText('inv-1002').closest('tr')!).getByText('Paid')).toBeTruthy();
  expect(within(screen.getByText('inv-1001').closest('tr')!).getByText('Overdue')).toBeTruthy();
});

it('opens the invoice in a modal and closes it on Escape', async () => {
  render(<BillingHistoryPage client={client} now={midOctober} />);
  fireEvent.click(await screen.findByRole('button', { name: 'View invoice inv-1002' }));

  const dialog = screen.getByRole('dialog', { name: 'Invoice inv-1002' });
  expect(within(dialog).getByText('Bulk discount')).toBeTruthy();
  expect(within(dialog).getByText('$538.20')).toBeTruthy();

  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('shows an error when the invoices fail to load', async () => {
  const offline = createHttpClient({ baseUrl: 'http://mock.local', transport: createMockTransport({}, { latencyMs: 0 }) });
  render(<BillingHistoryPage client={offline} now={midOctober} />);
  expect((await screen.findByRole('alert')).textContent).toContain("We couldn't load your invoices");
});
