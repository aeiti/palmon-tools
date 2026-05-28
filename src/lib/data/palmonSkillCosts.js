// Raw skillfruit upgrade-cost observations.
//
// Confirmed shape: cost is per-(species, slot). Same slot at the same source
// level yields very different amounts across palmon. Each palmon's slot will
// have its own 29-entry cost curve once we've covered every level.
//
// Each entry: { species, slot, fromLevel, cost }
//   - slot: 0-3 (matches PALMON_SKILLS[species] index)
//   - fromLevel: the skill level *before* the upgrade (cost shown is to go
//     from fromLevel → fromLevel + 1)
//   - cost: skillfruit amount required for that step

export const PALMON_SKILL_UPGRADE_COST_OBSERVATIONS = [
  { species: 'barkplug', slot: 0, fromLevel: 3, cost: 300 },
  { species: 'barkplug', slot: 1, fromLevel: 3, cost: 300 },
  { species: 'barkplug', slot: 2, fromLevel: 2, cost: 200 },
  { species: 'baboom', slot: 0, fromLevel: 6, cost: 200 },
  { species: 'baboom', slot: 1, fromLevel: 6, cost: 200 },
  { species: 'baboom', slot: 2, fromLevel: 6, cost: 800 },
  { species: 'dolphriend', slot: 0, fromLevel: 10, cost: 1700 },
  { species: 'dolphriend', slot: 1, fromLevel: 10, cost: 2000 },
  { species: 'dolphriend', slot: 2, fromLevel: 7, cost: 4700 },
  { species: 'ghillant', slot: 0, fromLevel: 2, cost: 100 },
  { species: 'ghillant', slot: 1, fromLevel: 2, cost: 100 },
  { species: 'ghillant', slot: 2, fromLevel: 2, cost: 100 },
  { species: 'limudroid', slot: 0, fromLevel: 2, cost: 100 },
  { species: 'limudroid', slot: 1, fromLevel: 2, cost: 100 },
  { species: 'limudroid', slot: 2, fromLevel: 2, cost: 4700 },
  { species: 'gnashley', slot: 0, fromLevel: 10, cost: 3200 },
  { species: 'gnashley', slot: 1, fromLevel: 10, cost: 3200 },
  { species: 'lucidina', slot: 0, fromLevel: 9, cost: 2000 },
  { species: 'lucidina', slot: 1, fromLevel: 8, cost: 2300 },
  { species: 'lucidina', slot: 2, fromLevel: 5, cost: 3200 },
  { species: 'magmolin', slot: 0, fromLevel: 2, cost: 100 },
  { species: 'magmolin', slot: 1, fromLevel: 2, cost: 100 },
  { species: 'magmolin', slot: 2, fromLevel: 2, cost: 2000 },
  { species: 'mantleray', slot: 0, fromLevel: 5, cost: 600 },
  { species: 'mantleray', slot: 1, fromLevel: 5, cost: 600 },
  { species: 'mantleray', slot: 2, fromLevel: 4, cost: 400 },
  { species: 'ninjump', slot: 0, fromLevel: 10, cost: 3200 },
  { species: 'ninjump', slot: 1, fromLevel: 6, cost: 5500 },
  { species: 'plunderjaw', slot: 0, fromLevel: 15, cost: 3200 },
  { species: 'plunderjaw', slot: 1, fromLevel: 15, cost: 3200 },
  { species: 'plunderjaw', slot: 2, fromLevel: 20, cost: 4700 },
  { species: 'salamantis', slot: 0, fromLevel: 2, cost: 100 },
  { species: 'salamantis', slot: 1, fromLevel: 2, cost: 100 },
  { species: 'salamantis', slot: 2, fromLevel: 2, cost: 100 },
  { species: 'regalion', slot: 0, fromLevel: 10, cost: 800 },
  { species: 'regalion', slot: 1, fromLevel: 10, cost: 2300 },
  { species: 'statchew', slot: 0, fromLevel: 2, cost: 100 },
  { species: 'statchew', slot: 1, fromLevel: 2, cost: 100 },
  { species: 'statchew', slot: 2, fromLevel: 2, cost: 100 },
  { species: 'spookaboo', slot: 0, fromLevel: 2, cost: 100 },
  { species: 'spookaboo', slot: 1, fromLevel: 2, cost: 100 },
  { species: 'spookaboo', slot: 2, fromLevel: 2, cost: 4700 },
  { species: 'surveilynx', slot: 0, fromLevel: 2, cost: 100 },
  { species: 'surveilynx', slot: 1, fromLevel: 2, cost: 100 },
  { species: 'surveilynx', slot: 2, fromLevel: 7, cost: 1000 },
  { species: 'woozard', slot: 0, fromLevel: 2, cost: 100 },
  { species: 'woozard', slot: 1, fromLevel: 2, cost: 100 },
  { species: 'woozard', slot: 2, fromLevel: 2, cost: 100 },
];
