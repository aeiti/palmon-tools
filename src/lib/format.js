// Shared number formatters used across the site.
//
// formatCompact:  cookie-clicker-style K / M / B short form. Under 1,000
//                 renders as a plain integer; otherwise picks the largest
//                 fitting suffix and shows 1 decimal when the scaled value
//                 is < 100 (so we get "1.5K" but "100K"), and integer-only
//                 when ≥ 100. Truncates rather than rounds so values never
//                 read as the next bigger bucket (e.g. 999,999 → "999K"
//                 rather than "1000K").
//
// formatCompactFull:  comma-grouped full digits — used for hover tooltips
//                     so the exact value is always available.

const NUMBER_FORMATTER = new Intl.NumberFormat('en-US');

export function formatCompact(n) {
  if (!Number.isFinite(n)) return '0';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return formatScaled(n / 1_000_000_000, 'B');
  if (abs >= 1_000_000) return formatScaled(n / 1_000_000, 'M');
  if (abs >= 1_000) return formatScaled(n / 1_000, 'K');
  // Under 1,000: plain integer (truncate fractional input)
  return String(Math.trunc(n));
}

function formatScaled(scaled, suffix) {
  if (Math.abs(scaled) >= 100) {
    return `${Math.trunc(scaled)}${suffix}`;
  }
  // floor, not round, to avoid "999.95K" rendering as "1000K"
  const truncated = Math.floor(Math.abs(scaled) * 10) / 10;
  const value = scaled < 0 ? -truncated : truncated;
  return Number.isInteger(value)
    ? `${value}${suffix}`
    : `${value.toFixed(1)}${suffix}`;
}

export function formatCompactFull(n) {
  return NUMBER_FORMATTER.format(n || 0);
}
