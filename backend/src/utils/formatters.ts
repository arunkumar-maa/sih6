// Utility formatting functions for currency, dates, and numbers

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export const formatCrore = formatCurrency;

export function parseNumeric(val: unknown): number | null {
  if (val === null || val === undefined || val === '' || val === 'NA') return null;
  const str = String(val).replace(/[₹,\s]/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}
