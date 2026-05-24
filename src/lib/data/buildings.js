// Building catalog data. Pure facts about the buildings in the game —
// edit this file when in-game catalog or level cap changes. State helpers
// (empty/normalize/summary) live in src/lib/buildings.js.

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

// Pure catalog formatters / layout helpers (no state dependency).

export function instanceLabel(building, index) {
  return `${building.label} ${index + 1}`;
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
