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
const OTHER_GROUP_KEYS = new Set(OTHER_GROUPS.map((g) => g.key));

const CUSTOM_PREFIX = 'custom:';

export function customItemKey(id) {
  return `${CUSTOM_PREFIX}${id}`;
}

export function isCustomItemKey(key) {
  return typeof key === 'string' && key.startsWith(CUSTOM_PREFIX);
}

export function customIdFromKey(key) {
  return isCustomItemKey(key) ? key.slice(CUSTOM_PREFIX.length) : null;
}

export function emptyCustomOther() {
  return [];
}

export function normalizeCustomOther(list) {
  if (!Array.isArray(list)) return [];
  const seenIds = new Set();
  const out = [];
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue;
    const id = typeof raw.id === 'string' && raw.id ? raw.id : null;
    const label =
      typeof raw.label === 'string' ? raw.label.trim().slice(0, 80) : '';
    const group = OTHER_GROUP_KEYS.has(raw.group)
      ? raw.group
      : OTHER_GROUPS[0].key;
    if (!id || !label || seenIds.has(id)) continue;
    seenIds.add(id);
    out.push({ id, label, group });
  }
  return out;
}

function customKeySet(customItems) {
  return new Set((customItems || []).map((c) => customItemKey(c.id)));
}

export function emptyOther(customItems = []) {
  const base = OTHER_ITEMS.reduce((acc, item) => {
    acc[item.key] = 0;
    return acc;
  }, {});
  for (const c of customItems) base[customItemKey(c.id)] = 0;
  return base;
}

export function normalizeOther(other, customItems = []) {
  const base = emptyOther(customItems);
  if (!other || typeof other !== 'object') return base;
  const customKeys = customKeySet(customItems);
  for (const key of Object.keys(other)) {
    if (!OTHER_ITEM_KEYS.has(key) && !customKeys.has(key)) continue;
    const raw = Number(other[key]);
    base[key] = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
  }
  return base;
}

function customItemsForGroup(groupKey, customItems = []) {
  return (customItems || [])
    .filter((c) => c.group === groupKey)
    .map((c) => ({
      key: customItemKey(c.id),
      label: c.label,
      group: c.group,
      custom: true,
      id: c.id,
    }));
}

export function itemsByGroup(groupKey, customItems = []) {
  return [
    ...OTHER_ITEMS.filter((i) => i.group === groupKey),
    ...customItemsForGroup(groupKey, customItems),
  ];
}

export function groupTotal(other, groupKey, customItems = []) {
  if (!other) return 0;
  return itemsByGroup(groupKey, customItems).reduce(
    (sum, item) => sum + (Number(other[item.key]) || 0),
    0,
  );
}

export function hasAnyOther(other, customItems = []) {
  if (!other) return false;
  if (OTHER_ITEMS.some((item) => (Number(other[item.key]) || 0) > 0)) {
    return true;
  }
  return (customItems || []).some(
    (c) => (Number(other[customItemKey(c.id)]) || 0) > 0,
  );
}
