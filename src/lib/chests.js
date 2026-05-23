export const CHEST_TIERS = [
  { key: 'gold', label: 'Gold', accent: 'text-amber-300' },
  { key: 'purple', label: 'Purple', accent: 'text-purple-300' },
  { key: 'blue', label: 'Blue', accent: 'text-sky-300' },
  { key: 'green', label: 'Green', accent: 'text-emerald-300' },
];

const TIER_ORDER = CHEST_TIERS.map((t) => t.key);

export const CHEST_TYPES = [
  { key: 'standard', label: 'Standard', tiers: ['gold', 'purple', 'blue', 'green'] },
  { key: 'leveled', label: 'Leveled', tiers: ['gold', 'purple', 'blue'] },
];

export const CHEST_RESOURCES = [
  { key: 'xp', label: 'XP', accent: 'text-fuchsia-300' },
  { key: 'electricity', label: 'Electricity', accent: 'text-cyan-300' },
  { key: 'gold', label: 'Gold', accent: 'text-amber-300' },
  { key: 'lumber', label: 'Lumber', accent: 'text-orange-300' },
  { key: 'steel', label: 'Steel', accent: 'text-slate-300' },
];

const CHEST_TIER_BY_KEY = Object.fromEntries(
  CHEST_TIERS.map((t) => [t.key, t]),
);

export function tiersForType(typeKey) {
  const type = CHEST_TYPES.find((t) => t.key === typeKey);
  if (!type) return [];
  return type.tiers
    .map((k) => CHEST_TIER_BY_KEY[k])
    .filter(Boolean);
}

export function typesWithTier(tierKey) {
  return CHEST_TYPES.filter((t) => t.tiers.includes(tierKey));
}

export function emptyResourceCounts() {
  return CHEST_RESOURCES.reduce((acc, r) => {
    acc[r.key] = 0;
    return acc;
  }, {});
}

export function emptyChests() {
  return CHEST_TYPES.reduce((acc, type) => {
    acc[type.key] = type.tiers.reduce((tierAcc, tierKey) => {
      tierAcc[tierKey] = emptyResourceCounts();
      return tierAcc;
    }, {});
    return acc;
  }, {});
}

export function tierTypeTotal(chests, typeKey, tierKey) {
  return CHEST_RESOURCES.reduce(
    (sum, r) => sum + (chests?.[typeKey]?.[tierKey]?.[r.key] || 0),
    0,
  );
}

export function resourceTierTotal(chests, tierKey, resourceKey) {
  return typesWithTier(tierKey).reduce(
    (sum, t) => sum + (chests?.[t.key]?.[tierKey]?.[resourceKey] || 0),
    0,
  );
}

export function hasAnyChests(chests) {
  return CHEST_TYPES.some((type) =>
    type.tiers.some((tierKey) => tierTypeTotal(chests, type.key, tierKey) > 0),
  );
}

export function normalizeChests(chests) {
  const base = emptyChests();
  if (!chests || typeof chests !== 'object') return base;
  for (const type of CHEST_TYPES) {
    const tiers = chests[type.key];
    if (!tiers || typeof tiers !== 'object') continue;
    for (const tierKey of type.tiers) {
      const resources = tiers[tierKey];
      if (!resources || typeof resources !== 'object') continue;
      for (const resource of CHEST_RESOURCES) {
        const raw = Number(resources[resource.key]);
        base[type.key][tierKey][resource.key] =
          Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
      }
    }
  }
  return base;
}

export { TIER_ORDER };
