// Turns chest counts into total resource amounts using the per-chest reward
// data in chestValues.js, plus shared formatters for those totals.

import { CHEST_RESOURCES, CHEST_TYPES } from './data/chests.js';
import {
  LEVELED_ANCHOR_LEVEL,
  LEVELED_BASE_BY_TIER,
  LEVELED_MIN_LEVEL,
  LEVELED_MIN_LEVEL_SCALE,
  STANDARD_CHEST_VALUES,
} from './data/chestValues.js';

// ---- Leveled scaling --------------------------------------------------------

function scaleFor(level) {
  if (level >= LEVELED_ANCHOR_LEVEL) return 1;
  if (level <= LEVELED_MIN_LEVEL) return LEVELED_MIN_LEVEL_SCALE;
  const span = LEVELED_ANCHOR_LEVEL - LEVELED_MIN_LEVEL;
  return (
    LEVELED_MIN_LEVEL_SCALE +
    ((level - LEVELED_MIN_LEVEL) / span) * (1 - LEVELED_MIN_LEVEL_SCALE)
  );
}

function scaleTier(base, factor) {
  const out = {};
  for (const [k, v] of Object.entries(base)) {
    out[k] = Math.round(v * factor);
  }
  return out;
}

function buildLeveledTable() {
  const table = {};
  for (let L = LEVELED_MIN_LEVEL; L <= LEVELED_ANCHOR_LEVEL; L++) {
    const factor = scaleFor(L);
    table[L] = {
      gold: scaleTier(LEVELED_BASE_BY_TIER.gold, factor),
      purple: scaleTier(LEVELED_BASE_BY_TIER.purple, factor),
      blue: scaleTier(LEVELED_BASE_BY_TIER.blue, factor),
    };
  }
  return table;
}

export const LEVELED_CHEST_VALUES = buildLeveledTable();

function leveledValuesFor(playerLevel) {
  const raw = Number(playerLevel);
  const L =
    Number.isFinite(raw) && raw > 0
      ? Math.min(LEVELED_ANCHOR_LEVEL, Math.max(LEVELED_MIN_LEVEL, Math.floor(raw)))
      : LEVELED_ANCHOR_LEVEL;
  return LEVELED_CHEST_VALUES[L];
}

// ---- Totals -----------------------------------------------------------------

function emptyTotals() {
  return CHEST_RESOURCES.reduce((acc, r) => {
    acc[r.key] = 0;
    return acc;
  }, {});
}

export function totalResourcesFromChests(chests, playerLevel) {
  const totals = emptyTotals();
  if (!chests) return totals;
  for (const type of CHEST_TYPES) {
    const values =
      type.key === 'leveled'
        ? leveledValuesFor(playerLevel)
        : STANDARD_CHEST_VALUES;
    if (!values) continue;
    for (const tierKey of type.tiers) {
      const counts = chests[type.key]?.[tierKey];
      const tierValues = values[tierKey];
      if (!counts || !tierValues) continue;
      for (const r of CHEST_RESOURCES) {
        totals[r.key] += (counts[r.key] || 0) * (tierValues[r.key] || 0);
      }
    }
  }
  return totals;
}

// ---- Formatting -------------------------------------------------------------

const NUMBER_FORMATTER = new Intl.NumberFormat('en-US');

export function formatResourceAmount(n) {
  if (!Number.isFinite(n) || n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${trim(n / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `${trim(n / 1_000_000)}M`;
  if (abs >= 10_000) return `${trim(n / 1_000)}K`;
  return NUMBER_FORMATTER.format(n);
}

export function formatResourceAmountFull(n) {
  return NUMBER_FORMATTER.format(n || 0);
}

function trim(n) {
  // 1 decimal, but drop trailing .0
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
