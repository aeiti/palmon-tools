import { describe, expect, it } from 'vitest';
import { emptyChests } from '../chests.js';
import {
  LEVELED_CHEST_VALUES,
  combinedResourceTotals,
  emptyLeveledOverrides,
  emptyOnHand,
  formatResourceAmount,
  formatResourceAmountFull,
  hasAnyLeveledOverrides,
  hasAnyOnHand,
  leveledValuesWithOverrides,
  normalizeLeveledOverrides,
  normalizeOnHand,
  totalResourcesFromChests,
} from '../resourceTotals.js';
import {
  LEVELED_CHEST_VALUES as LEVELED_VALUES_SOURCE,
  LEVELED_MAX_LEVEL,
  LEVELED_MIN_LEVEL,
} from '../data/chestValues.js';

describe('LEVELED_CHEST_VALUES', () => {
  it('exposes a row for every player level from MIN to MAX', () => {
    for (let L = LEVELED_MIN_LEVEL; L <= LEVELED_MAX_LEVEL; L++) {
      expect(LEVELED_CHEST_VALUES[L]).toBeDefined();
      expect(LEVELED_CHEST_VALUES[L].gold).toBeDefined();
      expect(LEVELED_CHEST_VALUES[L].purple).toBeDefined();
      expect(LEVELED_CHEST_VALUES[L].blue).toBeDefined();
    }
  });

  it('exposes every resource per tier per level', () => {
    const resources = ['xp', 'electricity', 'gold', 'lumber', 'steel'];
    const tiers = ['gold', 'purple', 'blue'];
    for (let L = LEVELED_MIN_LEVEL; L <= LEVELED_MAX_LEVEL; L++) {
      for (const tier of tiers) {
        for (const r of resources) {
          expect(typeof LEVELED_CHEST_VALUES[L][tier][r]).toBe('number');
        }
      }
    }
  });

  it('mirrors the source data shape (tier -> resource -> {level: amount})', () => {
    // Each cell in the runtime row should match the matching source cell.
    for (let L = LEVELED_MIN_LEVEL; L <= LEVELED_MAX_LEVEL; L++) {
      for (const [tier, resources] of Object.entries(LEVELED_VALUES_SOURCE)) {
        for (const [resource, byLevel] of Object.entries(resources)) {
          expect(LEVELED_CHEST_VALUES[L][tier][resource]).toBe(byLevel[L]);
        }
      }
    }
  });

  it('matches known L30 anchor values', () => {
    // These are the in-game-observed values that seeded the LUT. They are
    // load-bearing — if you change them in chestValues.js, update here too.
    expect(LEVELED_CHEST_VALUES[30].gold.xp).toBe(5_400_000);
    expect(LEVELED_CHEST_VALUES[30].gold.electricity).toBe(1_000_000);
    expect(LEVELED_CHEST_VALUES[30].gold.gold).toBe(4_200_000);
    expect(LEVELED_CHEST_VALUES[30].purple.xp).toBe(1_800_000);
    expect(LEVELED_CHEST_VALUES[30].blue.xp).toBe(225_000);
  });

  it('matches known L26 anchor values for XP and Electricity', () => {
    expect(LEVELED_CHEST_VALUES[26].gold.xp).toBe(4_600_000);
    expect(LEVELED_CHEST_VALUES[26].gold.electricity).toBe(940_000);
    expect(LEVELED_CHEST_VALUES[26].purple.electricity).toBe(310_000);
    expect(LEVELED_CHEST_VALUES[26].blue.xp).toBe(195_000);
  });
});

describe('totalResourcesFromChests', () => {
  it('returns all-zero totals for empty input', () => {
    expect(totalResourcesFromChests(null)).toEqual({
      xp: 0,
      electricity: 0,
      gold: 0,
      lumber: 0,
      steel: 0,
    });
    expect(totalResourcesFromChests(emptyChests())).toEqual({
      xp: 0,
      electricity: 0,
      gold: 0,
      lumber: 0,
      steel: 0,
    });
  });

  it('multiplies standard counts by the standard tier amounts', () => {
    const chests = emptyChests();
    chests.standard.gold.xp = 2; // UR = 3M each → 6M
    chests.standard.purple.gold = 3; // SSR = 1M each → 3M
    chests.standard.blue.electricity = 10; // SR = 100K each → 1M
    chests.standard.green.steel = 5; // R = 10K each → 50K
    const totals = totalResourcesFromChests(chests);
    expect(totals.xp).toBe(6_000_000);
    expect(totals.gold).toBe(3_000_000);
    expect(totals.electricity).toBe(1_000_000);
    expect(totals.steel).toBe(50_000);
  });

  it('uses the leveled values for the given player level', () => {
    const chests = emptyChests();
    chests.leveled.gold.xp = 1;
    const totals = totalResourcesFromChests(chests, 30);
    expect(totals.xp).toBe(LEVELED_CHEST_VALUES[30].gold.xp);
  });

  it('defaults to the top level when no level is given', () => {
    const chests = emptyChests();
    chests.leveled.gold.xp = 1;
    const noLevel = totalResourcesFromChests(chests);
    const topLevel = totalResourcesFromChests(chests, LEVELED_MAX_LEVEL);
    expect(noLevel).toEqual(topLevel);
  });

  it('caps to the top level for higher player levels', () => {
    const chests = emptyChests();
    chests.leveled.gold.xp = 1;
    const at30 = totalResourcesFromChests(chests, 30);
    const at100 = totalResourcesFromChests(chests, 100);
    expect(at100).toEqual(at30);
  });

  it('uses the L1 row for levels at or below the floor', () => {
    const chests = emptyChests();
    chests.leveled.gold.xp = 1;
    const at1 = totalResourcesFromChests(chests, 1);
    expect(at1.xp).toBe(LEVELED_CHEST_VALUES[1].gold.xp);
  });

  it('combines standard and leveled contributions in one pass', () => {
    const chests = emptyChests();
    chests.standard.gold.gold = 1; // 3M gold
    chests.leveled.gold.gold = 1; // L30 leveled gold-tier gold chest value
    const totals = totalResourcesFromChests(chests, 30);
    expect(totals.gold).toBe(3_000_000 + LEVELED_CHEST_VALUES[30].gold.gold);
  });
});

// formatResourceAmount + formatResourceAmountFull are now re-exports of the
// shared compact formatters in src/lib/format.js (see format.test.js for the
// full coverage). Smoke-test the re-export so we notice if the alias ever
// drifts from the underlying behavior.
describe('formatResourceAmount (re-export of formatCompact)', () => {
  it('forwards K/M/B formatting', () => {
    expect(formatResourceAmount(0)).toBe('0');
    expect(formatResourceAmount(1_500)).toBe('1.5K');
    expect(formatResourceAmount(5_400_000)).toBe('5.4M');
    expect(formatResourceAmount(2_500_000_000)).toBe('2.5B');
  });
});

describe('formatResourceAmountFull (re-export of formatCompactFull)', () => {
  it('forwards comma-grouped full digits', () => {
    expect(formatResourceAmountFull(1_234_567)).toBe('1,234,567');
    expect(formatResourceAmountFull(null)).toBe('0');
  });
});

describe('emptyOnHand', () => {
  it('returns an object with every resource at 0', () => {
    expect(emptyOnHand()).toEqual({
      xp: 0,
      electricity: 0,
      gold: 0,
      lumber: 0,
      steel: 0,
    });
  });
});

describe('normalizeOnHand', () => {
  it('returns all-zero for null / non-object input', () => {
    expect(normalizeOnHand(null)).toEqual(emptyOnHand());
    expect(normalizeOnHand('garbage')).toEqual(emptyOnHand());
  });

  it('keeps valid counts and floors fractional values', () => {
    expect(normalizeOnHand({ xp: 1234.7 })).toEqual({
      ...emptyOnHand(),
      xp: 1234,
    });
  });

  it('coerces negatives to 0', () => {
    expect(normalizeOnHand({ gold: -5 })).toEqual(emptyOnHand());
  });

  it('drops unknown resource keys', () => {
    const out = normalizeOnHand({ xp: 10, garbage: 99 });
    expect(out.xp).toBe(10);
    expect(out.garbage).toBeUndefined();
  });
});

describe('hasAnyOnHand', () => {
  it('returns false for null / empty', () => {
    expect(hasAnyOnHand(null)).toBe(false);
    expect(hasAnyOnHand(emptyOnHand())).toBe(false);
  });

  it('returns true once any resource has a nonzero amount', () => {
    expect(hasAnyOnHand({ ...emptyOnHand(), gold: 1 })).toBe(true);
  });
});

describe('leveled chest value overrides', () => {
  it('emptyLeveledOverrides has every tier × field at 0', () => {
    const o = emptyLeveledOverrides();
    expect(o.gold).toEqual({ xp: 0, electricity: 0, ore: 0 });
    expect(o.purple).toEqual({ xp: 0, electricity: 0, ore: 0 });
    expect(o.blue).toEqual({ xp: 0, electricity: 0, ore: 0 });
  });

  it('normalizeLeveledOverrides floors fractional values and clamps negatives to 0', () => {
    const o = normalizeLeveledOverrides({
      gold: { xp: 1234.7, electricity: -5, ore: '900000' },
      purple: { xp: 'garbage' },
    });
    expect(o.gold.xp).toBe(1234);
    expect(o.gold.electricity).toBe(0);
    expect(o.gold.ore).toBe(900000);
    expect(o.purple.xp).toBe(0);
    expect(o.blue).toEqual({ xp: 0, electricity: 0, ore: 0 });
  });

  it('normalizeLeveledOverrides drops unknown tiers and fields', () => {
    const o = normalizeLeveledOverrides({
      green: { xp: 1 },
      gold: { xp: 1, junk: 9 },
    });
    expect(o.green).toBeUndefined();
    expect(o.gold.junk).toBeUndefined();
    expect(o.gold.xp).toBe(1);
  });

  it('hasAnyLeveledOverrides flips once any cell is set', () => {
    expect(hasAnyLeveledOverrides(null)).toBe(false);
    expect(hasAnyLeveledOverrides(emptyLeveledOverrides())).toBe(false);
    const o = emptyLeveledOverrides();
    o.purple.electricity = 1;
    expect(hasAnyLeveledOverrides(o)).toBe(true);
  });

  it('leveledValuesWithOverrides returns the modeled row when no overrides', () => {
    expect(leveledValuesWithOverrides(30, null)).toEqual(
      LEVELED_CHEST_VALUES[30],
    );
    expect(leveledValuesWithOverrides(30, emptyLeveledOverrides())).toEqual(
      LEVELED_CHEST_VALUES[30],
    );
  });

  it('leveledValuesWithOverrides applies overrides on top of the model', () => {
    const o = emptyLeveledOverrides();
    o.gold.xp = 9_999_999;
    o.purple.ore = 1_234_567;
    const row = leveledValuesWithOverrides(30, o);
    expect(row.gold.xp).toBe(9_999_999);
    // Electricity untouched — still the model value
    expect(row.gold.electricity).toBe(LEVELED_CHEST_VALUES[30].gold.electricity);
    // "ore" override applies to gold/lumber/steel uniformly
    expect(row.purple.gold).toBe(1_234_567);
    expect(row.purple.lumber).toBe(1_234_567);
    expect(row.purple.steel).toBe(1_234_567);
    // SR tier untouched
    expect(row.blue).toEqual(LEVELED_CHEST_VALUES[30].blue);
  });

  it('totalResourcesFromChests uses overrides when computing totals', () => {
    const chests = emptyChests();
    chests.leveled.gold.xp = 2;
    chests.leveled.gold.lumber = 3;
    const o = emptyLeveledOverrides();
    o.gold.xp = 10_000_000;
    o.gold.ore = 1_000_000;
    const totals = totalResourcesFromChests(chests, 30, o);
    expect(totals.xp).toBe(2 * 10_000_000);
    expect(totals.lumber).toBe(3 * 1_000_000);
  });

  it('overrides do not affect standard chests', () => {
    const chests = emptyChests();
    chests.standard.gold.xp = 1;
    const o = emptyLeveledOverrides();
    o.gold.xp = 999;
    const totals = totalResourcesFromChests(chests, 30, o);
    expect(totals.xp).toBe(3_000_000);
  });
});

describe('combinedResourceTotals', () => {
  it('returns just on-hand when chests are empty', () => {
    const onHand = { ...emptyOnHand(), gold: 500 };
    expect(combinedResourceTotals(null, 30, onHand)).toEqual({
      ...emptyOnHand(),
      gold: 500,
    });
  });

  it('returns just chest totals when on-hand is empty', () => {
    const chests = emptyChests();
    chests.standard.gold.xp = 1; // 3M
    expect(combinedResourceTotals(chests, 30, null)).toEqual({
      ...emptyOnHand(),
      xp: 3_000_000,
    });
  });

  it('sums on-hand and chest totals per resource', () => {
    const chests = emptyChests();
    chests.standard.gold.gold = 1; // 3M gold
    const onHand = { ...emptyOnHand(), gold: 500_000, xp: 1_000 };
    const out = combinedResourceTotals(chests, 30, onHand);
    expect(out.gold).toBe(3_000_000 + 500_000);
    expect(out.xp).toBe(1_000);
  });
});
