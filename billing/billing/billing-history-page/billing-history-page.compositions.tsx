import { AcmeTheme } from '@acme-modular/design.theme.acme-theme';
import { createHttpClient, createMockTransport } from '@acme-modular/platform.utils.http-client';
import { BillingHistoryPage } from './billing-history-page.js';

// a fixed date keeps the statuses stable: one open, one paid, one overdue.
const midOctober = new Date('2026-10-16T12:00:00.000Z');

const emptyClient = createHttpClient({
  baseUrl: 'http://mock.local',
  transport: createMockTransport({ 'GET /invoices': () => [] }, { latencyMs: 300 }),
});

// no routes, so every request answers 404.
const offlineClient = createHttpClient({
  baseUrl: 'http://mock.local',
  transport: createMockTransport({}, { latencyMs: 300 }),
});

export const BillingHistory = () => (
  <AcmeTheme>
    <BillingHistoryPage now={midOctober} />
  </AcmeTheme>
);

export const NoInvoicesYet = () => (
  <AcmeTheme>
    <BillingHistoryPage client={emptyClient} now={midOctober} />
  </AcmeTheme>
);

export const BillingUnavailable = () => (
  <AcmeTheme>
    <BillingHistoryPage client={offlineClient} now={midOctober} />
  </AcmeTheme>
);
