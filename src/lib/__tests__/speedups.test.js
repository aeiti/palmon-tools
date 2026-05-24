import { describe, expect, it } from 'vitest';
import {
  categoryTotalMinutes,
  categoryTotalWithUniversal,
  emptyCategoryCounts,
  emptyInventory,
  hasAnySpeedups,
} from '../speedups.js';

describe('emptyCategoryCounts', () => {
  it('returns an object with every denomination at 0', () => {
    const counts = emptyCategoryCounts();
    expect(counts['8h']).toBe(0);
    expect(counts['3h']).toBe(0);
    expect(counts['1h']).toBe(0);
    expect(counts['5m']).toBe(0);
    expect(counts['1m']).toBe(0);
  });
});

describe('emptyInventory', () => {
  it('returns every category populated with zero counts', () => {
    const inv = emptyInventory();
    for (const key of ['universal', 'construction', 'research', 'training', 'healing', 'breeding']) {
      expect(inv[key]).toBeDefined();
      expect(inv[key]['1h']).toBe(0);
    }
  });
});

describe('categoryTotalMinutes', () => {
  it('returns 0 for missing counts', () => {
    expect(categoryTotalMinutes(null)).toBe(0);
    expect(categoryTotalMinutes(undefined)).toBe(0);
  });

  it('multiplies each denomination by its minutes', () => {
    expect(
      categoryTotalMinutes({ '8h': 1, '3h': 2, '1h': 3, '5m': 4, '1m': 5 }),
    ).toBe(480 + 360 + 180 + 20 + 5);
  });

  it('coerces string counts', () => {
    expect(categoryTotalMinutes({ '1h': '2' })).toBe(120);
  });

  it('treats non-numeric counts as zero', () => {
    expect(categoryTotalMinutes({ '1h': 'abc', '5m': 4 })).toBe(20);
  });
});

describe('categoryTotalWithUniversal', () => {
  it('adds the universal category to non-universal categories', () => {
    const inv = {
      universal: { '1h': 1 },
      construction: { '1h': 2 },
    };
    expect(categoryTotalWithUniversal(inv, 'construction')).toBe(180);
  });

  it('does not double-count when asking for universal', () => {
    const inv = { universal: { '1h': 1 } };
    expect(categoryTotalWithUniversal(inv, 'universal')).toBe(60);
  });
});

describe('hasAnySpeedups', () => {
  it('returns false for null / undefined', () => {
    expect(hasAnySpeedups(null)).toBe(false);
    expect(hasAnySpeedups(undefined)).toBe(false);
  });

  it('returns false when every category total is zero', () => {
    expect(hasAnySpeedups(emptyInventory())).toBe(false);
  });

  it('returns true if any category has a nonzero count', () => {
    const inv = emptyInventory();
    inv.construction['1h'] = 1;
    expect(hasAnySpeedups(inv)).toBe(true);
  });
});
