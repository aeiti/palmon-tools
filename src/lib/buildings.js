// Building state helpers — empty/normalize and derived queries over a
// profile's buildings state. Catalog data lives in src/lib/data/buildings.js.

import { BUILDINGS, MAX_BUILDING_LEVEL } from './data/buildings.js';

function emptyInstance() {
  return { level: 0, palmon: '' };
}

export function emptyBuildings() {
  return BUILDINGS.reduce((acc, b) => {
    acc[b.key] = Array.from({ length: b.count }, emptyInstance);
    return acc;
  }, {});
}

function clampLevel(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(MAX_BUILDING_LEVEL, Math.floor(n));
}

export function normalizeBuildings(buildings) {
  const base = emptyBuildings();
  if (!buildings || typeof buildings !== 'object') return base;
  for (const b of BUILDINGS) {
    const arr = buildings[b.key];
    if (!Array.isArray(arr)) continue;
    for (let i = 0; i < b.count; i++) {
      const entry = arr[i];
      if (!entry || typeof entry !== 'object') continue;
      base[b.key][i] = {
        level: clampLevel(entry.level),
        palmon: typeof entry.palmon === 'string' ? entry.palmon.trim() : '',
      };
    }
  }
  return base;
}

export function hasAnyBuildings(buildings) {
  return BUILDINGS.some((b) =>
    (buildings?.[b.key] || []).some(
      (inst) => (inst?.level || 0) > 0 || (inst?.palmon || '').length > 0,
    ),
  );
}

export function buildingsSummary(buildings) {
  let total = 0;
  let filled = 0;
  let levelSum = 0;
  for (const b of BUILDINGS) {
    const instances = buildings?.[b.key] || [];
    for (const inst of instances) {
      total += 1;
      const lvl = inst?.level || 0;
      if (lvl > 0) {
        filled += 1;
        levelSum += lvl;
      }
    }
  }
  return { total, filled, levelSum };
}

export function duplicatePalmonKeys(buildings) {
  const counts = new Map();
  for (const b of BUILDINGS) {
    const instances = buildings?.[b.key] || [];
    for (const inst of instances) {
      const name = (inst?.palmon || '').trim().toLowerCase();
      if (!name) continue;
      counts.set(name, (counts.get(name) || 0) + 1);
    }
  }
  const dupes = new Set();
  for (const [key, count] of counts) {
    if (count > 1) dupes.add(key);
  }
  return dupes;
}

export function findPalmonBuildingAssignment(palmonId, buildings) {
  if (!palmonId || !buildings) return null;
  for (const b of BUILDINGS) {
    const instances = buildings[b.key] || [];
    for (let i = 0; i < instances.length; i++) {
      if (instances[i]?.palmon === palmonId) {
        return {
          buildingKey: b.key,
          index: i,
          label: b.count > 1 ? `${b.label} ${i + 1}` : b.label,
        };
      }
    }
  }
  return null;
}
