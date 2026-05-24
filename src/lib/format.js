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

// Parse a compact-format string back into a number. Accepts:
//   "1500000"     → 1500000
//   "1,500,000"   → 1500000  (commas / underscores / whitespace stripped)
//   "1.5M"        → 1500000  (case-insensitive K / M / B)
//   "0.1k"        → 100
//   ""            → 0
//
// Returns null if the input doesn't match the expected shape, so callers can
// distinguish "user typed garbage" from "user cleared the field".
export function parseCompact(input) {
  if (input === null || input === undefined) return null;
  const cleaned = String(input).trim().replace(/[,_\s]/g, '');
  if (cleaned === '') return 0;
  const match = /^(-?\d+(?:\.\d+)?)([kmb])?$/i.exec(cleaned);
  if (!match) return null;
  const base = Number(match[1]);
  if (!Number.isFinite(base)) return null;
  const suffix = match[2]?.toLowerCase();
  const multiplier =
    suffix === 'b'
      ? 1_000_000_000
      : suffix === 'm'
      ? 1_000_000
      : suffix === 'k'
      ? 1_000
      : 1;
  return Math.trunc(base * multiplier);
}
