export const OTHER_GROUPS = [
  { key: 'skill-evolution', label: 'Skill & Evolution' },
  { key: 'premium', label: 'Premium' },
  { key: 'palmon', label: 'Palmon Acquisition' },
  { key: 'mount', label: 'Mount' },
  { key: 'utility', label: 'Reset / Utility' },
];

export const OTHER_ITEMS = [
  { key: 'aurora-essence', label: 'Aurora Essence', group: 'skill-evolution' },
  {
    key: 'element-energy-earth',
    label: 'Element Energy (Earth)',
    group: 'skill-evolution',
  },
  {
    key: 'element-energy-electric',
    label: 'Element Energy (Electric)',
    group: 'skill-evolution',
  },
  {
    key: 'element-energy-fire',
    label: 'Element Energy (Fire)',
    group: 'skill-evolution',
  },
  {
    key: 'element-energy-water',
    label: 'Element Energy (Water)',
    group: 'skill-evolution',
  },
  {
    key: 'evolution-essence',
    label: 'Evolution Essence',
    group: 'skill-evolution',
  },
  { key: 'evolution-stone', label: 'Evolution Stone', group: 'skill-evolution' },
  { key: 'skillfruit-chest', label: 'Skillfruit Chest', group: 'skill-evolution' },
  {
    key: 'skillfruit-epic',
    label: 'Skillfruit (Epic)',
    group: 'skill-evolution',
  },
  {
    key: 'skillfruit-legendary',
    label: 'Skillfruit (Legendary)',
    group: 'skill-evolution',
  },

  { key: 'dreamium-3', label: 'Dreamium III', group: 'premium' },
  { key: 'dreamium-4', label: 'Dreamium IV', group: 'premium' },
  { key: 'dreamium-5', label: 'Dreamium V', group: 'premium' },
  { key: 'opus-pearl', label: 'Opus Pearl', group: 'premium' },
  {
    key: 'ur-palmon-omni-token',
    label: 'UR Palmon Omni Token',
    group: 'premium',
  },
  { key: 'ur-palmon-token', label: 'UR Palmon Token', group: 'premium' },

  { key: 'palmon-catcher', label: 'Palmon Catcher', group: 'palmon' },
  { key: 'palmon-egg', label: 'Palmon Egg', group: 'palmon' },

  { key: 'mount-feed', label: 'Mount Feed', group: 'mount' },
  { key: 'mount-shoes', label: 'Mount Shoes', group: 'mount' },

  { key: 'action-points', label: 'Action Points', group: 'utility' },
  { key: 'reset-voucher', label: 'Reset Voucher', group: 'utility' },
];

const OTHER_ITEM_KEYS = new Set(OTHER_ITEMS.map((i) => i.key));

export function emptyOther() {
  return OTHER_ITEMS.reduce((acc, item) => {
    acc[item.key] = 0;
    return acc;
  }, {});
}

export function normalizeOther(other) {
  const base = emptyOther();
  if (!other || typeof other !== 'object') return base;
  for (const key of Object.keys(other)) {
    if (!OTHER_ITEM_KEYS.has(key)) continue;
    const raw = Number(other[key]);
    base[key] = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
  }
  return base;
}

export function itemsByGroup(groupKey) {
  return OTHER_ITEMS.filter((i) => i.group === groupKey);
}

export function groupTotal(other, groupKey) {
  if (!other) return 0;
  return itemsByGroup(groupKey).reduce(
    (sum, item) => sum + (Number(other[item.key]) || 0),
    0,
  );
}

export function hasAnyOther(other) {
  if (!other) return false;
  return OTHER_ITEMS.some((item) => (Number(other[item.key]) || 0) > 0);
}
