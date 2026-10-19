// Small, dependency-free scale and tick helpers for the hand-drawn SVG
// charts. Pure functions only.

// Linear map from [d0, d1] to [r0, r1]. A zero-width domain maps everything
// to the middle of the range rather than dividing by zero.
export function linearScale([d0, d1], [r0, r1]) {
  const span = d1 - d0;
  if (span === 0) return () => (r0 + r1) / 2;
  return (v) => r0 + ((v - d0) / span) * (r1 - r0);
}

// "Nice" ticks covering [min, max]: steps of 1, 2 or 5 × 10^n, about
// `count` of them. Returns { ticks, min, max } where min/max are expanded
// to the outer ticks so the axis ends on a labelled value.
export function niceTicks(min, max, count = 4) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { ticks: [0], min: 0, max: 0 };
  }
  if (min === max) {
    if (min === 0) return { ticks: [0, 1], min: 0, max: 1 };
    const pad = Math.abs(min) * 0.1;
    return niceTicks(min - pad, max + pad, count);
  }
  const raw = (max - min) / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 2; v += step) {
    ticks.push(Math.round(v / step) * step);
  }
  return { ticks, min: lo, max: hi };
}

const DAY_MS = 24 * 3600 * 1000;
const DAY_STEPS = [1, 2, 7, 14, 30, 61, 91, 182, 365];

// Ticks at local midnight, spaced a whole number of days apart (1, 2, 7,
// 14, ~1, 2, 3, 6 months, 1 year) so there are at most about `count`.
export function timeTicks(startMs, endMs, count = 5) {
  if (!(endMs > startMs)) return [];
  const days = (endMs - startMs) / DAY_MS;
  const step = DAY_STEPS.find((s) => days / s <= count) ?? 365;
  const first = new Date(startMs);
  first.setHours(0, 0, 0, 0);
  if (first.getTime() < startMs) first.setDate(first.getDate() + 1);
  const ticks = [];
  for (
    const d = new Date(first);
    d.getTime() <= endMs;
    d.setDate(d.getDate() + step)
  ) {
    ticks.push(d.getTime());
  }
  return ticks;
}
