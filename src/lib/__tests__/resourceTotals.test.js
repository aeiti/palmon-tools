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
  LEVELED_ANCHOR_LEVEL,
  LEVELED_BASE_BY_TIER,
  LEVELED_SECONDARY_ANCHOR_LEVEL,
  LEVELED_SECONDARY_ANCHORS_BY_TIER,
} from '../data/chestValues.js';

describe('LEVELED_CHEST_VALUES', () => {
  it('matches the anchor base at the anchor level', () => {
    const row = LEVELED_CHEST_VALUES[LEVELED_ANCHOR_LEVEL];
    expect(row.gold).toEqual(LEVELED_BASE_BY_TIER.gold);
    expect(row.purple).toEqual(LEVELED_BASE_BY_TIER.purple);
    expect(row.blue).toEqual(LEVELED_BASE_BY_TIER.blue);
  });

  it('tapers to 50% at level 1', () => {
    const row = LEVELED_CHEST_VALUES[1];
    expect(row.gold.xp).toBe(
      Math.round(LEVELED_BASE_BY_TIER.gold.xp * 0.5),
    );
    expect(row.blue.electricity).toBe(
      Math.round(LEVELED_BASE_BY_TIER.blue.electricity * 0.5),
    );
  });

  it('interpolates linearly between L1 and L30 for resources without a mid anchor', () => {
    // gold.gold has no L26 secondary anchor, so it uses the single-segment taper.
    // Level 15: 0.5 + (14/29)*0.5 ≈ 0.7414 of anchor.
    const factor = 0.5 + (14 / 29) * 0.5;
    expect(LEVELED_CHEST_VALUES[15].gold.gold).toBe(
      Math.round(LEVELED_BASE_BY_TIER.gold.gold * factor),
    );
  });

  it('matches the L26 secondary anchor at level 26 for XP/Electricity', () => {
    const row = LEVELED_CHEST_VALUES[LEVELED_SECONDARY_ANCHOR_LEVEL];
    expect(row.gold.xp).toBe(LEVELED_SECONDARY_ANCHORS_BY_TIER.gold.xp);
    expect(row.gold.electricity).toBe(
      LEVELED_SECONDARY_ANCHORS_BY_TIER.gold.electricity,
    );
    expect(row.purple.electricity).toBe(
      LEVELED_SECONDARY_ANCHORS_BY_TIER.purple.electricity,
    );
    expect(row.blue.xp).toBe(LEVELED_SECONDARY_ANCHORS_BY_TIER.blue.xp);
  });

  it('piecewise-interpolates L26 → L30 for resources with a secondary anchor', () => {
    // Level 28 sits halfway between L26 (4.6M) and L30 (5.4M) for gold.xp.
    expect(LEVELED_CHEST_VALUES[28].gold.xp).toBe(
      Math.round(
        (LEVELED_SECONDARY_ANCHORS_BY_TIER.gold.xp +
          LEVELED_BASE_BY_TIER.gold.xp) /
          2,
      ),
    );
  });

  it('piecewise-interpolates L1 floor → L26 for resources with a secondary anchor', () => {
    // gold.electricity: L1 floor = 1M * 0.5 = 500k, L26 = 940k.
    const floor =
      LEVELED_BASE_BY_TIER.gold.electricity * 0.5;
    const t = (15 - 1) / (LEVELED_SECONDARY_ANCHOR_LEVEL - 1);
    const expected = Math.round(
      floor + t * (LEVELED_SECONDARY_ANCHORS_BY_TIER.gold.electricity - floor),
    );
    expect(LEVELED_CHEST_VALUES[15].gold.electricity).toBe(expected);
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
    expect(totals.xp).toBe(LEVELED_BASE_BY_TIER.gold.xp);
  });

  it('defaults to the anchor level when no level is given', () => {
    const chests = emptyChests();
    chests.leveled.gold.xp = 1;
    const noLevel = totalResourcesFromChests(chests);
    const anchored = totalResourcesFromChests(chests, LEVELED_ANCHOR_LEVEL);
    expect(noLevel).toEqual(anchored);
  });

  it('caps to the anchor level for higher player levels', () => {
    const chests = emptyChests();
    chests.leveled.gold.xp = 1;
    const at30 = totalResourcesFromChests(chests, 30);
    const at100 = totalResourcesFromChests(chests, 100);
    expect(at100).toEqual(at30);
  });

  it('uses the tapered values for levels below the anchor', () => {
    const chests = emptyChests();
    chests.leveled.gold.xp = 1;
    const at1 = totalResourcesFromChests(chests, 1);
    expect(at1.xp).toBe(Math.round(LEVELED_BASE_BY_TIER.gold.xp * 0.5));
  });

  it('combines standard and leveled contributions in one pass', () => {
    const chests = emptyChests();
    chests.standard.gold.gold = 1; // 3M gold
    chests.leveled.gold.gold = 1; // 4.2M gold at level 30
    const totals = totalResourcesFromChests(chests, 30);
    expect(totals.gold).toBe(3_000_000 + LEVELED_BASE_BY_TIER.gold.gold);
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
