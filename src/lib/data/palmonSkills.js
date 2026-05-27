// Per-palmon catalog of the four 1-30 skills.
//
// Keyed by base species key (see PALMON_SPECIES in palmon.js). Each value
// is an array of up to 4 skill entries, in the order the in-game UI presents
// them (top-left, top-right, lower-left, "Max"/right).
//
// Per-level scaling is intentionally not modeled — the species detail view
// shows the L30 effect verbatim; the roster card shows the skill name plus
// the instance's current level number.
//
// Skillfruit upgrade cost is shared across all palmon and will live in its
// own constant once we have a non-maxed screenshot to transcribe.

export const PALMON_SKILLS = {
  glacewing: [
    {
      name: 'Icicle Barrage',
      effect:
        'Launches a series of icy spikes, dealing 777% damage to a single enemy.',
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
      effect:
        'Unleashes a frost explosion, dealing 2497.5% damage to nearby enemies, and inflicting Deep Freeze for 2s.',
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
      effect: 'Rage builds up 25% faster.',
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
      effect: 'Gains +20% Total Attack, Defense, and HP.',
      ascensionEffects: [],
    },
  ],
};
