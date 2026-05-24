import { describe, expect, it } from 'vitest';
import {
  buildingsSummary,
  duplicatePalmonKeys,
  emptyBuildings,
  findPalmonBuildingAssignment,
  hasAnyBuildings,
  normalizeBuildings,
} from '../buildings.js';
import {
  BUILDINGS,
  MAX_BUILDING_LEVEL,
} from '../data/buildings.js';

function findBuilding(key) {
  return BUILDINGS.find((b) => b.key === key);
}

describe('emptyBuildings', () => {
  it('includes every building with its count of instances', () => {
    const out = emptyBuildings();
    for (const b of BUILDINGS) {
      expect(out[b.key]).toHaveLength(b.count);
      for (const inst of out[b.key]) {
        expect(inst).toEqual({ level: 0, palmon: '' });
      }
    }
  });
});

describe('normalizeBuildings', () => {
  it('returns empty structure for nullish / non-object input', () => {
    expect(normalizeBuildings(null)).toEqual(emptyBuildings());
    expect(normalizeBuildings('garbage')).toEqual(emptyBuildings());
  });

  it('floors and clamps level to [0, MAX_BUILDING_LEVEL]', () => {
    const out = normalizeBuildings({
      camp: [{ level: MAX_BUILDING_LEVEL + 10, palmon: '' }],
    });
    expect(out.camp[0].level).toBe(MAX_BUILDING_LEVEL);

    const fractional = normalizeBuildings({
      camp: [{ level: 12.9, palmon: '' }],
    });
    expect(fractional.camp[0].level).toBe(12);

    const negative = normalizeBuildings({
      camp: [{ level: -5, palmon: '' }],
    });
    expect(negative.camp[0].level).toBe(0);
  });

  it('trims palmon strings and coerces non-strings to ""', () => {
    const out = normalizeBuildings({
      armigo_hut: [{ level: 5, palmon: '  Charizard  ' }, { level: 0, palmon: 123 }],
    });
    expect(out.armigo_hut[0].palmon).toBe('Charizard');
    expect(out.armigo_hut[1].palmon).toBe('');
  });

  it('ignores extra instances past the known count', () => {
    const extra = findBuilding('hospital').count + 2; // hospital has count=2
    const out = normalizeBuildings({
      hospital: Array.from({ length: extra }, () => ({ level: 1 })),
    });
    expect(out.hospital).toHaveLength(2);
  });

  it('keeps unspecified instances as fresh empties', () => {
    // Only specify the first hospital instance; second should default
    const out = normalizeBuildings({ hospital: [{ level: 5 }] });
    expect(out.hospital[0].level).toBe(5);
    expect(out.hospital[1]).toEqual({ level: 0, palmon: '' });
  });
});

describe('hasAnyBuildings', () => {
  it('returns false for an empty structure', () => {
    expect(hasAnyBuildings(emptyBuildings())).toBe(false);
  });

  it('returns true once any instance has a level > 0', () => {
    const out = emptyBuildings();
    out.camp[0].level = 1;
    expect(hasAnyBuildings(out)).toBe(true);
  });

  it('returns true once any instance has a palmon set', () => {
    const out = emptyBuildings();
    out.armigo_hut[0].palmon = 'A';
    expect(hasAnyBuildings(out)).toBe(true);
  });
});

describe('buildingsSummary', () => {
  it('counts total, filled, and summed levels', () => {
    const out = emptyBuildings();
    out.camp[0].level = 30;
    out.hospital[0].level = 10;
    const summary = buildingsSummary(out);
    expect(summary.filled).toBe(2);
    expect(summary.levelSum).toBe(40);
    // total = sum of every building's count
    expect(summary.total).toBe(
      BUILDINGS.reduce((s, b) => s + b.count, 0),
    );
  });
});

describe('duplicatePalmonKeys', () => {
  it('returns an empty set when no duplicates', () => {
    const out = emptyBuildings();
    out.armigo_hut[0].palmon = 'A';
    out.armigo_hut[1].palmon = 'B';
    expect(duplicatePalmonKeys(out).size).toBe(0);
  });

  it('returns the lowercased keys of duplicated names', () => {
    const out = emptyBuildings();
    out.armigo_hut[0].palmon = 'Charizard';
    out.armigo_hut[1].palmon = 'charizard'; // case-insensitive match
    out.squad[0].palmon = 'Blastoise';
    const dupes = duplicatePalmonKeys(out);
    expect(dupes.has('charizard')).toBe(true);
    expect(dupes.has('blastoise')).toBe(false);
  });

  it('ignores empty palmon slots', () => {
    const out = emptyBuildings();
    expect(duplicatePalmonKeys(out).size).toBe(0);
  });
});

describe('findPalmonBuildingAssignment', () => {
  it('returns null when palmon is not assigned', () => {
    expect(findPalmonBuildingAssignment('pm_x', emptyBuildings())).toBeNull();
    expect(findPalmonBuildingAssignment(null, emptyBuildings())).toBeNull();
  });

  it('returns building info with indexed label for multi-count buildings', () => {
    const out = emptyBuildings();
    out.armigo_hut[1].palmon = 'pm_42';
    const result = findPalmonBuildingAssignment('pm_42', out);
    expect(result).toEqual({
      buildingKey: 'armigo_hut',
      index: 1,
      label: 'Armigo Hut 2',
    });
  });

  it('returns unindexed label for single-count buildings', () => {
    const out = emptyBuildings();
    out.camp[0].palmon = 'pm_42';
    const result = findPalmonBuildingAssignment('pm_42', out);
    expect(result).toEqual({
      buildingKey: 'camp',
      index: 0,
      label: 'Camp',
    });
  });
});
