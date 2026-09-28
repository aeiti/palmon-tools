// Raw skillfruit upgrade-cost observations.
//
// Shape: cost depends ONLY on the source level. It is NOT per-(species, slot).
//
// The previous header here asserted the opposite — that the same slot at the
// same source level "yields very different amounts across palmon", implying a
// 29-entry curve per (species, slot), i.e. a 6,728-cell table that was 2.2%
// filled. That was wrong. Grouping all 146 observations by fromLevel gives
// exactly one cost at every level, across 50 species and every slot. The real
// table is the 29-entry universal lookup below, and it is ~55% filled.
//
// The assertion rested on one outlier, { fulgairy, slot 2, fromLevel 1,
// cost 300 }, against 97 rows reading 100 at fromLevel 1. 300 is the cost at
// fromLevel 3 everywhere else, so either the level or the cost was mis-read.
// Which of the two is unknown, so the row is dropped rather than repaired —
// fromLevel 1 → 100 is independently attested 97 times and loses nothing.
// (Two notes elsewhere cited Ninjump and Regalion as further evidence for
// per-species variation; both recorded the wrong source level, so the two
// observations were never at the same level to begin with.)
// Owner-confirmed 2026-09-27.
//
// Each entry: { species, slot, fromLevel, cost }
//   - slot: 0-3 (matches PALMON_SKILLS[species] index)
//   - fromLevel: the skill level *before* the upgrade (cost shown is to go
//     from fromLevel → fromLevel + 1)
//   - cost: skillfruit amount required for that step
//
// Prefer PALMON_SKILL_UPGRADE_COST_BY_LEVEL for lookups. The observations are
// kept as the evidence the table is derived from, and as the place new
// captures land.

export const PALMON_SKILL_UPGRADE_COST_OBSERVATIONS = [
  { species: 'auktyke', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'auktyke', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'auktyke', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'axollium', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'axollium', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'axollium', slot: 2, fromLevel: 25, cost: 7000 },
  { species: 'bruiseberry', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'bruiseberry', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'bruiseberry', slot: 2, fromLevel: 20, cost: 4700 },
  { species: 'abuzzinian', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'abuzzinian', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'abuzzinian', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'battereina', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'battereina', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'battereina', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'blazeal', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'blazeal', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'blazeal', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'cerverdant', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'cerverdant', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'cerverdant', slot: 2, fromLevel: 25, cost: 7000 },
  { species: 'barkplug', slot: 0, fromLevel: 3, cost: 300 },
  { species: 'barkplug', slot: 1, fromLevel: 3, cost: 300 },
  { species: 'barkplug', slot: 2, fromLevel: 2, cost: 200 },
  { species: 'baboom', slot: 0, fromLevel: 2, cost: 200 },
  { species: 'baboom', slot: 1, fromLevel: 2, cost: 200 },
  { species: 'baboom', slot: 2, fromLevel: 6, cost: 800 },
  { species: 'dolphriend', slot: 0, fromLevel: 10, cost: 1700 },
  { species: 'dolphriend', slot: 1, fromLevel: 11, cost: 2000 },
  { species: 'dolphriend', slot: 2, fromLevel: 20, cost: 4700 },
  { species: 'emboa', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'emboa', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'emboa', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'escarffier', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'escarffier', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'escarffier', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'flouffant', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'flouffant', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'flouffant', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'fingenue', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'fingenue', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'fingenue', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'fulgairy', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'fulgairy', slot: 1, fromLevel: 1, cost: 100 },
  // { species: 'fulgairy', slot: 2, fromLevel: 1, cost: 300 } — dropped, see header.
  { species: 'ghillant', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'ghillant', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'ghillant', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'graffitty', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'graffitty', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'graffitty', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'hoofrit', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'hoofrit', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'hoofrit', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'lendanear', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'lendanear', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'lendanear', slot: 2, fromLevel: 25, cost: 7000 },
  { species: 'incineraptor', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'incineraptor', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'kilohopp', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'kilohopp', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'kilohopp', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'kungpaw', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'kungpaw', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'kungpaw', slot: 2, fromLevel: 20, cost: 4700 },
  { species: 'limudroid', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'limudroid', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'limudroid', slot: 2, fromLevel: 20, cost: 4700 },
  { species: 'gnashley', slot: 0, fromLevel: 15, cost: 3200 },
  { species: 'gnashley', slot: 1, fromLevel: 15, cost: 3200 },
  { species: 'lucidina', slot: 0, fromLevel: 11, cost: 2000 },
  { species: 'lucidina', slot: 1, fromLevel: 12, cost: 2300 },
  { species: 'lucidina', slot: 2, fromLevel: 15, cost: 3200 },
  { species: 'magmolin', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'magmolin', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'magmolin', slot: 2, fromLevel: 11, cost: 2000 },
  { species: 'mantleray', slot: 0, fromLevel: 5, cost: 600 },
  { species: 'mantleray', slot: 1, fromLevel: 5, cost: 600 },
  { species: 'mantleray', slot: 2, fromLevel: 4, cost: 400 },
  { species: 'maximito', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'maximito', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'maximito', slot: 2, fromLevel: 25, cost: 7000 },
  { species: 'meowdame', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'meowdame', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'meowdame', slot: 2, fromLevel: 15, cost: 3200 },
  { species: 'ninjump', slot: 0, fromLevel: 15, cost: 3200 },
  { species: 'ninjump', slot: 1, fromLevel: 22, cost: 5500 },
  { species: 'oleana', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'oleana', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'oleana', slot: 2, fromLevel: 10, cost: 1700 },
  { species: 'pipistrigoi', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'pipistrigoi', slot: 1, fromLevel: 5, cost: 600 },
  { species: 'pipistrigoi', slot: 2, fromLevel: 5, cost: 600 },
  { species: 'platyputz', slot: 0, fromLevel: 5, cost: 600 },
  { species: 'platyputz', slot: 1, fromLevel: 5, cost: 600 },
  { species: 'platyputz', slot: 2, fromLevel: 13, cost: 2600 },
  { species: 'plunderjaw', slot: 0, fromLevel: 15, cost: 3200 },
  { species: 'plunderjaw', slot: 1, fromLevel: 15, cost: 3200 },
  { species: 'plunderjaw', slot: 2, fromLevel: 20, cost: 4700 },
  { species: 'revontulet', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'revontulet', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'revontulet', slot: 2, fromLevel: 3, cost: 300 },
  { species: 'rotorlotor', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'rotorlotor', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'rotorlotor', slot: 2, fromLevel: 20, cost: 4700 },
  { species: 'salamantis', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'salamantis', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'salamantis', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'regalion', slot: 0, fromLevel: 6, cost: 800 },
  { species: 'regalion', slot: 1, fromLevel: 12, cost: 2300 },
  { species: 'statchew', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'statchew', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'statchew', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'snowkami', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'snowkami', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'snowkami', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'spinchilla', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'spinchilla', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'spinchilla', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'spookaboo', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'spookaboo', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'spookaboo', slot: 2, fromLevel: 20, cost: 4700 },
  { species: 'squeezel', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'squeezel', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'squeezel', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'surveilynx', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'surveilynx', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'surveilynx', slot: 2, fromLevel: 7, cost: 1000 },
  { species: 'voltbolt', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'voltbolt', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'voltbolt', slot: 2, fromLevel: 25, cost: 7000 },
  { species: 'vulcanid', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'vulcanid', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'vulcanid', slot: 2, fromLevel: 25, cost: 7000 },
  { species: 'terrastudo', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'terrastudo', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'terrastudo', slot: 2, fromLevel: 25, cost: 7000 },
  { species: 'thunderclawd', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'thunderclawd', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'thunderclawd', slot: 2, fromLevel: 20, cost: 4700 },
  { species: 'woozard', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'woozard', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'woozard', slot: 2, fromLevel: 1, cost: 100 },
  { species: 'wyvierno', slot: 0, fromLevel: 1, cost: 100 },
  { species: 'wyvierno', slot: 1, fromLevel: 1, cost: 100 },
  { species: 'wyvierno', slot: 2, fromLevel: 14, cost: 2900 },
];

// Skillfruit cost to go from `level` → `level + 1`. Universal: no species or
// slot dependence. All 29 steps, max skill level 30.
//
// 16 steps come from the observations above. The other 13 come from an in-game
// cost table transcribed in apex-showdown (`data/palmon_data.json`, `_meta
// .skill_fruit_cost_table`), which is keyed by the level REACHED and converted
// here to the level upgraded FROM. That table agrees with all 16 observations
// EXACTLY. The curve is irregular — 100, 200, 300, 400, 600, 800, 1000, 1200,
// 1400, 1700, … — so a 16-for-16 match is not coincidence; it establishes the
// artefact. The table independently states the cost is universal across skills
// and species, which is the same conclusion the observations reach.
//
// A missing key would mean unknown, never zero. There are none left.
export const PALMON_SKILL_UPGRADE_COST_BY_LEVEL = {
  1: 100,
  2: 200,
  3: 300,
  4: 400,
  5: 600,
  6: 800,
  7: 1000,
  8: 1200,
  9: 1400,
  10: 1700,
  11: 2000,
  12: 2300,
  13: 2600,
  14: 2900,
  15: 3200,
  16: 3500,
  17: 3800,
  18: 4100,
  19: 4400,
  20: 4700,
  21: 5000,
  22: 5500,
  23: 6000,
  24: 6500,
  25: 7000,
  26: 7500,
  27: 8000,
  28: 8500,
  29: 9000,
};

/** Skillfruit needed to take a skill from `fromLevel` to `fromLevel + 1`.
 *  Returns null when that step has not been captured yet. */
export function skillUpgradeCost(fromLevel) {
  const cost = PALMON_SKILL_UPGRADE_COST_BY_LEVEL[fromLevel];
  return cost === undefined ? null : cost;
}
