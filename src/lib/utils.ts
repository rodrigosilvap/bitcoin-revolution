import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'USD', compact = false): string {
  const opts: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  if (compact && value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B ${currency}`;
  }
  if (compact && value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M ${currency}`;
  }
  return new Intl.NumberFormat('en-US', opts).format(value);
}

export function formatBtc(value: number, decimals = 8): string {
  return value.toFixed(decimals);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
