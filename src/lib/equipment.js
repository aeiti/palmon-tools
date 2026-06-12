// Per-profile equipment state. Each entry is an owned instance of a
// catalog item with its own progression and palmon assignment.
//
// Shape: { id, itemKey, ascendLevel, enhanceLevel, assignedPalmonId }
//
// Cross-cutting invariant: the equipment list is the source of truth
// for "what is equipped where". The palmon-side slot array
// (palmon.equipment[slot - 1]) is a derived index — keep them in sync
// via syncEquipmentAssignments at load time.

import {
  EQUIPMENT_CATALOG_BY_KEY,
  EQUIPMENT_SLOTS,
  MAX_ASCEND_LEVEL,
  MAX_ENHANCE_LEVEL,
} from './data/equipment.js';

const ID_PREFIX = 'eq_';

function makeId() {
  return `${ID_PREFIX}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isEquipmentInstanceId(value) {
  return typeof value === 'string' && value.startsWith(ID_PREFIX);
}

function clampLevel(value, max) {
  if (value === null || value === undefined || value === '') return 0;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(max, Math.floor(n));
}

export function emptyEquipmentItem(itemKey) {
  return {
    id: makeId(),
    itemKey: itemKey || '',
    ascendLevel: 0,
    enhanceLevel: 0,
    assignedPalmonId: null,
  };
}

// Permissive — accepts any object-y input and fills in defaults. Used
// at runtime so partial edits survive without being dropped to null by
// updateEquipment's fallback path. Returns null if the input can't be
// salvaged (no recognizable itemKey).
export function normalizeEquipmentItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const itemKey =
    typeof raw.itemKey === 'string' && EQUIPMENT_CATALOG_BY_KEY[raw.itemKey]
      ? raw.itemKey
      : '';
  if (!itemKey) return null;
  const assignedPalmonId =
    typeof raw.assignedPalmonId === 'string' && raw.assignedPalmonId
      ? raw.assignedPalmonId
      : null;
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : makeId(),
    itemKey,
    ascendLevel: clampLevel(raw.ascendLevel, MAX_ASCEND_LEVEL),
    enhanceLevel: clampLevel(raw.enhanceLevel, MAX_ENHANCE_LEVEL),
    assignedPalmonId,
  };
}

// Load-time pass: drops anything that can't be normalized, dedupes
// ids, and ensures every instance is shaped correctly.
export function normalizeEquipmentList(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const norm = normalizeEquipmentItem(item);
    if (!norm) continue;
    if (seen.has(norm.id)) norm.id = makeId();
    seen.add(norm.id);
    out.push(norm);
  }
  return out;
}

function emptyPalmonSlots() {
  return Array.from({ length: EQUIPMENT_SLOTS }, () => '');
}

// Reconcile equipment-side assignedPalmonId with palmon-side
// equipment[slot] arrays. Equipment is the source of truth; the
// palmon slot array is rewritten to match. Inputs are not mutated.
//
//  - drop assignedPalmonId pointing at a palmon that doesn't exist
//  - drop assignedPalmonId if the catalog item has an invalid slot
//  - if two instances claim the same (palmon, slot), keep the first
//    by list order; unassign the rest
//  - palmon.equipment[i] is overwritten with the equipment-id that
//    claims that (palmon, slot), or '' if none does
//  - legacy free-text strings (anything not eq_…) are discarded
export function syncEquipmentAssignments(equipment, palmons) {
  const palmonList = Array.isArray(palmons) ? palmons : [];
  const equipmentList = Array.isArray(equipment) ? equipment : [];
  const palmonIds = new Set(palmonList.map((p) => p.id));

  // First pass: validate assignedPalmonId on the equipment side and
  // resolve same-(palmon, slot) collisions deterministically.
  const claimed = new Map(); // `${palmonId}|${slot}` -> equipmentId
  const equipmentOut = equipmentList.map((item) => {
    const catalog = EQUIPMENT_CATALOG_BY_KEY[item.itemKey];
    let assignedPalmonId = item.assignedPalmonId || null;
    if (assignedPalmonId && !palmonIds.has(assignedPalmonId)) {
      assignedPalmonId = null;
    }
    if (assignedPalmonId && !catalog) {
      assignedPalmonId = null;
    }
    if (assignedPalmonId) {
      const slotKey = `${assignedPalmonId}|${catalog.slot}`;
      if (claimed.has(slotKey)) {
        assignedPalmonId = null;
      } else {
        claimed.set(slotKey, item.id);
      }
    }
    return assignedPalmonId === item.assignedPalmonId
      ? item
      : { ...item, assignedPalmonId };
  });

  // Second pass: rewrite each palmon's slot array from the claims map.
  const palmonsOut = palmonList.map((p) => {
    const slots = emptyPalmonSlots();
    for (let i = 0; i < EQUIPMENT_SLOTS; i++) {
      const id = claimed.get(`${p.id}|${i + 1}`);
      if (id) slots[i] = id;
    }
    // Avoid breaking referential equality when nothing changed.
    const current = Array.isArray(p.equipment) ? p.equipment : [];
    const unchanged =
      current.length === slots.length &&
      slots.every((v, i) => v === current[i]);
    return unchanged ? p : { ...p, equipment: slots };
  });

  return { equipment: equipmentOut, palmons: palmonsOut };
}

// Stateless helper used by the assign action: given the current
// equipment list and the desired (equipmentId, palmonId | null)
// assignment, returns the next equipment list with the auto-swap
// applied. The previous occupant of the same (palmon, slot) is
// unassigned. Assigning to null just clears the target.
export function applyEquipmentAssignment(equipment, equipmentId, palmonId) {
  if (!Array.isArray(equipment)) return [];
  const target = equipment.find((e) => e.id === equipmentId);
  if (!target) return equipment;
  const catalog = EQUIPMENT_CATALOG_BY_KEY[target.itemKey];
  if (!catalog) return equipment;
  const nextPalmonId = palmonId || null;
  return equipment.map((e) => {
    if (e.id === equipmentId) {
      return e.assignedPalmonId === nextPalmonId
        ? e
        : { ...e, assignedPalmonId: nextPalmonId };
    }
    // Anyone else already in the target (palmon, slot) gets evicted.
    if (
      nextPalmonId &&
      e.assignedPalmonId === nextPalmonId &&
      EQUIPMENT_CATALOG_BY_KEY[e.itemKey]?.slot === catalog.slot
    ) {
      return { ...e, assignedPalmonId: null };
    }
    return e;
  });
}
