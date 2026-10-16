import { useId, useState } from 'react';
import classNames from 'classnames';
import type { HttpClient } from '@acme-modular/platform.utils.http-client';
import type { Invoice } from '@acme-modular/billing.billing.invoice';
import { useInvoices } from '@acme-modular/billing.billing.use-invoices';
import { InvoiceView, InvoiceStatusBadge, formatInvoiceDate } from '@acme-modular/billing.billing.invoice-view';
import { Alert } from '@acme-modular/design.ui.alert';
import { Button } from '@acme-modular/design.ui.button';
import { Modal } from '@acme-modular/design.ui.modal';
import { PriceTag } from '@acme-modular/design.ui.price-tag';
import { Spinner } from '@acme-modular/design.ui.spinner';
import { Stack } from '@acme-modular/design.ui.stack';
import styles from './billing-history-page.module.css';

export type BillingHistoryPageProps = {
  /** the API client. defaults to an in-memory mock of the demo invoices. keep it stable across renders. */
  client?: HttpClient;
  /** the moment statuses are computed for. defaults to now; pass a fixed date in tests and previews. */
  now?: Date;
  className?: string;
};

/**
 * The customer's invoices, newest first, with date, total and status. "View"
 * opens the full invoice in a modal.
 */
export function BillingHistoryPage({ client, now, className }: BillingHistoryPageProps) {
  const headingId = useId();
  const { data: invoices, loading, error, reload } = useInvoices({ client });
  const [selected, setSelected] = useState<Invoice>();

  function content() {
    if (loading && !invoices) return <Spinner label="Loading invoices" />;
    if (error) {
      return (
        <Alert tone="negative" title="We couldn't load your invoices">
          <Stack direction="row" gap="medium" align="center" wrap>
            <span>{error.message}</span>
            <Button variant="secondary" onClick={reload}>
              Try again
            </Button>
          </Stack>
        </Alert>
      );
    }
    if (!invoices?.length) return <p className={styles.empty}>No invoices yet. They appear here once you place an order.</p>;

    return (
      <table className={styles.table} aria-labelledby={headingId}>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Invoice</th>
            <th scope="col" className={styles.number}>Total</th>
            <th scope="col">Status</th>
            <th scope="col">
              <span className={styles.visuallyHidden}>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>
                <time dateTime={invoice.issuedAt}>{formatInvoiceDate(invoice.issuedAt)}</time>
              </td>
              <td>{invoice.id}</td>
              <td className={styles.number}>
                <PriceTag cents={invoice.total.amountCents} currency={invoice.currency} />
              </td>
              <td>
                <InvoiceStatusBadge status={invoice.statusAt(now)} />
              </td>
              <td className={styles.number}>
                <Button variant="ghost" onClick={() => setSelected(invoice)} aria-label={`View invoice ${invoice.id}`}>
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <section className={classNames(styles.billingHistoryPage, className)} aria-labelledby={headingId}>
      <Stack gap="large">
        <h1 id={headingId} className={styles.heading}>
          Billing history
        </h1>
        {content()}
      </Stack>
      <Modal
        open={selected !== undefined}
        onClose={() => setSelected(undefined)}
        title={selected ? `Invoice ${selected.id}` : 'Invoice'}
      >
        {selected && <InvoiceView invoice={selected} now={now} />}
      </Modal>
    </section>
  );
}
