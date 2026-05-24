import { describe, expect, it } from 'vitest';
import { emptyChests } from '../chests.js';
import {
  LEVELED_CHEST_VALUES,
  combinedResourceTotals,
  emptyOnHand,
  formatResourceAmount,
  formatResourceAmountFull,
  hasAnyOnHand,
  normalizeOnHand,
  totalResourcesFromChests,
} from '../resourceTotals.js';
import {
  LEVELED_ANCHOR_LEVEL,
  LEVELED_BASE_BY_TIER,
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

  it('interpolates linearly between levels 1 and 30', () => {
    // Level 15 should be roughly 0.5 + (14/29)*0.5 ≈ 0.7414 of anchor
    const factor = 0.5 + (14 / 29) * 0.5;
    expect(LEVELED_CHEST_VALUES[15].gold.xp).toBe(
      Math.round(LEVELED_BASE_BY_TIER.gold.xp * factor),
    );
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

describe('formatResourceAmount', () => {
  it('formats 0 as "0"', () => {
    expect(formatResourceAmount(0)).toBe('0');
  });

  it('formats invalid numbers as "0"', () => {
    expect(formatResourceAmount(NaN)).toBe('0');
    expect(formatResourceAmount(Infinity)).toBe('0');
  });

  it('uses K above 10,000', () => {
    expect(formatResourceAmount(12_300)).toBe('12.3K');
    expect(formatResourceAmount(99_900)).toBe('99.9K');
  });

  it('falls back to commas below 10,000', () => {
    expect(formatResourceAmount(9_999)).toBe('9,999');
  });

  it('uses M above 1,000,000', () => {
    expect(formatResourceAmount(5_400_000)).toBe('5.4M');
    expect(formatResourceAmount(1_000_000)).toBe('1M');
  });

  it('uses B above 1,000,000,000', () => {
    expect(formatResourceAmount(2_500_000_000)).toBe('2.5B');
  });

  it('drops trailing .0', () => {
    expect(formatResourceAmount(2_000_000)).toBe('2M');
    expect(formatResourceAmount(10_000)).toBe('10K');
  });
});

describe('formatResourceAmountFull', () => {
  it('uses comma-grouped digits', () => {
    expect(formatResourceAmountFull(1_234_567)).toBe('1,234,567');
  });

  it('handles 0 and nullish', () => {
    expect(formatResourceAmountFull(0)).toBe('0');
    expect(formatResourceAmountFull(null)).toBe('0');
    expect(formatResourceAmountFull(undefined)).toBe('0');
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
