// Human-facing number formatting. Raw values (used for data-value) are kept
// separate and untouched — these helpers only affect visible text.

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const compactMoneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat('en-US');

export function formatMoney(value: number): string {
  return moneyFormatter.format(value);
}

export function formatCompactMoney(value: number): string {
  return compactMoneyFormatter.format(value);
}

export function formatSignedCompactMoney(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${compactMoneyFormatter.format(Math.abs(value))}`;
}

export function formatNumber(value: number): string {
  return numberFormatter.format(Math.round(value));
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatSignedPercent(value: number, digits = 1): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${Math.abs(value * 100).toFixed(digits)}%`;
}
