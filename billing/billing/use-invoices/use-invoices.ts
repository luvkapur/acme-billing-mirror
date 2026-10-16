import { useFetch } from '@acme-modular/platform.hooks.use-fetch';
import type { FetchState } from '@acme-modular/platform.hooks.use-fetch';
import { createHttpClient, createMockTransport } from '@acme-modular/platform.utils.http-client';
import type { HttpClient } from '@acme-modular/platform.utils.http-client';
import { Invoice, plainMockInvoices } from '@acme-modular/billing.billing.invoice';
import type { PlainInvoice } from '@acme-modular/billing.billing.invoice';

// previews and the demo app run without a backend. the base URL only gives
// `Request` an absolute URL; the mock transport never leaves the process.
const mockClient = createHttpClient({
  baseUrl: 'http://mock.local',
  transport: createMockTransport({ 'GET /invoices': () => plainMockInvoices }, { latencyMs: 300 }),
});

export type UseInvoicesOptions = {
  /** the API client. defaults to an in-memory mock of the demo invoices. keep it stable across renders. */
  client?: HttpClient;
};

/**
 * Loads the customer's invoices as `Invoice` instances, newest first.
 *
 * @example
 * const { data: invoices, loading, error } = useInvoices();
 */
export function useInvoices({ client = mockClient }: UseInvoicesOptions = {}): FetchState<Invoice[]> {
  return useFetch(async () => {
    const plain = await client.get<PlainInvoice[]>('/invoices');
    // a billing history reads newest first, whatever order the API returns.
    return plain.map((invoice) => Invoice.from(invoice)).sort((a, b) => Date.parse(b.issuedAt) - Date.parse(a.issuedAt));
  }, [client]);
}
