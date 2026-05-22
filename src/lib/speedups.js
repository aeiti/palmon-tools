export const DENOMINATIONS = [
  { key: '1m', label: '1m', minutes: 1 },
  { key: '5m', label: '5m', minutes: 5 },
  { key: '1h', label: '1h', minutes: 60 },
  { key: '3h', label: '3h', minutes: 180 },
  { key: '8h', label: '8h', minutes: 480 },
];

export const CATEGORIES = [
  { key: 'universal', label: 'Universal' },
  { key: 'construction', label: 'Construction' },
  { key: 'research', label: 'Research' },
  { key: 'training', label: 'Training' },
  { key: 'healing', label: 'Healing' },
];

export const NON_UNIVERSAL_CATEGORIES = CATEGORIES.filter(
  (c) => c.key !== 'universal',
);

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
