// Turns chest counts into total resource amounts using the per-chest reward
// data in chestValues.js, plus shared formatters for those totals.

import { CHEST_RESOURCES, CHEST_TYPES } from './data/chests.js';
import {
  LEVELED_CHEST_VALUES as LEVELED_VALUES_SOURCE,
  LEVELED_MAX_LEVEL,
  LEVELED_MIN_LEVEL,
  STANDARD_CHEST_VALUES,
} from './data/chestValues.js';

// ---- Leveled lookup ---------------------------------------------------------
//
// LEVELED_VALUES_SOURCE is shape `tier -> resource -> { [level]: amount }`.
// We pivot it once at module load into `level -> tier -> { [resource]: amount }`
// so per-player-level lookups are O(1) and read the same shape as
// STANDARD_CHEST_VALUES (tier -> resource -> amount).

function buildLeveledTable() {
  const table = {};
  for (let L = LEVELED_MIN_LEVEL; L <= LEVELED_MAX_LEVEL; L++) {
    const row = {};
    for (const [tier, resources] of Object.entries(LEVELED_VALUES_SOURCE)) {
      const tierOut = {};
      for (const [resource, byLevel] of Object.entries(resources)) {
        tierOut[resource] = byLevel[L] ?? 0;
      }
      row[tier] = tierOut;
    }
    table[L] = row;
  }
  return table;
}

export const LEVELED_CHEST_VALUES = buildLeveledTable();

function leveledValuesFor(playerLevel) {
  const raw = Number(playerLevel);
  const L =
    Number.isFinite(raw) && raw > 0
      ? Math.min(LEVELED_MAX_LEVEL, Math.max(LEVELED_MIN_LEVEL, Math.floor(raw)))
      : LEVELED_MAX_LEVEL;
  return LEVELED_CHEST_VALUES[L];
}

// ---- Leveled chest value overrides ------------------------------------------
// Per-profile, user-entered per-chest values for the leveled chest tiers.
// Gold/Lumber/Steel share a single "ore" field because the in-game chest pays
// the same amount for any of the three. A zero / missing entry means
// "no override — fall back to the interpolated model value".

export const LEVELED_OVERRIDE_TIERS = ['gold', 'purple', 'blue'];
export const LEVELED_OVERRIDE_FIELDS = ['xp', 'electricity', 'ore'];
const ORE_RESOURCES = new Set(['gold', 'lumber', 'steel']);

function overrideFieldForResource(resourceKey) {
  if (resourceKey === 'xp' || resourceKey === 'electricity') return resourceKey;
  if (ORE_RESOURCES.has(resourceKey)) return 'ore';
  return null;
}

export function emptyLeveledOverrides() {
  return LEVELED_OVERRIDE_TIERS.reduce((acc, tier) => {
    acc[tier] = LEVELED_OVERRIDE_FIELDS.reduce((fAcc, field) => {
      fAcc[field] = 0;
      return fAcc;
    }, {});
    return acc;
  }, {});
}

export function normalizeLeveledOverrides(raw) {
  const base = emptyLeveledOverrides();
  if (!raw || typeof raw !== 'object') return base;
  for (const tier of LEVELED_OVERRIDE_TIERS) {
    const tierRaw = raw[tier];
    if (!tierRaw || typeof tierRaw !== 'object') continue;
    for (const field of LEVELED_OVERRIDE_FIELDS) {
      const n = Number(tierRaw[field]);
      base[tier][field] =
        Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    }
  }
  return base;
}

export function hasAnyLeveledOverrides(overrides) {
  if (!overrides) return false;
  return LEVELED_OVERRIDE_TIERS.some((tier) =>
    LEVELED_OVERRIDE_FIELDS.some(
      (field) => (Number(overrides[tier]?.[field]) || 0) > 0,
    ),
  );
}

// Apply overrides on top of a leveled-values row, returning a new row of the
// same shape that totalResourcesFromChests expects. Zero / missing override
// values fall through to the model.
function applyLeveledOverrides(values, overrides) {
  if (!overrides) return values;
  const out = {};
  for (const tier of Object.keys(values)) {
    const tierValues = values[tier];
    const tierOverrides = overrides[tier];
    const tierOut = {};
    for (const [resourceKey, modelValue] of Object.entries(tierValues)) {
      const field = overrideFieldForResource(resourceKey);
      const overrideValue =
        field != null ? Number(tierOverrides?.[field]) || 0 : 0;
      tierOut[resourceKey] = overrideValue > 0 ? overrideValue : modelValue;
    }
    out[tier] = tierOut;
  }
  return out;
}

// ---- On-hand resources ------------------------------------------------------
// The player's raw resource stockpile, sitting outside of any chest.

export function emptyOnHand() {
  return CHEST_RESOURCES.reduce((acc, r) => {
    acc[r.key] = 0;
    return acc;
  }, {});
}

export function normalizeOnHand(onHand) {
  const base = emptyOnHand();
  if (!onHand || typeof onHand !== 'object') return base;
  for (const r of CHEST_RESOURCES) {
    const raw = Number(onHand[r.key]);
    base[r.key] = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
  }
  return base;
}

export function hasAnyOnHand(onHand) {
  if (!onHand) return false;
  return CHEST_RESOURCES.some((r) => (Number(onHand[r.key]) || 0) > 0);
}

// ---- Totals -----------------------------------------------------------------

function emptyTotals() {
  return CHEST_RESOURCES.reduce((acc, r) => {
    acc[r.key] = 0;
    return acc;
  }, {});
}

export function totalResourcesFromChests(chests, playerLevel, overrides) {
  const totals = emptyTotals();
  if (!chests) return totals;
  for (const type of CHEST_TYPES) {
    let values =
      type.key === 'leveled'
        ? leveledValuesFor(playerLevel)
        : STANDARD_CHEST_VALUES;
    if (!values) continue;
    if (type.key === 'leveled' && hasAnyLeveledOverrides(overrides)) {
      values = applyLeveledOverrides(values, overrides);
    }
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

// Per-chest leveled values for the given player level, with user-entered
// overrides applied on top. Same shape as a row of LEVELED_CHEST_VALUES.
// Useful for UI that displays the actual value being used per (tier, resource).
export function leveledValuesWithOverrides(playerLevel, overrides) {
  const base = leveledValuesFor(playerLevel);
  if (!hasAnyLeveledOverrides(overrides)) return base;
  return applyLeveledOverrides(base, overrides);
}

// On-hand stockpile + everything you'd get from opening every chest, in one
// total per resource. Pass null/undefined for either side to omit it.
export function combinedResourceTotals(chests, playerLevel, onHand, overrides) {
  const chestTotals = totalResourcesFromChests(chests, playerLevel, overrides);
  const handTotals = normalizeOnHand(onHand);
  const combined = emptyTotals();
  for (const r of CHEST_RESOURCES) {
    combined[r.key] = chestTotals[r.key] + handTotals[r.key];
  }
  return combined;
}

// ---- Formatting -------------------------------------------------------------
// Re-export the shared compact formatters under their resource-specific
// historical names. New callers should import from src/lib/format.js
// directly; these stay so the resource-totals consumers don't need to be
// re-pointed and existing tests keep passing.
export { formatCompact as formatResourceAmount } from './format.js';
export { formatCompactFull as formatResourceAmountFull } from './format.js';
