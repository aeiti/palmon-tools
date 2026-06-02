// Sandstorm-event speedup state helpers — empty inventory, normalize,
// and per-type totals. Catalog data lives in
// src/lib/data/sandstormSpeedups.js.
//
// State shape: { [key]: count } — one non-negative integer per catalog
// entry. The two entry types (march-percent and healing-time) total
// differently: healing entries sum to minutes, march entries sum to a
// plain item count (no time component).

import { SANDSTORM_SPEEDUPS } from './data/sandstormSpeedups.js';

const SANDSTORM_KEYS = new Set(SANDSTORM_SPEEDUPS.map((s) => s.key));

export function emptySandstormSpeedups() {
  return SANDSTORM_SPEEDUPS.reduce((acc, s) => {
    acc[s.key] = 0;
    return acc;
  }, {});
}

export function normalizeSandstormSpeedups(raw) {
  const base = emptySandstormSpeedups();
  if (!raw || typeof raw !== 'object') return base;
  for (const key of Object.keys(raw)) {
    if (!SANDSTORM_KEYS.has(key)) continue;
    const n = Number(raw[key]);
    base[key] = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }
  return base;
}

export function totalHealingMinutes(state) {
  if (!state) return 0;
  return SANDSTORM_SPEEDUPS.reduce((sum, s) => {
    if (s.type !== 'healing-time') return sum;
    return sum + (Number(state[s.key]) || 0) * s.minutes;
  }, 0);
}

export function totalMarchCount(state) {
  if (!state) return 0;
  return SANDSTORM_SPEEDUPS.reduce((sum, s) => {
    if (s.type !== 'march-percent') return sum;
    return sum + (Number(state[s.key]) || 0);
  }, 0);
}

export function hasAnySandstormSpeedups(state) {
  if (!state) return false;
  return SANDSTORM_SPEEDUPS.some((s) => (Number(state[s.key]) || 0) > 0);
}
