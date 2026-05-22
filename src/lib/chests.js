export const CHEST_TIERS = [
  { key: 'gold', label: 'Gold', accent: 'text-amber-300' },
  { key: 'purple', label: 'Purple', accent: 'text-purple-300' },
  { key: 'blue', label: 'Blue', accent: 'text-sky-300' },
  { key: 'green', label: 'Green', accent: 'text-emerald-300' },
];

export const CHEST_TYPES = [
  { key: 'standard', label: 'Standard' },
  { key: 'leveled', label: 'Leveled' },
];

export function emptyChestTypeCounts() {
  return CHEST_TIERS.reduce((acc, t) => {
    acc[t.key] = 0;
    return acc;
  }, {});
}

export function emptyChests() {
  return CHEST_TYPES.reduce((acc, t) => {
    acc[t.key] = emptyChestTypeCounts();
    return acc;
  }, {});
}

export function normalizeChests(chests) {
  const base = emptyChests();
  if (!chests || typeof chests !== 'object') return base;
  for (const type of CHEST_TYPES) {
    const incoming = chests[type.key];
    if (!incoming || typeof incoming !== 'object') continue;
    for (const tier of CHEST_TIERS) {
      const raw = Number(incoming[tier.key]);
      base[type.key][tier.key] =
        Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
    }
  }
  return base;
}
