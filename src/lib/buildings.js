export const MAX_BUILDING_LEVEL = 30;

export const BUILDING_CATEGORIES = [
  { key: 'camp', label: 'Camp' },
  { key: 'housing', label: 'Housing' },
  { key: 'combat', label: 'Combat' },
  { key: 'medical', label: 'Medical' },
  { key: 'research', label: 'Research' },
  { key: 'production', label: 'Production' },
  { key: 'seasonal', label: 'Seasonal' },
  { key: 'services', label: 'Services' },
  {
    key: 'resources',
    label: 'Resources',
    subcategories: [
      { key: 'farms', label: 'Farms' },
      { key: 'lumber', label: 'Lumber' },
      { key: 'smelting', label: 'Smelting' },
    ],
  },
  { key: 'totems', label: 'Totems' },
];

export const BUILDINGS = [
  { key: 'camp', label: 'Camp', count: 1, category: 'camp' },
  { key: 'bed', label: 'Bed', count: 7, category: 'housing' },
  { key: 'armigo_hut', label: 'Armigo Hut', count: 4, category: 'combat' },
  { key: 'squad', label: 'Squad', count: 4, category: 'combat' },
  { key: 'hospital', label: 'Hospital', count: 2, category: 'medical' },
  { key: 'field_lab', label: 'Field Lab', count: 2, category: 'research' },
  { key: 'alchemy_lab', label: 'Alchemy Lab', count: 4, category: 'production' },
  { key: 'dreamium_siever', label: 'Dreamium Siever', count: 4, category: 'production' },
  { key: 'power_plant', label: 'Power Plant', count: 4, category: 'production' },
  { key: 'aurora_altar', label: 'Aurora Altar', count: 1, category: 'services' },
  { key: 'hatchery', label: 'Hatchery', count: 1, category: 'services' },
  { key: 'palcatcher_workshop', label: 'Palcatcher Workshop', count: 1, category: 'services' },
  { key: 'shop', label: 'Shop', count: 1, category: 'services' },
  { key: 'stable', label: 'Stable', count: 1, category: 'services' },
  { key: 'pumpkin_farm', label: 'Pumpkin Farm', count: 1, category: 'resources', subcategory: 'farms' },
  { key: 'tomato_farm', label: 'Tomato Farm', count: 1, category: 'resources', subcategory: 'farms' },
  { key: 'table_saw', label: 'Table Saw', count: 4, category: 'resources', subcategory: 'lumber' },
  { key: 'wood_stockpile', label: 'Wood Stockpile', count: 1, category: 'resources', subcategory: 'lumber' },
  { key: 'furnace', label: 'Furnace', count: 4, category: 'resources', subcategory: 'smelting' },
  { key: 'ore_stockpile', label: 'Ore Stockpile', count: 1, category: 'resources', subcategory: 'smelting' },
  { key: 'water_totem', label: 'Water Totem', count: 1, category: 'totems', groupKey: 'elemental_totems', groupLabel: 'Elemental Totems' },
  { key: 'fire_totem', label: 'Fire Totem', count: 1, category: 'totems', groupKey: 'elemental_totems', groupLabel: 'Elemental Totems' },
  { key: 'earth_totem', label: 'Earth Totem', count: 1, category: 'totems', groupKey: 'elemental_totems', groupLabel: 'Elemental Totems' },
  { key: 'electric_totem', label: 'Electric Totem', count: 1, category: 'totems', groupKey: 'elemental_totems', groupLabel: 'Elemental Totems' },
  { key: 'titan_totem', label: 'Titan Totem', count: 4, category: 'totems' },
  { key: 'holy_tower', label: 'Holy Tower', count: 1, category: 'seasonal', seasonal: true },
  { key: 'super_mithril_workshop', label: 'Super Mithril Workshop', count: 1, category: 'seasonal', seasonal: true },
  { key: 'mithril_workshop', label: 'Mithril Workshop', count: 4, category: 'seasonal', seasonal: true },
];

function buildingsIn(categoryKey, subcategoryKey) {
  return BUILDINGS.filter(
    (b) =>
      b.category === categoryKey &&
      (subcategoryKey ? b.subcategory === subcategoryKey : !b.subcategory),
  );
}

export const BUILDINGS_BY_CATEGORY = BUILDING_CATEGORIES.map((cat) => {
  if (cat.subcategories) {
    return {
      ...cat,
      subcategories: cat.subcategories.map((sub) => ({
        ...sub,
        buildings: buildingsIn(cat.key, sub.key),
      })),
    };
  }
  return { ...cat, buildings: buildingsIn(cat.key) };
});

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
  return `${building.label} ${index + 1}`;
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

export function groupBuildingsForDisplay(buildings) {
  const cards = [];
  let current = null;
  for (const b of buildings) {
    if (b.groupKey && current?.groupKey === b.groupKey) {
      current.buildings.push(b);
    } else {
      if (current) cards.push(current);
      current = {
        groupKey: b.groupKey || null,
        label: b.groupKey ? b.groupLabel : b.label,
        seasonal: b.seasonal,
        showBuildingLabel: Boolean(b.groupKey),
        showInstanceCount: !b.groupKey,
        buildings: [b],
      };
    }
  }
  if (current) cards.push(current);
  return cards;
}
