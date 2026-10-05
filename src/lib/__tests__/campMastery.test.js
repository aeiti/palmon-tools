import { describe, expect, it } from 'vitest';
import {
  chestWorth,
  costBoughtBetween,
  currentStepIndex,
  emptyMastery,
  hoursToAfford,
  masteryChestValues,
  measureRates,
  normalizeMastery,
  normalizeMasteryEntry,
  projectionBasis,
  projectSteps,
  setCurrentStep,
  uniformRate,
} from '../campMastery.js';
import { MASTERY_STEPS } from '../data/campMastery.js';
import { leveledValuesWithOverrides } from '../resourceTotals.js';

const M = 1_000_000;
const STEP = Object.fromEntries(MASTERY_STEPS.map((s) => [s.key, s]));

function entry(at, gold, lumber = gold, steel = gold, id = at) {
  return { id, at, gold, lumber, steel, note: '' };
}

describe('MASTERY_STEPS', () => {
  it('has 25 steps with unique keys, 30-1 through 35', () => {
    expect(MASTERY_STEPS).toHaveLength(25);
    expect(new Set(MASTERY_STEPS.map((s) => s.key)).size).toBe(25);
    expect(MASTERY_STEPS[0].key).toBe('30-1');
    expect(MASTERY_STEPS.at(-1).key).toBe('35');
  });

  it('holds the 31-4 cost read from the game', () => {
    expect(STEP['31-4'].cost).toEqual({
      gold: 1900 * M,
      lumber: 1600 * M,
      steel: 1600 * M,
    });
  });
});

describe('normalizeMasteryEntry', () => {
  it('drops entries without a usable timestamp', () => {
    expect(normalizeMasteryEntry(null)).toBeNull();
    expect(normalizeMasteryEntry({ gold: 5 })).toBeNull();
    expect(normalizeMasteryEntry({ at: 'not a date', gold: 5 })).toBeNull();
  });

  it('floors amounts and zeroes negatives / garbage', () => {
    const e = normalizeMasteryEntry({
      id: 'a',
      at: '2026-10-03T09:34:00Z',
      gold: 1.9,
      lumber: -4,
      steel: 'x',
    });
    expect(e).toMatchObject({ id: 'a', gold: 1, lumber: 0, steel: 0, note: '' });
  });

  it('keeps recorded chest counts and nulls the ones not recorded', () => {
    const e = normalizeMasteryEntry({
      at: '2026-10-03T09:34:00Z',
      chests: { 'sr-choice-chest': 319, 'ur-choice-chest': 0, 'bogus': 4 },
    });
    expect(e.chests['sr-choice-chest']).toBe(319);
    expect(e.chests['ur-choice-chest']).toBe(0);
    expect(e.chests['ssr-choice-chest']).toBeNull();
    expect('bogus' in e.chests).toBe(false);
  });
});

describe('normalizeMastery', () => {
  it('returns the empty shape for garbage', () => {
    expect(normalizeMastery(undefined)).toEqual(emptyMastery());
    expect(normalizeMastery('x')).toEqual(emptyMastery());
  });

  it('sorts the log oldest first and dedupes by id', () => {
    const out = normalizeMastery({
      log: [
        entry('2026-10-03T09:34:00.000Z', 2, 2, 2, 'b'),
        entry('2026-10-02T21:30:00.000Z', 1, 1, 1, 'a'),
        entry('2026-10-04T00:00:00.000Z', 3, 3, 3, 'b'),
        { at: 'bad' },
      ],
    });
    expect(out.log.map((e) => e.id)).toEqual(['a', 'b']);
    expect(out.log[1].gold).toBe(2);
  });

  it('keeps known completed keys with a date or null, drops unknown keys', () => {
    const out = normalizeMastery({
      completed: { '30-1': null, '31-4': '2026-10-12T10:00:00Z', '99-9': null },
    });
    expect(out.completed).toEqual({
      '30-1': null,
      '31-4': '2026-10-12T10:00:00.000Z',
    });
  });

  it('round-trips', () => {
    const once = normalizeMastery({
      log: [entry('2026-10-02T21:30:00Z', 10 * M)],
      completed: { '30-1': null },
      planningRate: 2 * M,
    });
    expect(normalizeMastery(once)).toEqual(once);
  });
});

describe('currentStepIndex / setCurrentStep', () => {
  it('is the first step without a completion record', () => {
    expect(currentStepIndex({})).toBe(0);
    expect(currentStepIndex({ '30-1': null, '30-2': null })).toBe(2);
  });

  it('is the ladder length when everything is done', () => {
    const all = Object.fromEntries(MASTERY_STEPS.map((s) => [s.key, null]));
    expect(currentStepIndex(all)).toBe(MASTERY_STEPS.length);
  });

  it('marks earlier steps done, keeping recorded dates, and clears later ones', () => {
    const next = setCurrentStep(
      { '30-1': '2026-10-01T00:00:00.000Z', '32': null },
      '31-4',
    );
    expect(next['30-1']).toBe('2026-10-01T00:00:00.000Z');
    expect(next['31-3']).toBeNull();
    expect('31-4' in next).toBe(false);
    expect('32' in next).toBe(false);
    expect(MASTERY_STEPS[currentStepIndex(next)].key).toBe('31-4');
  });
});

describe('costBoughtBetween', () => {
  const from = Date.parse('2026-10-02T21:30:00Z');
  const to = Date.parse('2026-10-05T00:00:00Z');

  it('counts only steps bought inside the window', () => {
    const total = costBoughtBetween(
      {
        '31-2': null, // before tracking, date unknown
        '31-3': '2026-10-01T00:00:00Z', // before the window
        '31-4': '2026-10-04T00:00:00Z', // inside
        '32': '2026-10-06T00:00:00Z', // after
      },
      from,
      to,
    );
    expect(total).toEqual(STEP['31-4'].cost);
  });
});

describe('measureRates', () => {
  // Aeiti's first two readings, which the spreadsheet measured at a combined
  // 12,298,343/hr.
  const log = [
    entry('2026-10-02T21:30:00Z', 10 * M),
    { ...entry('2026-10-03T09:34:00Z', 0), gold: 63.8 * M, lumber: 59.1 * M, steel: 55.5 * M },
  ];

  it('is null with fewer than two entries', () => {
    expect(measureRates([], {}).average).toBeNull();
    expect(measureRates(log.slice(0, 1), {}).average).toBeNull();
  });

  it('matches the spreadsheet average', () => {
    const { average, hours } = measureRates(log, {});
    expect(hours).toBeCloseTo(12 + 4 / 60, 6);
    const combined = average.gold + average.lumber + average.steel;
    expect(Math.round(combined)).toBe(12_298_343);
  });

  it('adds back a step bought between the entries', () => {
    const before = measureRates(
      [entry('2026-10-04T00:00:00Z', 2000 * M), entry('2026-10-04T10:00:00Z', 140 * M)],
      {},
    );
    const after = measureRates(
      [entry('2026-10-04T00:00:00Z', 2000 * M), entry('2026-10-04T10:00:00Z', 140 * M)],
      { '31-4': '2026-10-04T05:00:00Z' },
    );
    expect(before.average.gold).toBeLessThan(0);
    // (140M − 2000M + 1900M) / 10h = 4M/h
    expect(after.average.gold).toBeCloseTo(4 * M, 3);
  });

  it('measures recent over the last `window` intervals only', () => {
    const rising = [
      entry('2026-10-01T00:00:00Z', 0),
      entry('2026-10-01T01:00:00Z', 100 * M), // fast early interval
      entry('2026-10-01T02:00:00Z', 101 * M),
      entry('2026-10-01T03:00:00Z', 102 * M),
    ];
    const { average, recent } = measureRates(rising, {}, 2);
    expect(average.gold).toBeCloseTo(34 * M, 3);
    expect(recent.gold).toBeCloseTo(1 * M, 3);
  });
});

describe('masteryChestValues', () => {
  it('values choice chests like leveled chests of the same tier', () => {
    const values = masteryChestValues(leveledValuesWithOverrides(30));
    expect(values['sr-choice-chest']).toBe(175_000);
    expect(values['ssr-choice-chest']).toBe(1_400_000);
    expect(values['ur-choice-chest']).toBe(4_200_000);
    expect(values['master-awakening-bundle']).toBe(5 * M);
    expect(values['master-rank-supply-chest']).toBe(300_000);
  });
});

describe('chestWorth', () => {
  it('pools choice chests and splits random chests evenly', () => {
    const values = { 'sr-choice-chest': 100, 'master-awakening-bundle': 1000, 'master-rank-supply-chest': 30 };
    const worth = chestWorth(
      { 'sr-choice-chest': 2, 'master-awakening-bundle': 1, 'master-rank-supply-chest': 3, 'ur-choice-chest': null },
      values,
    );
    expect(worth.flexible).toBe(1200);
    expect(worth.fixed).toEqual({ gold: 30, lumber: 30, steel: 30 });
  });
});

describe('measureRates with chests', () => {
  const values = { 'master-awakening-bundle': 5 * M, 'master-rank-supply-chest': 300_000 };
  const at = (h) => new Date(Date.UTC(2026, 9, 4, h)).toISOString();

  it('does not count opened chests as income', () => {
    // Opened 10 bundles as gold between readings: gold +50M, bundles −10.
    const log = [
      { ...entry(at(0), 100 * M), chests: { 'master-awakening-bundle': 20 } },
      { ...entry(at(10), 100 * M), gold: 150 * M, chests: { 'master-awakening-bundle': 10 } },
    ];
    const { average } = measureRates(log, {}, 3, values);
    expect(average.gold).toBeCloseTo(5 * M, 3);
    expect(average.flexible).toBeCloseTo(-5 * M, 3);
    const total = average.gold + average.lumber + average.steel + average.flexible;
    expect(total).toBeCloseTo(0, 3);
  });

  it('counts chests earned between readings as income', () => {
    const log = [
      { ...entry(at(0), 0), chests: { 'master-rank-supply-chest': 0 } },
      { ...entry(at(1), 0), chests: { 'master-rank-supply-chest': 10 } },
    ];
    const { average } = measureRates(log, {}, 3, values);
    expect(average.gold).toBeCloseTo(1 * M, 3);
    expect(average.steel).toBeCloseTo(1 * M, 3);
  });

  it('ignores a chest type one of the readings did not record', () => {
    const log = [
      { ...entry(at(0), 0), chests: { 'master-awakening-bundle': null } },
      { ...entry(at(1), 0), chests: { 'master-awakening-bundle': 100 } },
    ];
    expect(measureRates(log, {}, 3, values).average.flexible).toBe(0);
  });
});

describe('hoursToAfford', () => {
  it('is zero when the pool already covers every shortfall', () => {
    const res = hoursToAfford({ gold: 3, lumber: 2, steel: 0 }, uniformRate(1), 5);
    expect(res.hours).toBe(0);
    expect(res.allocation).toEqual({ gold: 3, lumber: 2, steel: 0 });
  });

  it('without a pool, waits on the slowest resource', () => {
    const res = hoursToAfford(
      { gold: 100, lumber: 50, steel: 10 },
      { gold: 10, lumber: 10, steel: 10 },
    );
    expect(res.hours).toBeCloseTo(10, 6);
  });

  it('spends the pool on the bottleneck until finishes line up', () => {
    // gold needs 100 at 10/h (10h), lumber 50 at 10/h (5h). A pool of 40
    // brings gold to 60 → 6h; then lumber (5h) is not the bottleneck, so all
    // 40 goes to gold.
    const res = hoursToAfford(
      { gold: 100, lumber: 50, steel: 0 },
      { gold: 10, lumber: 10, steel: 10 },
      40,
    );
    expect(res.hours).toBeCloseTo(6, 6);
    expect(res.allocation.gold).toBeCloseTo(40, 6);
    expect(res.allocation.lumber).toBeCloseTo(0, 6);

    // A pool of 80 pushes both down to the same moment: 100−10T + 50−10T = 80
    // → T = 3.5h.
    const both = hoursToAfford(
      { gold: 100, lumber: 50, steel: 0 },
      { gold: 10, lumber: 10, steel: 10 },
      80,
    );
    expect(both.hours).toBeCloseTo(3.5, 6);
    expect(both.allocation.gold).toBeCloseTo(65, 4);
    expect(both.allocation.lumber).toBeCloseTo(15, 4);
  });

  it('lets a growing pool cover a resource with no income', () => {
    // steel needs 100 with no income; the pool earns 10/h → 10h.
    const res = hoursToAfford(
      { gold: 0, lumber: 0, steel: 100 },
      { gold: 10, lumber: 10, steel: 0, flexible: 10 },
      0,
    );
    expect(res.hours).toBeCloseTo(10, 6);
  });

  it('folds a negative pool rate into the resource rates', () => {
    // Opening chests: gold reads +20/h but the pool drains 10/h, so the
    // real gold income is 10/h → 100 takes 10h.
    const res = hoursToAfford(
      { gold: 100, lumber: 0, steel: 0 },
      { gold: 20, lumber: 0, steel: 0, flexible: -10 },
      0,
    );
    expect(res.hours).toBeCloseTo(10, 6);
  });

  it('is Infinity when a resource has no income and the pool cannot cover it', () => {
    const res = hoursToAfford(
      { gold: 100, lumber: 0, steel: 0 },
      { gold: 0, lumber: 10, steel: 10 },
      50,
    );
    expect(res.hours).toBe(Infinity);
  });
});

describe('projectSteps', () => {
  it('accumulates cost from the current step onward', () => {
    const completed = setCurrentStep({}, '31-4');
    const rows = projectSteps({
      completed,
      stock: { gold: 0, lumber: 0, steel: 0 },
      pool: { fixed: { gold: 0, lumber: 0, steel: 0 }, flexible: 0 },
      rates: { planning: uniformRate(100 * M), average: null },
    });
    expect(rows[0].step.key).toBe('31-4');
    expect(rows[1].cumulative.gold).toBe(1900 * M + 2300 * M);
    // 31-4 at 100M/h: gold 1900M is the bottleneck → 19h.
    expect(rows[0].hours.planning).toBeCloseTo(19, 6);
    expect(rows[0].hours.average).toBeNull();
  });

  it('subtracts stock and fixed chests before projecting', () => {
    const rows = projectSteps({
      completed: setCurrentStep({}, '31-4'),
      stock: { gold: 1000 * M, lumber: 1600 * M, steel: 1600 * M },
      pool: { fixed: { gold: 500 * M, lumber: 0, steel: 0 }, flexible: 400 * M },
      rates: { planning: uniformRate(1 * M) },
    });
    expect(rows[0].need).toEqual({ gold: 400 * M, lumber: 0, steel: 0 });
    expect(rows[0].affordableNow).toBe(true);
    expect(rows[0].hours.planning).toBe(0);
    expect(rows[1].affordableNow).toBe(false);
  });
});

describe('projectionBasis', () => {
  it('uses the latest log entry when there is one', () => {
    const basis = projectionBasis(
      [entry('2026-10-03T09:34:00Z', 5), entry('2026-10-02T21:30:00Z', 1)],
      { gold: 999 },
      { 'sr-choice-chest': 7 },
      0,
    );
    expect(basis.at).toBe(Date.parse('2026-10-03T09:34:00Z'));
    expect(basis.stock.gold).toBe(5);
    // the entry didn't record chests, so Other Inventory fills in
    expect(basis.chests['sr-choice-chest']).toBe(7);
  });

  it('prefers the latest entry\'s chest counts', () => {
    const basis = projectionBasis(
      [{ ...entry('2026-10-03T09:34:00Z', 5), chests: { 'sr-choice-chest': 3 } }],
      {},
      { 'sr-choice-chest': 7 },
      0,
    );
    expect(basis.chests['sr-choice-chest']).toBe(3);
  });

  it('falls back to on-hand stock as of now', () => {
    const basis = projectionBasis([], { gold: 7, lumber: 8, steel: 9 }, {}, 123);
    expect(basis.at).toBe(123);
    expect(basis.stock).toEqual({ gold: 7, lumber: 8, steel: 9 });
  });
});
