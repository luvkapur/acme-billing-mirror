export type LineItem = { unitPrice: number; quantity: number };

/** Sum of unitPrice*quantity over all line items, rounded to cents (phase A check). */
export function invoiceTotal(items: LineItem[]): number {
  const raw = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  return Math.round(raw * 100) / 100;
}
