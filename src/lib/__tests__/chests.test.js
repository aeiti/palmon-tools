import { describe, expect, it } from 'vitest';
import {
  emptyChests,
  emptyResourceCounts,
  hasAnyChests,
  normalizeChests,
  resourceTierTotal,
  tierTypeTotal,
} from '../chests.js';

describe('emptyResourceCounts', () => {
  it('returns an object with every resource at 0', () => {
    const counts = emptyResourceCounts();
    expect(counts.xp).toBe(0);
    expect(counts.electricity).toBe(0);
    expect(counts.gold).toBe(0);
    expect(counts.lumber).toBe(0);
    expect(counts.steel).toBe(0);
  });
});

describe('emptyChests', () => {
  it('builds both types with their respective tiers', () => {
    const chests = emptyChests();
    expect(chests.standard).toBeDefined();
    expect(chests.leveled).toBeDefined();
    expect(chests.standard.gold).toBeDefined();
    expect(chests.standard.green).toBeDefined(); // R only exists on standard
    expect(chests.leveled.gold).toBeDefined();
    expect(chests.leveled.green).toBeUndefined();
  });

  it('initializes every cell to 0', () => {
    const chests = emptyChests();
    expect(chests.standard.gold.xp).toBe(0);
    expect(chests.leveled.blue.steel).toBe(0);
  });
});

describe('tierTypeTotal', () => {
  it('sums every resource for a tier+type', () => {
    const chests = emptyChests();
    chests.standard.gold.xp = 2;
    chests.standard.gold.gold = 3;
    expect(tierTypeTotal(chests, 'standard', 'gold')).toBe(5);
  });

  it('returns 0 for missing combinations', () => {
    expect(tierTypeTotal({}, 'standard', 'gold')).toBe(0);
    expect(tierTypeTotal(null, 'standard', 'gold')).toBe(0);
  });
});

describe('resourceTierTotal', () => {
  it('sums one resource across every type that has that tier', () => {
    const chests = emptyChests();
    chests.standard.gold.xp = 2;
    chests.leveled.gold.xp = 3;
    expect(resourceTierTotal(chests, 'gold', 'xp')).toBe(5);
  });

  it('skips types that do not have the requested tier', () => {
    const chests = emptyChests();
    chests.standard.green.xp = 7;
    // green doesn't exist on leveled — only standard contributes
    expect(resourceTierTotal(chests, 'green', 'xp')).toBe(7);
  });
});

describe('hasAnyChests', () => {
  it('returns false for an empty chests structure', () => {
    expect(hasAnyChests(emptyChests())).toBe(false);
  });

  it('returns true once any cell is nonzero', () => {
    const chests = emptyChests();
    chests.leveled.blue.electricity = 1;
    expect(hasAnyChests(chests)).toBe(true);
  });
});

describe('normalizeChests', () => {
  it('returns a fully empty structure for null / non-object input', () => {
    expect(normalizeChests(null)).toEqual(emptyChests());
    expect(normalizeChests('garbage')).toEqual(emptyChests());
  });

  it('keeps valid counts and floors fractional values', () => {
    const out = normalizeChests({
      standard: { gold: { xp: 7.9 } },
    });
    expect(out.standard.gold.xp).toBe(7);
  });

  it('coerces negatives to 0', () => {
    const out = normalizeChests({
      standard: { gold: { xp: -5 } },
    });
    expect(out.standard.gold.xp).toBe(0);
  });

  it('drops unknown tier / resource keys', () => {
    const out = normalizeChests({
      standard: {
        gold: { xp: 3, garbage: 99 },
        purple: { xp: 1 },
      },
    });
    expect(out.standard.gold.xp).toBe(3);
    expect(out.standard.gold.garbage).toBeUndefined();
    expect(out.standard.purple.xp).toBe(1);
  });

  it('drops unsupported tiers for a type (R on leveled)', () => {
    const out = normalizeChests({
      leveled: { green: { xp: 9 } },
    });
    expect(out.leveled.green).toBeUndefined();
  });
});
