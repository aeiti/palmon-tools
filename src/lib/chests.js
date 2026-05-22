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

export const CHEST_RESOURCES = [
  { key: 'gold', label: 'Gold', accent: 'text-amber-300' },
  { key: 'lumber', label: 'Lumber', accent: 'text-orange-300' },
  { key: 'steel', label: 'Steel', accent: 'text-slate-300' },
  { key: 'electricity', label: 'Electricity', accent: 'text-cyan-300' },
];

export function emptyResourceCounts() {
  return CHEST_RESOURCES.reduce((acc, r) => {
    acc[r.key] = 0;
    return acc;
  }, {});
}

export function emptyTierCounts() {
  return CHEST_TIERS.reduce((acc, t) => {
    acc[t.key] = emptyResourceCounts();
    return acc;
  }, {});
}

export function emptyChests() {
  return CHEST_TYPES.reduce((acc, t) => {
    acc[t.key] = emptyTierCounts();
    return acc;
  }, {});
}

export function normalizeChests(chests) {
  const base = emptyChests();
  if (!chests || typeof chests !== 'object') return base;
  for (const type of CHEST_TYPES) {
    const tiers = chests[type.key];
    if (!tiers || typeof tiers !== 'object') continue;
    for (const tier of CHEST_TIERS) {
      const resources = tiers[tier.key];
      if (!resources || typeof resources !== 'object') continue;
      for (const resource of CHEST_RESOURCES) {
        const raw = Number(resources[resource.key]);
        base[type.key][tier.key][resource.key] =
          Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
      }
    }
  }
  return base;
}
