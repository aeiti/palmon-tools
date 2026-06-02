// Per-mount catalog of skill data.
//
// Keyed by mount key (the MOUNTS catalog will land in a follow-up PR — keys
// here are the canonical camelCase mount slugs the catalog will use). Each
// value is an array of skill entries in the order the in-game Stable UI
// presents them. All mounts have one skill except slackycapy, which has two.
//
// Mount skill levels are 1-5 and unlock as the mount's level reaches
// 10 / 30 / 50 / 70 / 100 respectively. The threshold table lives with the
// MOUNTS catalog (next PR) since it's not per-skill.
//
// Each skill stores an effect *template* with {placeholder} variables and a
// sparse map of per-level values for each variable. The renderer (to be
// added with PR #2) substitutes values at the requested level; missing
// values render as "TBD" — same convention as PALMON_SKILLS.

export const MOUNT_SKILLS = {
  amourphibian: [
    {
      name: 'Love Language',
      effectTemplate:
        'For the first 10s of battle, grants +{reduction}% damage reduction to allied front-row Palmon.',
      effectValues: {
        reduction: { 1: 5, 2: 10, 3: 15, 4: 20, 5: 30 },
      },
    },
  ],
  bunnyRunny: [
    {
      name: 'Ready to Roll',
      effectTemplate: 'All Palmon Armigo Capacity +{capacity}%.',
      effectValues: {
        capacity: { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 },
      },
    },
  ],
  narfoal: [
    {
      name: 'Rainbow Rage',
      effectTemplate:
        'At the start of battle, grants +{attack} Attack to allied Palmon.',
      effectValues: {
        attack: { 1: 200, 2: 1500, 3: 3000, 4: 4500, 5: 9000 },
      },
    },
  ],
  nightMare: [
    {
      name: 'Inferneighl Flame',
      effectTemplate:
        'Inflict shadowy flames on all enemies, causing them to take an extra {damage}% damage each time they are hit. This effect lasts for 15s. (Cooldown: 15.0s)',
      effectValues: {
        damage: { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 },
      },
    },
  ],
  skyboundPatrol: [
    {
      name: 'Guardian Hound',
      effectTemplate:
        'At the start of battle, locks onto the allied Palmon with the highest Attack. When that Palmon takes fatal damage, activates Unyielding for {duration}s. That Palmon will not die during the time and immediately recover {rage} Rage. It dies once the effect ends.',
      effectValues: {
        duration: { 1: 4, 2: 4.6, 3: 5.4, 4: 6, 5: 6.6 },
        rage: { 1: 30, 2: 40, 3: 50, 4: 60, 5: 70 },
      },
    },
  ],
  slackycapy: [
    {
      name: 'Cornucapya',
      effectTemplate: 'Camp Lumber, Gold, and Steel output +{boost}%.',
      effectValues: {
        boost: { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 },
      },
    },
    {
      name: 'Capy Tackle',
      effectTemplate:
        'Charges at a random enemy 15s into the battle, dealing {damage} damage and has a {stun}% chance of stunning the target for 2s. (Cooldown: 15.0s)',
      effectValues: {
        damage: {
          1: 2000000,
          2: 5000000,
          3: 10000000,
          4: 15000000,
          5: 20000000,
        },
        stun: { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 },
      },
    },
  ],
  swiftger: [
    {
      name: 'Terrifying Roar',
      effectTemplate:
        'Deals {damage} (+20000 per mount level) damage to all enemies. (Cooldown: 9.0s)',
      effectValues: {
        damage: { 1: 200000, 2: 400000, 3: 600000, 4: 900000, 5: 1200000 },
      },
    },
  ],
};
