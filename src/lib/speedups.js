// Speedup state helpers — empty inventories and minute totals.
// Catalog data lives in src/lib/data/speedups.js.

import { CATEGORIES, DENOMINATIONS } from './data/speedups.js';

export function emptyCategoryCounts() {
  return DENOMINATIONS.reduce((acc, d) => {
    acc[d.key] = 0;
    return acc;
  }, {});
}

export function emptyInventory() {
  return CATEGORIES.reduce((acc, c) => {
    acc[c.key] = emptyCategoryCounts();
    return acc;
  }, {});
}

export function categoryTotalMinutes(counts) {
  if (!counts) return 0;
  return DENOMINATIONS.reduce(
    (sum, d) => sum + (Number(counts[d.key]) || 0) * d.minutes,
    0,
  );
}

export function categoryTotalWithUniversal(inventory, categoryKey) {
  const base = categoryTotalMinutes(inventory[categoryKey]);
  if (categoryKey === 'universal') return base;
  return base + categoryTotalMinutes(inventory.universal);
}

export function hasAnySpeedups(inventory) {
  if (!inventory) return false;
  return CATEGORIES.some((c) => categoryTotalMinutes(inventory[c.key]) > 0);
}
