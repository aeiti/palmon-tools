// Chest state helpers — empty/normalize and total computations. Pure catalog
// data lives in src/lib/data/chests.js.

import {
  CHEST_RESOURCES,
  CHEST_TYPES,
  typesWithTier,
} from './data/chests.js';

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
