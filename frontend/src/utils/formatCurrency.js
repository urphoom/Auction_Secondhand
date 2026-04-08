export function formatCurrency(value, options = {}) {
  const {
    currency = 'THB',
    locale = 'th-TH',
    millionThreshold = 1_000_000,
    millionDecimals = 2
  } = options;

  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return '฿0.00';

  const abs = Math.abs(n);
  if (abs >= millionThreshold) {
    const m = n / 1_000_000;
    const fixed = m.toFixed(millionDecimals);
    return `${fixed}M`;
  }

  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n);
}

