import { renderHook, waitFor, act } from '@testing-library/react';
import { createHttpClient, createMockTransport } from '@acme-modular/platform.utils.http-client';
import { plainMockInvoices } from '@acme-modular/billing.billing.invoice';
import { useInvoices } from './use-invoices.js';

function clientFor(invoices: typeof plainMockInvoices) {
  // zero latency keeps the tests fast.
  return createHttpClient({
    baseUrl: 'http://mock.local',
    transport: createMockTransport({ 'GET /invoices': () => invoices }, { latencyMs: 0 }),
  });
}

it('loads invoices as Invoice instances', async () => {
  const client = clientFor(plainMockInvoices);
  const { result } = renderHook(() => useInvoices({ client }));
  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data?.map((invoice) => invoice.id)).toEqual(['inv-1003', 'inv-1002', 'inv-1001']);
  expect(result.current.data?.[0].total.amountCents).toBe(60200);
});

it('sorts newest first whatever order the API returns', async () => {
  const client = clientFor([...plainMockInvoices].reverse());
  const { result } = renderHook(() => useInvoices({ client }));
  await waitFor(() => expect(result.current.data?.map((invoice) => invoice.id)).toEqual(['inv-1003', 'inv-1002', 'inv-1001']));
});

it('surfaces API errors and recovers on reload', async () => {
  let up = false;
  const client = createHttpClient({
    baseUrl: 'http://mock.local',
    transport: createMockTransport(
      {
        'GET /invoices': () => {
          if (!up) throw new Error('billing is down');
          return plainMockInvoices;
        },
      },
      { latencyMs: 0 }
    ),
  });
  const { result } = renderHook(() => useInvoices({ client }));
  await waitFor(() => expect(result.current.error?.message).toBe('billing is down'));
  up = true;
  act(() => result.current.reload());
  await waitFor(() => expect(result.current.data).toHaveLength(3));
});
