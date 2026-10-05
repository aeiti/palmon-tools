// Camp Mastery upgrade ladder. Pure data — edit this file when in-game costs
// change. The projection math lives in src/lib/campMastery.js.
//
// Past Camp level 30 the Camp no longer levels normally: it climbs a mastery
// ladder of four sub-steps (30-1 … 30-4) followed by a mastery rank (31 =
// Mastery 1), then 31-1 … 31-4 → 32 (Mastery 2), and so on to 35.
//
// Source: costs read from the in-game upgrade screen by Aeiti (server 106),
// October 2026. Values are as the game displays them — rounded to the shown
// precision (e.g. "1.9B"), not exact.
//
// Keys are append-only: they are stored in each profile's `mastery.completed`
// map, so renaming one strands that record.

const M = 1_000_000;

function step(key, label, gold, lumber, steel) {
  return { key, label, cost: { gold: gold * M, lumber: lumber * M, steel: steel * M } };
}

// prettier-ignore
export const MASTERY_STEPS = [
  step('30-1', '30-1',            594,  563,  563),
  step('30-2', '30-2',            892,  854,  854),
  step('30-3', '30-3',           1100, 1100, 1100),
  step('30-4', '30-4',           1300, 1300, 1300),
  step('31',   '31 (Mastery 1)', 1700, 1600, 1600),
  step('31-1', '31-1',            773,  733,  733),
  step('31-2', '31-2',           1100, 1000, 1000),
  step('31-3', '31-3',           1500, 1400, 1400),
  step('31-4', '31-4',           1900, 1600, 1600),
  step('32',   '32 (Mastery 2)', 2300, 2100, 2100),
  step('32-1', '32-1',           1000,  953,  953),
  step('32-2', '32-2',           1500, 1400, 1400),
  step('32-3', '32-3',           2000, 1900, 1900),
  step('32-4', '32-4',           2500, 2300, 2300),
  step('33',   '33 (Mastery 3)', 3000, 2800, 2800),
  step('33-1', '33-1',           1200, 1100, 1100),
  step('33-2', '33-2',           1800, 1700, 1700),
  step('33-3', '33-3',           2500, 2300, 2300),
  step('33-4', '33-4',           3100, 2900, 2900),
  step('34',   '34 (Mastery 4)', 3700, 3500, 3500),
  step('34-1', '34-1',           1400, 1300, 1300),
  step('34-2', '34-2',           2100, 2000, 2000),
  step('34-3', '34-3',           2800, 2700, 2700),
  step('34-4', '34-4',           3600, 3400, 3400),
  step('35',   '35 (Mastery 5)', 4300, 4100, 4100),
];

export const MASTERY_STEP_KEYS = MASTERY_STEPS.map((s) => s.key);

// The three resources every mastery step costs.
export const MASTERY_RESOURCES = ['gold', 'lumber', 'steel'];

// Resource bundles that pay out mastery resources. Counts live in Other
// Inventory (see OTHER_ITEMS); these are the per-item values.
//
// - Master Awakening Bundle: the in-game description offers 5M of gold,
//   lumber OR steel (or 50 five-minute building speedups). The player picks,
//   so it is modelled as a flexible pool.
// - Master Rank Supply Chest: random resource. ~300K per chest is the
//   player's estimate and NOT confirmed — it may be 300K of each. Modelled as
//   300K total, split evenly across the three resources.
export const MASTERY_BUNDLES = {
  awakening: { otherKey: 'master-awakening-bundle', value: 5 * M, kind: 'choice' },
  supply: { otherKey: 'master-rank-supply-chest', value: 300_000, kind: 'random' },
};
