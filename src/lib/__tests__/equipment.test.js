import { describe, expect, it } from 'vitest';
import {
  EQUIPMENT_CATALOG,
  EQUIPMENT_CATALOG_BY_KEY,
  EQUIPMENT_SLOTS,
  EQUIPMENT_SLOT_LABELS,
  EQUIPMENT_TIERS,
  MAX_ASCEND_LEVEL,
  MAX_ENHANCE_LEVEL,
  equipmentByKey,
  equipmentsForSlot,
  isValidEquipmentSlot,
  isValidEquipmentTier,
  slotLabel,
} from '../data/equipment.js';
import {
  applyEquipmentAssignment,
  emptyEquipmentItem,
  isEquipmentInstanceId,
  normalizeEquipmentItem,
  normalizeEquipmentList,
  syncEquipmentAssignments,
} from '../equipment.js';

describe('EQUIPMENT_CATALOG', () => {
  it('has exactly EQUIPMENT_SLOTS × EQUIPMENT_TIERS entries', () => {
    expect(EQUIPMENT_CATALOG).toHaveLength(
      EQUIPMENT_SLOTS * EQUIPMENT_TIERS.length,
    );
  });

  it('covers every (slot, tier) cell uniquely', () => {
    const seen = new Set();
    for (const entry of EQUIPMENT_CATALOG) {
      const cell = `${entry.slot}|${entry.tier}`;
      expect(seen.has(cell)).toBe(false);
      seen.add(cell);
    }
    expect(seen.size).toBe(EQUIPMENT_SLOTS * EQUIPMENT_TIERS.length);
  });

  it('only uses valid slots and tiers', () => {
    for (const entry of EQUIPMENT_CATALOG) {
      expect(isValidEquipmentSlot(entry.slot)).toBe(true);
      expect(isValidEquipmentTier(entry.tier)).toBe(true);
      expect(typeof entry.key).toBe('string');
      expect(entry.key).not.toBe('');
      expect(typeof entry.name).toBe('string');
      expect(entry.name).not.toBe('');
    }
  });

  it('keys are unique', () => {
    const keys = EQUIPMENT_CATALOG.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('lookup helpers match the source data', () => {
    for (const entry of EQUIPMENT_CATALOG) {
      expect(EQUIPMENT_CATALOG_BY_KEY[entry.key]).toBe(entry);
      expect(equipmentByKey(entry.key)).toBe(entry);
    }
    expect(equipmentByKey('nope')).toBeNull();
  });
});

describe('slotLabel / equipmentsForSlot', () => {
  it('maps 1..EQUIPMENT_SLOTS to declared labels', () => {
    for (let s = 1; s <= EQUIPMENT_SLOTS; s++) {
      expect(slotLabel(s)).toBe(EQUIPMENT_SLOT_LABELS[s - 1]);
    }
  });

  it('returns empty string for out-of-range slots', () => {
    expect(slotLabel(0)).toBe('');
    expect(slotLabel(EQUIPMENT_SLOTS + 1)).toBe('');
    expect(slotLabel('weapon')).toBe('');
    expect(slotLabel(null)).toBe('');
  });

  it('returns every item in a slot, exactly EQUIPMENT_TIERS.length of them', () => {
    for (let s = 1; s <= EQUIPMENT_SLOTS; s++) {
      const items = equipmentsForSlot(s);
      expect(items).toHaveLength(EQUIPMENT_TIERS.length);
      for (const item of items) expect(item.slot).toBe(s);
    }
  });

  it('returns empty list for out-of-range slots', () => {
    expect(equipmentsForSlot(0)).toEqual([]);
    expect(equipmentsForSlot(EQUIPMENT_SLOTS + 1)).toEqual([]);
  });
});

describe('isEquipmentInstanceId', () => {
  it('accepts eq_-prefixed strings', () => {
    expect(isEquipmentInstanceId('eq_abc123')).toBe(true);
    expect(isEquipmentInstanceId(emptyEquipmentItem('weapon_n').id)).toBe(true);
  });

  it('rejects everything else', () => {
    expect(isEquipmentInstanceId('')).toBe(false);
    expect(isEquipmentInstanceId('pm_abc')).toBe(false);
    expect(isEquipmentInstanceId('nt_abc')).toBe(false);
    expect(isEquipmentInstanceId(null)).toBe(false);
    expect(isEquipmentInstanceId(undefined)).toBe(false);
    expect(isEquipmentInstanceId(42)).toBe(false);
  });
});

describe('emptyEquipmentItem', () => {
  it('returns a fresh instance with sensible defaults', () => {
    const item = emptyEquipmentItem('weapon_ur');
    expect(item.id.startsWith('eq_')).toBe(true);
    expect(item.itemKey).toBe('weapon_ur');
    expect(item.ascendLevel).toBe(0);
    expect(item.enhanceLevel).toBe(0);
    expect(item.assignedPalmonId).toBeNull();
  });

  it('tolerates an empty itemKey (caller may patch it)', () => {
    const item = emptyEquipmentItem();
    expect(item.itemKey).toBe('');
  });
});

describe('normalizeEquipmentItem', () => {
  it('rejects nullish / non-object input', () => {
    expect(normalizeEquipmentItem(null)).toBeNull();
    expect(normalizeEquipmentItem(undefined)).toBeNull();
    expect(normalizeEquipmentItem('weapon_ur')).toBeNull();
    expect(normalizeEquipmentItem(42)).toBeNull();
  });

  it('rejects unknown itemKey', () => {
    expect(normalizeEquipmentItem({ itemKey: 'nope' })).toBeNull();
    expect(normalizeEquipmentItem({ itemKey: '' })).toBeNull();
  });

  it('clamps levels to [0, MAX]', () => {
    const out = normalizeEquipmentItem({
      itemKey: 'weapon_ur',
      ascendLevel: 999,
      enhanceLevel: -5,
    });
    expect(out.ascendLevel).toBe(MAX_ASCEND_LEVEL);
    expect(out.enhanceLevel).toBe(0);
    const out2 = normalizeEquipmentItem({
      itemKey: 'weapon_ur',
      enhanceLevel: MAX_ENHANCE_LEVEL + 50,
    });
    expect(out2.enhanceLevel).toBe(MAX_ENHANCE_LEVEL);
  });

  it('treats nullish / empty / NaN levels as 0', () => {
    const out = normalizeEquipmentItem({
      itemKey: 'weapon_ur',
      ascendLevel: null,
      enhanceLevel: '',
    });
    expect(out.ascendLevel).toBe(0);
    expect(out.enhanceLevel).toBe(0);
    const out2 = normalizeEquipmentItem({
      itemKey: 'weapon_ur',
      ascendLevel: 'abc',
    });
    expect(out2.ascendLevel).toBe(0);
  });

  it('floors fractional levels', () => {
    const out = normalizeEquipmentItem({
      itemKey: 'weapon_ur',
      ascendLevel: 3.7,
    });
    expect(out.ascendLevel).toBe(3);
  });

  it('preserves a provided id', () => {
    const out = normalizeEquipmentItem({
      id: 'eq_explicit',
      itemKey: 'weapon_ur',
    });
    expect(out.id).toBe('eq_explicit');
  });

  it('synthesizes an id when missing', () => {
    const out = normalizeEquipmentItem({ itemKey: 'weapon_ur' });
    expect(out.id.startsWith('eq_')).toBe(true);
  });

  it('coerces empty assignedPalmonId to null', () => {
    const out = normalizeEquipmentItem({
      itemKey: 'weapon_ur',
      assignedPalmonId: '',
    });
    expect(out.assignedPalmonId).toBeNull();
  });

  it('keeps a string assignedPalmonId', () => {
    const out = normalizeEquipmentItem({
      itemKey: 'weapon_ur',
      assignedPalmonId: 'pm_abc',
    });
    expect(out.assignedPalmonId).toBe('pm_abc');
  });
});

describe('normalizeEquipmentList', () => {
  it('returns [] for non-array input', () => {
    expect(normalizeEquipmentList(null)).toEqual([]);
    expect(normalizeEquipmentList('weapon_ur')).toEqual([]);
    expect(normalizeEquipmentList({})).toEqual([]);
  });

  it('drops entries that cannot be normalized', () => {
    const out = normalizeEquipmentList([
      { itemKey: 'weapon_ur' },
      null,
      { itemKey: 'unknown' },
      'junk',
      { itemKey: 'shield_n' },
    ]);
    expect(out.map((e) => e.itemKey)).toEqual(['weapon_ur', 'shield_n']);
  });

  it('dedupes ids by re-issuing on collision', () => {
    const out = normalizeEquipmentList([
      { id: 'eq_dup', itemKey: 'weapon_ur' },
      { id: 'eq_dup', itemKey: 'shield_n' },
    ]);
    expect(out).toHaveLength(2);
    expect(new Set(out.map((e) => e.id)).size).toBe(2);
  });
});

function fakePalmon(id) {
  return { id, equipment: ['', '', '', ''] };
}

describe('syncEquipmentAssignments', () => {
  it('returns empty results when inputs are missing', () => {
    const out = syncEquipmentAssignments(null, null);
    expect(out.equipment).toEqual([]);
    expect(out.palmons).toEqual([]);
  });

  it('clears assignedPalmonId pointing at an unknown palmon', () => {
    const equipment = [
      { id: 'eq_a', itemKey: 'weapon_ur', ascendLevel: 0, enhanceLevel: 0, assignedPalmonId: 'pm_ghost' },
    ];
    const out = syncEquipmentAssignments(equipment, []);
    expect(out.equipment[0].assignedPalmonId).toBeNull();
  });

  it('rewrites palmon equipment slots from the equipment side', () => {
    const palmons = [fakePalmon('pm_one')];
    const equipment = [
      { id: 'eq_weap', itemKey: 'weapon_ur', ascendLevel: 0, enhanceLevel: 0, assignedPalmonId: 'pm_one' },
      { id: 'eq_pend', itemKey: 'pendant_sr', ascendLevel: 0, enhanceLevel: 0, assignedPalmonId: 'pm_one' },
    ];
    const out = syncEquipmentAssignments(equipment, palmons);
    expect(out.palmons[0].equipment).toEqual(['eq_weap', '', 'eq_pend', '']);
  });

  it('discards legacy free-text in palmon.equipment by rewriting from claims', () => {
    const palmons = [{ id: 'pm_one', equipment: ['Legacy Sword', 'foo', 'bar', 'baz'] }];
    const equipment = [
      { id: 'eq_weap', itemKey: 'weapon_ur', ascendLevel: 0, enhanceLevel: 0, assignedPalmonId: 'pm_one' },
    ];
    const out = syncEquipmentAssignments(equipment, palmons);
    expect(out.palmons[0].equipment).toEqual(['eq_weap', '', '', '']);
  });

  it('resolves same-(palmon, slot) collisions deterministically', () => {
    const palmons = [fakePalmon('pm_one')];
    const equipment = [
      { id: 'eq_first', itemKey: 'weapon_ur', ascendLevel: 0, enhanceLevel: 0, assignedPalmonId: 'pm_one' },
      { id: 'eq_second', itemKey: 'weapon_n', ascendLevel: 0, enhanceLevel: 0, assignedPalmonId: 'pm_one' },
    ];
    const out = syncEquipmentAssignments(equipment, palmons);
    expect(out.equipment[0].assignedPalmonId).toBe('pm_one');
    expect(out.equipment[1].assignedPalmonId).toBeNull();
    expect(out.palmons[0].equipment[0]).toBe('eq_first');
  });

  it('preserves cross-palmon parallel assignments at the same slot', () => {
    const palmons = [fakePalmon('pm_one'), fakePalmon('pm_two')];
    const equipment = [
      { id: 'eq_a', itemKey: 'weapon_ur', ascendLevel: 0, enhanceLevel: 0, assignedPalmonId: 'pm_one' },
      { id: 'eq_b', itemKey: 'weapon_n', ascendLevel: 0, enhanceLevel: 0, assignedPalmonId: 'pm_two' },
    ];
    const out = syncEquipmentAssignments(equipment, palmons);
    expect(out.equipment[0].assignedPalmonId).toBe('pm_one');
    expect(out.equipment[1].assignedPalmonId).toBe('pm_two');
    expect(out.palmons[0].equipment[0]).toBe('eq_a');
    expect(out.palmons[1].equipment[0]).toBe('eq_b');
  });

  it('preserves referential equality when nothing changes', () => {
    const palmons = [{ id: 'pm_one', equipment: ['', '', '', ''] }];
    const equipment = [
      { id: 'eq_a', itemKey: 'weapon_ur', ascendLevel: 0, enhanceLevel: 0, assignedPalmonId: null },
    ];
    const out = syncEquipmentAssignments(equipment, palmons);
    expect(out.equipment[0]).toBe(equipment[0]);
    expect(out.palmons[0]).toBe(palmons[0]);
  });
});

describe('applyEquipmentAssignment', () => {
  function base() {
    return [
      { id: 'eq_a', itemKey: 'weapon_ur', ascendLevel: 0, enhanceLevel: 0, assignedPalmonId: null },
      { id: 'eq_b', itemKey: 'weapon_n', ascendLevel: 0, enhanceLevel: 0, assignedPalmonId: 'pm_one' },
      { id: 'eq_c', itemKey: 'shield_ur', ascendLevel: 0, enhanceLevel: 0, assignedPalmonId: 'pm_one' },
    ];
  }

  it('assigning to null clears the target only', () => {
    const out = applyEquipmentAssignment(base(), 'eq_b', null);
    expect(out.find((e) => e.id === 'eq_b').assignedPalmonId).toBeNull();
    expect(out.find((e) => e.id === 'eq_c').assignedPalmonId).toBe('pm_one');
  });

  it('auto-swap unassigns the prior occupant of the same (palmon, slot)', () => {
    const out = applyEquipmentAssignment(base(), 'eq_a', 'pm_one');
    expect(out.find((e) => e.id === 'eq_a').assignedPalmonId).toBe('pm_one');
    expect(out.find((e) => e.id === 'eq_b').assignedPalmonId).toBeNull();
    // Different slot — unaffected.
    expect(out.find((e) => e.id === 'eq_c').assignedPalmonId).toBe('pm_one');
  });

  it('no-op when target is already assigned to the requested palmon', () => {
    const list = base();
    const out = applyEquipmentAssignment(list, 'eq_b', 'pm_one');
    expect(out.find((e) => e.id === 'eq_b')).toBe(list[1]);
  });

  it('ignores unknown target id', () => {
    const list = base();
    const out = applyEquipmentAssignment(list, 'eq_missing', 'pm_one');
    expect(out).toBe(list);
  });

  it('handles a non-array input gracefully', () => {
    expect(applyEquipmentAssignment(null, 'eq_a', 'pm_one')).toEqual([]);
  });
});
