// Per-palmon catalog of the four 1-30 skills.
//
// Keyed by base species key (see PALMON_SPECIES in palmon.js). Each value
// is an array of up to 4 skill entries, in the order the in-game UI presents
// them (top-left, top-right, lower-left, "Max"/right).
//
// Each skill stores an effect *template* with {placeholder} variables and a
// sparse map of per-level values for each variable. Levels are 1-30; entries
// fill in as screenshots come in. The renderer in src/lib/palmonSkills.js
// substitutes values at the requested level; missing values render as "TBD".

export const PALMON_SKILLS = {
  glacewing: [
    {
      name: 'Icicle Barrage',
      effectTemplate:
        'Launches a series of icy spikes, dealing {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 30: 777 },
      },
      ascensionEffects: [
        'Damage +30%',
        'Damage +70%',
        'Damage +120%',
        'Damage +185%',
        'Damage +270%',
      ],
    },
    {
      name: 'Frostwing Blast',
      effectTemplate:
        'Unleashes a frost explosion, dealing {damage}% damage to nearby enemies, and inflicting Deep Freeze for 2s.',
      effectValues: {
        damage: { 30: 2497.5 },
      },
      ascensionEffects: [
        'Damage +30%',
        'Damage +70%',
        'Damage +120%',
        'Damage +185%',
        'Damage +270%',
      ],
    },
    {
      name: "Dragon's Roar",
      effectTemplate: 'Rage builds up {rate}% faster.',
      effectValues: {
        rate: { 30: 25 },
      },
      ascensionEffects: [
        'Rage Build-up +2%',
        'Rage Build-up +4%',
        'Rage Build-up +6%',
        'Rage Build-up +8%',
        'Rage Build-up +10%',
      ],
    },
    {
      name: 'Promising',
      effectTemplate: 'Gains +{boost}% Total Attack, Defense, and HP.',
      effectValues: {
        boost: { 30: 20 },
      },
      ascensionEffects: [],
    },
  ],
  ninjump: [
    {
      name: 'Flow Like a River',
      effectTemplate:
        'Slashes a single enemy multiple times with a ninjato, dealing a total of {damage}% damage.',
      effectValues: {
        damage: { 10: 529.77, 11: 535.88 },
      },
      ascensionEffects: [
        'Damage +30%',
        'Damage +70%',
        'Damage +120%',
        'Damage +185%',
        'Damage +270%',
      ],
    },
    {
      name: 'Strike Like a Waterfall',
      effectTemplate:
        'Hurls 3 shuriken, dealing {damage}% damage to all enemies in a fan.',
      effectValues: {
        damage: { 6: 1384.58, 7: 1402.08 },
      },
      ascensionEffects: [
        'Damage +30%',
        'Damage +70%',
        'Damage +120%',
        'Damage +185%',
        'Damage +270%',
      ],
    },
    {
      name: 'Crash Like the Waves',
      effectTemplate: 'Gains +{attack}% Attack while in combat.',
      effectValues: {
        attack: { 30: 30 },
      },
      ascensionEffects: [
        'Attack +2%',
        'Attack +4%',
        'Attack +6%',
        'Attack +8%',
        'Attack +10%',
      ],
    },
    {
      name: 'Promising',
      effectTemplate: 'Gains +{boost}% Total Attack, Defense, and HP.',
      effectValues: {
        boost: { 30: 20 },
      },
      ascensionEffects: [],
    },
  ],
};

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
  { species: 'ninjump', slot: 0, fromLevel: 10, cost: 3200 },
  { species: 'ninjump', slot: 1, fromLevel: 6, cost: 5500 },
];
