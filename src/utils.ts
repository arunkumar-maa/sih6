// Shared utility functions

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Not Available';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)} K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatCurrencyFull(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Not Available';
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(date: Date | null | undefined): string {
  if (!date) return 'Not Available';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateStr(dateStr: string | null | undefined): string {
  if (!dateStr || dateStr === 'NA' || dateStr === '') return 'Not Available';
  return dateStr;
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

export function clsx(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function truncate(str: string, maxLen: number): string {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

export function getRiskColor(level: string): string {
  switch (level) {
    case 'HIGH': return '#ef4444';
    case 'MEDIUM': return '#f59e0b';
    case 'LOW': return '#10b981';
    default: return '#64748b';
  }
}

export function getRiskBg(level: string): string {
  switch (level) {
    case 'HIGH': return 'rgba(239,68,68,0.15)';
    case 'MEDIUM': return 'rgba(245,158,11,0.15)';
    case 'LOW': return 'rgba(16,185,129,0.15)';
    default: return 'rgba(100,116,139,0.15)';
  }
}
