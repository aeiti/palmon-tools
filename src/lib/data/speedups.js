// Speedup catalog data. Pure facts about denominations and category rules —
// edit this file when in-game catalog changes. State helpers (empty,
// totals, has-any) live in src/lib/speedups.js.

export const DENOMINATIONS = [
  { key: '8h', label: '8h', minutes: 480 },
  { key: '3h', label: '3h', minutes: 180 },
  { key: '1h', label: '1h', minutes: 60 },
  { key: '5m', label: '5m', minutes: 5 },
  { key: '1m', label: '1m', minutes: 1 },
];

export const CATEGORIES = [
  { key: 'universal', label: 'Universal' },
  { key: 'construction', label: 'Construction' },
  { key: 'research', label: 'Research' },
  { key: 'training', label: 'Training' },
  { key: 'healing', label: 'Healing' },
  { key: 'breeding', label: 'Breeding', denominations: ['1h'] },
];

export const NON_UNIVERSAL_CATEGORIES = CATEGORIES.filter(
  (c) => c.key !== 'universal',
);

// Catalog lookups (read-only queries over the data above).

export function denominationsForCategory(categoryKey) {
  const c = CATEGORIES.find((x) => x.key === categoryKey);
  if (!c || !c.denominations) return DENOMINATIONS;
  const allowed = new Set(c.denominations);
  return DENOMINATIONS.filter((d) => allowed.has(d.key));
}

export function categorySupportsDenomination(categoryKey, denomKey) {
  const c = CATEGORIES.find((x) => x.key === categoryKey);
  if (!c || !c.denominations) return true;
  return c.denominations.includes(denomKey);
}
