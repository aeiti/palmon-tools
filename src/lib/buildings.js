export const MAX_BUILDING_LEVEL = 30;

export const BUILDINGS = [
  { key: 'alchemy_lab', label: 'Alchemy Lab', count: 4 },
  { key: 'armigo_hut', label: 'Armigo Hut', count: 4 },
  { key: 'aurora_altar', label: 'Aurora Altar', count: 1 },
  { key: 'bed', label: 'Bed', count: 7 },
  { key: 'camp', label: 'Camp', count: 1 },
  { key: 'dreamium_siever', label: 'Dreamium Siever', count: 4 },
  { key: 'earth_totem', label: 'Earth Totem', count: 1 },
  { key: 'electric_totem', label: 'Electric Totem', count: 1 },
  { key: 'field_lab', label: 'Field Lab', count: 2 },
  { key: 'fire_totem', label: 'Fire Totem', count: 1 },
  { key: 'furnace', label: 'Furnace', count: 4 },
  { key: 'hatchery', label: 'Hatchery', count: 1 },
  { key: 'holy_tower', label: 'Holy Tower', count: 1, seasonal: true },
  { key: 'hospital', label: 'Hospital', count: 2 },
  { key: 'mithril_workshop', label: 'Mithril Workshop', count: 4, seasonal: true },
  { key: 'ore_stockpile', label: 'Ore Stockpile', count: 1 },
  { key: 'palcatcher_workshop', label: 'Palcatcher Workshop', count: 1 },
  { key: 'power_plant', label: 'Power Plant', count: 4 },
  { key: 'pumpkin_farm', label: 'Pumpkin Farm', count: 1 },
  { key: 'shop', label: 'Shop', count: 1 },
  { key: 'squad', label: 'Squad', count: 4 },
  { key: 'stable', label: 'Stable', count: 1 },
  { key: 'super_mithril_workshop', label: 'Super Mithril Workshop', count: 1, seasonal: true },
  { key: 'table_saw', label: 'Table Saw', count: 4 },
  { key: 'titan_totem', label: 'Titan Totem', count: 4 },
  { key: 'tomato_farm', label: 'Tomato Farm', count: 1 },
  { key: 'water_totem', label: 'Water Totem', count: 1 },
  { key: 'wood_stockpile', label: 'Wood Stockpile', count: 1 },
];

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

export function instanceLabel(building, index) {
  return building.count > 1 ? `${building.label} ${index + 1}` : building.label;
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
