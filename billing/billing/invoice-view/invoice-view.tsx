import classNames from 'classnames';
import { Badge } from '@acme-modular/design.ui.badge';
import { PriceTag } from '@acme-modular/design.ui.price-tag';
import type { Invoice, InvoiceStatus } from '@acme-modular/billing.billing.invoice';
import styles from './invoice-view.module.css';

const statusLabels: Record<InvoiceStatus, string> = { paid: 'Paid', open: 'Open', overdue: 'Overdue' };
const statusTones: Record<InvoiceStatus, 'positive' | 'info' | 'negative'> = { paid: 'positive', open: 'info', overdue: 'negative' };

// timestamps are stored in UTC; formatting in UTC keeps server, browser and tests on the same calendar day.
const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

/** a UTC calendar date such as `Oct 12, 2026`, for invoice dates. */
export function formatInvoiceDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

export type InvoiceStatusBadgeProps = {
  status: InvoiceStatus;
};

/** the invoice status as a Badge: green when paid, blue when open, red when overdue. */
export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  return <Badge tone={statusTones[status]}>{statusLabels[status]}</Badge>;
}

export type InvoiceViewProps = {
  invoice: Invoice;
  /** the moment the status is computed for. defaults to now; pass a fixed date in tests and previews. */
  now?: Date;
  className?: string;
};

/**
 * An invoice as a table of lines with its total, dates and a status badge.
 */
export function InvoiceView({ invoice, now, className }: InvoiceViewProps) {
  const status = invoice.statusAt(now);
  const { currency } = invoice;

  return (
    <article className={classNames(styles.invoiceView, className)} aria-label={`Invoice ${invoice.id}`}>
      <header className={styles.header}>
        <div>
          <div className={styles.id}>Invoice {invoice.id}</div>
          <dl className={styles.dates}>
            <dt>Issued</dt>
            <dd>{formatInvoiceDate(invoice.issuedAt)}</dd>
            {invoice.paidAt && status === 'paid' ? (
              <>
                <dt>Paid</dt>
                <dd>{formatInvoiceDate(invoice.paidAt)}</dd>
              </>
            ) : (
              <>
                <dt>Due</dt>
                <dd>{formatInvoiceDate(invoice.dueAt)}</dd>
              </>
            )}
          </dl>
        </div>
        <InvoiceStatusBadge status={status} />
      </header>

      <table className={styles.table}>
        <caption className={styles.caption}>Order {invoice.orderId}</caption>
        <thead>
          <tr>
            <th scope="col">Description</th>
            <th scope="col" className={styles.number}>Qty</th>
            <th scope="col" className={styles.number}>Unit price</th>
            <th scope="col" className={styles.number}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line, index) => (
            <tr key={`${index}-${line.description}`}>
              <td>{line.description}</td>
              <td className={styles.number}>{line.quantity}</td>
              <td className={styles.number}>
                <PriceTag cents={line.unitPriceCents} currency={currency} size="small" />
              </td>
              <td className={styles.number}>
                <PriceTag cents={line.unitPriceCents * line.quantity} currency={currency} size="small" />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={styles.total}>
            <th scope="row" colSpan={3}>
              Total
            </th>
            <td className={styles.number}>
              <PriceTag cents={invoice.total.amountCents} currency={currency} />
            </td>
          </tr>
        </tfoot>
      </table>
    </article>
  );
}
