// Per-chest reward amounts. Used by the Resources page summary to convert
// chest counts into total resource amounts.

import { CHEST_RESOURCES, CHEST_TYPES } from './chests.js';

// ---- Standard chests (do not scale with player level) -----------------------
// A single standard chest gives the tier amount of whichever resource it is
// (e.g. a standard UR Gold chest = 3M Gold; a standard UR XP chest = 3M XP).
const STANDARD_TIER_AMOUNT = {
  gold:   3_000_000, // UR
  purple: 1_000_000, // SSR
  blue:     100_000, // SR
  green:     10_000, // R
};

function flatTier(amount) {
  return { xp: amount, electricity: amount, gold: amount, lumber: amount, steel: amount };
}

export const STANDARD_CHEST_VALUES = {
  gold:   flatTier(STANDARD_TIER_AMOUNT.gold),
  purple: flatTier(STANDARD_TIER_AMOUNT.purple),
  blue:   flatTier(STANDARD_TIER_AMOUNT.blue),
  green:  flatTier(STANDARD_TIER_AMOUNT.green),
};

// ---- Leveled chests ---------------------------------------------------------
// Anchor: per-resource value of a single leveled chest at player level 30,
// broken out per tier.
const LEVELED_ANCHOR_LEVEL = 30;
const LEVELED_BASE_BY_TIER = {
  gold: { // UR
    xp: 5_400_000,
    electricity: 3_000_000,
    gold: 4_200_000,
    lumber: 4_200_000,
    steel: 4_200_000,
  },
  purple: { // SSR
    xp: 1_800_000,
    electricity: 340_000,
    gold: 1_400_000,
    lumber: 1_400_000,
    steel: 1_400_000,
  },
  blue: { // SR
    xp: 225_000,
    electricity: 43_700,
    gold: 175_000,
    lumber: 175_000,
    steel: 175_000,
  },
};

// Levels 1–29 linearly taper from 50% (level 1) to 100% (level 30).
// Levels above 30 fall back to the level-30 baseline until real values land.
const LEVELED_MIN_LEVEL = 1;
const LEVELED_MAX_DEFINED_LEVEL = 30;

function scaleFor(level) {
  if (level >= LEVELED_ANCHOR_LEVEL) return 1;
  if (level <= LEVELED_MIN_LEVEL) return 0.5;
  return 0.5 + ((level - 1) / (LEVELED_ANCHOR_LEVEL - 1)) * 0.5;
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
  for (let L = LEVELED_MIN_LEVEL; L <= LEVELED_MAX_DEFINED_LEVEL; L++) {
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
  const L = Number.isFinite(raw) && raw > 0
    ? Math.min(LEVELED_MAX_DEFINED_LEVEL, Math.max(LEVELED_MIN_LEVEL, Math.floor(raw)))
    : LEVELED_MAX_DEFINED_LEVEL;
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
      type.key === 'leveled' ? leveledValuesFor(playerLevel) : STANDARD_CHEST_VALUES;
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
