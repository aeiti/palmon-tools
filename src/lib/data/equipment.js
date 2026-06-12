// Static catalog of equippable items. The game's equipment grid is
// finite: 4 slots × 5 tiers = 20 items. A "catalog item" is the
// game's named thing (e.g. "Staff of Wonders"); the user can own any
// number of instances of each, and each instance carries its own
// ascend/enhance levels and palmon assignment in profile.equipment.

export const EQUIPMENT_SLOTS = 4;

// Slot index 1..EQUIPMENT_SLOTS, ordered to match how palmon.equipment
// slot positions read in the Roster card.
export const EQUIPMENT_SLOT_LABELS = ['Weapon', 'Shield', 'Pendant', 'Mask'];

// Tier order is power-descending (UR is the strongest), the same order
// in-game tier filters surface them.
export const EQUIPMENT_TIERS = ['UR', 'SSR', 'SR', 'R', 'N'];

const TIER_SET = new Set(EQUIPMENT_TIERS);

// Generous upper bounds — clamp at load/runtime, edit one constant if
// the game's caps come into view.
export const MAX_ASCEND_LEVEL = 99;
export const MAX_ENHANCE_LEVEL = 99;

// Catalog. Key format is `<slot>_<tier>` in lowercase so it's stable,
// readable, and survives JSON round-trips. Slot is the 1-based index
// into EQUIPMENT_SLOT_LABELS.
export const EQUIPMENT_CATALOG = [
  { key: 'weapon_ur', slot: 1, tier: 'UR', name: 'Staff of Wonders' },
  { key: 'weapon_ssr', slot: 1, tier: 'SSR', name: 'Bejeweled Blade' },
  { key: 'weapon_sr', slot: 1, tier: 'SR', name: 'Woozifying Whacker' },
  { key: 'weapon_r', slot: 1, tier: 'R', name: 'KO Gloves' },
  { key: 'weapon_n', slot: 1, tier: 'N', name: 'Simple Club' },
  { key: 'shield_ur', slot: 2, tier: 'UR', name: 'Energy Barrier' },
  { key: 'shield_ssr', slot: 2, tier: 'SSR', name: 'Gemstone Shield' },
  { key: 'shield_sr', slot: 2, tier: 'SR', name: 'Tidal Shield' },
  { key: 'shield_r', slot: 2, tier: 'R', name: 'Elusive Cloak' },
  { key: 'shield_n', slot: 2, tier: 'N', name: 'Woodland Umbrella' },
  { key: 'pendant_ur', slot: 3, tier: 'UR', name: 'Wishing Amulet' },
  { key: 'pendant_ssr', slot: 3, tier: 'SSR', name: 'Handmade Doll' },
  { key: 'pendant_sr', slot: 3, tier: 'SR', name: 'Bellissimo Bell' },
  { key: 'pendant_r', slot: 3, tier: 'R', name: 'Buddy Whistle' },
  { key: 'pendant_n', slot: 3, tier: 'N', name: 'Graceful Feather' },
  { key: 'mask_ur', slot: 4, tier: 'UR', name: 'Mask of Justice' },
  { key: 'mask_ssr', slot: 4, tier: 'SSR', name: 'Ranger Hat' },
  { key: 'mask_sr', slot: 4, tier: 'SR', name: 'Astute Glasses' },
  { key: 'mask_r', slot: 4, tier: 'R', name: 'Rowdy Headband' },
  { key: 'mask_n', slot: 4, tier: 'N', name: 'Training Headband' },
];

export const EQUIPMENT_CATALOG_BY_KEY = EQUIPMENT_CATALOG.reduce((acc, e) => {
  acc[e.key] = e;
  return acc;
}, {});

export function isValidEquipmentTier(tier) {
  return typeof tier === 'string' && TIER_SET.has(tier);
}

export function isValidEquipmentSlot(slot) {
  return Number.isInteger(slot) && slot >= 1 && slot <= EQUIPMENT_SLOTS;
}

export function equipmentByKey(key) {
  return EQUIPMENT_CATALOG_BY_KEY[key] || null;
}

// 1..EQUIPMENT_SLOTS → label. Returns '' for out-of-range so the
// caller doesn't need to guard.
export function slotLabel(slot) {
  if (!isValidEquipmentSlot(slot)) return '';
  return EQUIPMENT_SLOT_LABELS[slot - 1];
}

export function equipmentsForSlot(slot) {
  if (!isValidEquipmentSlot(slot)) return [];
  return EQUIPMENT_CATALOG.filter((e) => e.slot === slot);
}
