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
  dolphriend: [
    {
      name: 'Smash',
      effectTemplate:
        'Delivers a powerful strike on an enemy target, dealing {damage}% damage.',
      effectValues: {
        damage: { 10: 278.91, 11: 282.39 },
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
      name: 'Rush Wave',
      effectTemplate:
        'Smashes violently into an enemy, dealing {damage}% damage, with a 70% chance to stun the enemy for 3s.',
      effectValues: {
        damage: { 10: 3508.79, 11: 3560.33 },
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
      name: 'Tidal Guard',
      effectTemplate: 'Gains +{hp}% max HP while in combat.',
      effectValues: {
        hp: { 7: 26.56, 8: 26.9 },
      },
      ascensionEffects: [
        'HP +2%',
        'HP +4%',
        'HP +6%',
        'HP +8%',
        'HP +10%',
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
  gnashley: [
    {
      name: 'Whiplash',
      effectTemplate:
        'Swings its mighty tail, dealing {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 10: 441.49, 11: 446.56 },
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
      name: 'Tail Flurry',
      effectTemplate:
        'Swings its mighty tail 3 times, dealing a total of {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 10: 4754.76, 11: 4820.88 },
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
      name: "Ocean's Blessing",
      effectTemplate:
        'Allied Water Palmon take {damage}% less damage in combat.',
      effectValues: {
        damage: { 30: 20 },
      },
      ascensionEffects: [
        'Allied Water Palmon Damage Taken -1.5%',
        'Allied Water Palmon Damage Taken -3%',
        'Allied Water Palmon Damage Taken -4.5%',
        'Allied Water Palmon Damage Taken -6%',
        'Allied Water Palmon Damage Taken -7.5%',
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
  lucidina: [
    {
      name: 'Phantasm',
      effectTemplate:
        'Launches an orb of dream power, dealing {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 9: 250.36, 10: 253.4 },
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
      name: 'Torment',
      effectTemplate:
        'Pulls an enemy into a dream for 3s. When the dream shatters, deals {damage}% damage to that enemy (ignores Evasion and Invincibility).',
      effectValues: {
        damage: { 8: 3590.25, 9: 3642.26 },
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
      name: 'Dream Shadow',
      effectTemplate: 'Gains +{rate}% Crit Rate while in combat.',
      effectValues: {
        rate: { 5: 20.83, 6: 21.18 },
      },
      ascensionEffects: [
        'Crit Rate +2%',
        'Crit Rate +4%',
        'Crit Rate +6%',
        'Crit Rate +8%',
        'Crit Rate +10%',
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
  plunderjaw: [
    {
      name: 'Hook Slash',
      effectTemplate:
        'Swings the pirate hook, dealing {damage}% damage to a single enemy and applying 2 stacks of Rupture Mark.',
      effectValues: {
        damage: { 15: 251.57, 16: 254.46 },
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
      name: 'Devouring Doom',
      effectTemplate:
        'Bursts from underground and bites a single enemy, dealing {damage}% damage and applying 3 stacks of Rupture Mark.',
      effectValues: {
        damage: { 15: 5346.31, 16: 5420.52 },
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
      name: "Predator's Edge",
      effectTemplate:
        'Deals 10% more damage for each stack of Rupture Mark on the target (stacks up to 10 times). While in combat, increases Rage build-up by {rage}% and Crit Rate by {crit}%.',
      effectValues: {
        rage: { 20: 13.28, 21: 13.45 },
        crit: { 20: 13.28, 21: 13.45 },
      },
      ascensionEffects: [
        'Crit Rate +2%',
        'Rage Build-up +5%',
        'Crit Rate +5%',
        'Rage Build-up +10%',
        '— TBD —',
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
  regalion: [
    {
      name: 'Fury of the Sea',
      effectTemplate:
        'Regalion fires a jet of water at a single enemy, dealing {damage}% damage.',
      effectValues: {
        damage: { 10: 423.36, 11: 428.83 },
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
      name: 'Surging Tides',
      effectTemplate:
        'Regalion summons a surging sea, dealing {damage}% damage to all enemies.',
      effectValues: {
        damage: { 10: 1311.73, 11: 1330.75 },
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
      name: 'King of the Waves',
      effectTemplate: 'Allied Water Palmon deal {damage}% more damage in combat.',
      effectValues: {
        damage: { 30: 20 },
      },
      ascensionEffects: [
        'Water Palmon Final Damage +1.5%',
        'Water Palmon Final Damage +3%',
        'Water Palmon Final Damage +4.5%',
        'Water Palmon Final Damage +6%',
        'Water Palmon Final Damage +7.5%',
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
  { species: 'dolphriend', slot: 0, fromLevel: 10, cost: 1700 },
  { species: 'dolphriend', slot: 1, fromLevel: 10, cost: 2000 },
  { species: 'dolphriend', slot: 2, fromLevel: 7, cost: 4700 },
  { species: 'gnashley', slot: 0, fromLevel: 10, cost: 3200 },
  { species: 'gnashley', slot: 1, fromLevel: 10, cost: 3200 },
  { species: 'lucidina', slot: 0, fromLevel: 9, cost: 2000 },
  { species: 'lucidina', slot: 1, fromLevel: 8, cost: 2300 },
  { species: 'lucidina', slot: 2, fromLevel: 5, cost: 3200 },
  { species: 'ninjump', slot: 0, fromLevel: 10, cost: 3200 },
  { species: 'ninjump', slot: 1, fromLevel: 6, cost: 5500 },
  { species: 'plunderjaw', slot: 0, fromLevel: 15, cost: 3200 },
  { species: 'plunderjaw', slot: 1, fromLevel: 15, cost: 3200 },
  { species: 'plunderjaw', slot: 2, fromLevel: 20, cost: 4700 },
  { species: 'regalion', slot: 0, fromLevel: 10, cost: 800 },
  { species: 'regalion', slot: 1, fromLevel: 10, cost: 2300 },
];
