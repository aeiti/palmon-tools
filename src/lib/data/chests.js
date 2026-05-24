// Chest catalog data. Pure facts about chest tiers, types, and resources —
// edit this file when in-game catalog changes. State helpers (empty/normalize/
// totals) live in src/lib/chests.js.

export const CHEST_TIERS = [
  { key: 'gold', label: 'UR', accent: 'text-amber-300' },
  { key: 'purple', label: 'SSR', accent: 'text-purple-300' },
  { key: 'blue', label: 'SR', accent: 'text-sky-300' },
  { key: 'green', label: 'R', accent: 'text-emerald-300' },
];

export const TIER_ORDER = CHEST_TIERS.map((t) => t.key);

export const CHEST_TYPES = [
  { key: 'leveled', label: 'Leveled', tiers: ['gold', 'purple', 'blue'] },
  { key: 'standard', label: 'Standard', tiers: ['gold', 'purple', 'blue', 'green'] },
];

export const CHEST_RESOURCES = [
  { key: 'xp', label: 'XP', accent: 'text-fuchsia-300' },
  { key: 'electricity', label: 'Electricity', accent: 'text-cyan-300' },
  { key: 'gold', label: 'Gold', accent: 'text-amber-300' },
  { key: 'lumber', label: 'Lumber', accent: 'text-orange-300' },
  { key: 'steel', label: 'Steel', accent: 'text-slate-300' },
];

export const CHEST_TIER_BY_KEY = Object.fromEntries(
  CHEST_TIERS.map((t) => [t.key, t]),
);

// Catalog lookups (read-only queries over the data above). State operations
// live in src/lib/chests.js.

export function tiersForType(typeKey) {
  const type = CHEST_TYPES.find((t) => t.key === typeKey);
  if (!type) return [];
  return type.tiers.map((k) => CHEST_TIER_BY_KEY[k]).filter(Boolean);
}

export function typesWithTier(tierKey) {
  return CHEST_TYPES.filter((t) => t.tiers.includes(tierKey));
}
