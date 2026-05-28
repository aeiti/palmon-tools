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
  abuzzinian: [
    {
      name: 'Electric Surge',
      effectTemplate: 'Deals {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 1: 147.9, 2: 149.96 },
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
      name: 'Nightstorm',
      effectTemplate:
        'Calls down 2 bolts of lightning, zapping the 2 enemies with the lowest HP for {damage}% damage.',
      effectValues: {
        damage: { 1: 1489.2, 2: 1514.94 },
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
      name: 'Phantom Step',
      effectTemplate: 'Gains +{evasion}% Evasion in combat.',
      effectValues: {
        evasion: { 1: 14, 2: 14.35 },
      },
      ascensionEffects: [
        'Evasion +2%',
        'Evasion +4%',
        'Evasion +6%',
        'Evasion +8%',
        'Evasion +10%',
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
  battereina: [
    {
      name: 'Fulminous Strike',
      effectTemplate:
        'Unleashes a powerful current from the electropollen in its hand, dealing {damage}% damage to 2 random back-row enemies.',
      effectValues: {
        damage: { 1: 142.8, 2: 144.81 },
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
      name: 'Dynamic Discharge',
      effectTemplate:
        'Unleashes an immense energy surge from its electropollen, dealing {damage}% damage to 2 random back-row enemies.',
      effectValues: {
        damage: { 1: 949.96, 2: 966.28 },
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
      name: 'Bow to the Queen',
      effectTemplate: 'Allied Electric Palmon deal {damage}% more damage in combat.',
      effectValues: {
        damage: { 1: 8, 2: 8.26 },
      },
      ascensionEffects: [
        'Electric Palmon Final Damage +1.5%',
        'Electric Palmon Final Damage +3%',
        'Electric Palmon Final Damage +4.5%',
        'Electric Palmon Final Damage +6%',
        'Electric Palmon Final Damage +7.5%',
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
  blazeal: [
    {
      name: 'Hyah!',
      effectTemplate: 'Deals {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 1: 170, 2: 172.35 },
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
      name: 'Huuuah!',
      effectTemplate:
        'Charges up and releases a large fireball, dealing {damage}% damage to all enemies in its path. Deals 1.5x damage to enemies that are already burning.',
      effectValues: {
        damage: { 1: 425, 2: 432.4 },
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
      name: 'Tempered Steel',
      effectTemplate: 'Gains +{attack}% Attack while in combat.',
      effectValues: {
        attack: { 1: 14, 2: 14.35 },
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
  cerverdant: [
    {
      name: 'Force of Nature',
      effectTemplate: 'Deals {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 1: 200, 2: 202.06 },
      },
      ascensionEffects: [
        'Damage +20%',
        'Damage +45%',
        'Damage +70%',
        'Damage +100%',
        'Damage +150%',
      ],
    },
    {
      name: 'Verdant Grace',
      effectTemplate: 'Allied Earth Palmon gain +{attack}% Attack for 5s.',
      effectValues: {
        attack: { 1: 18, 2: 18.35 },
      },
      ascensionEffects: [
        'Earth Palmon Final Damage +2%',
        'Earth Palmon Final Damage +4%',
        'Earth Palmon Final Damage +6%',
        'Earth Palmon Final Damage +8%',
        'Earth Palmon Final Damage +10%',
      ],
    },
    {
      name: 'Verdant Bounty',
      effectTemplate: 'Wood output +{output}% when working a Logging job.',
      effectValues: {
        output: { 25: 46.56, 26: 47.25 },
      },
      ascensionEffects: [
        'Output +5%',
        'Output +10%',
        'Output +15%',
        'Output +20%',
        'Output +30%',
      ],
    },
    {
      name: 'Sturdy',
      effectTemplate: 'Gains +{boost}% Total Attack, Defense, and HP.',
      effectValues: {
        boost: { 30: 10 },
      },
      ascensionEffects: [],
    },
  ],
  barkplug: [
    {
      name: 'Maelstrom Bolt',
      effectTemplate:
        'Unleashes a chain of lightning that strikes up to 5 enemy targets, dealing {damage}% damage to each target.',
      effectValues: {
        damage: { 3: 47.2, 4: 47.84 },
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
      name: 'Overcharge',
      effectTemplate:
        'Leaps into the air and zaps a single enemy for {damage}% damage.',
      effectValues: {
        damage: { 3: 2071.78, 4: 2106.37 },
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
      name: 'Focused Surge',
      effectTemplate: 'Gains +{hp}% max HP in combat.',
      effectValues: {
        hp: { 2: 14.35, 3: 14.69 },
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
  baboom: [
    {
      name: 'Stifle',
      effectTemplate:
        'Swings a stick at a single enemy, dealing {damage}% damage.',
      effectValues: {
        damage: { 2: 115.5, 3: 117.08 },
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
      name: 'Power Strike',
      effectTemplate:
        'Launches a charged strike, dealing {damage}% damage to an enemy in melee range. Has a 100% chance to stun the enemy for 2s.',
      effectValues: {
        damage: { 2: 1130.93, 3: 1150.04 },
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
      name: 'Steel Smarts',
      effectTemplate:
        'Increases Lumber output by +{lumber}% for all Table Saws in Camp. Rage builds up {rage}% faster.',
      effectValues: {
        lumber: { 6: 25.52, 7: 28.63 },
        rage: { 6: 15.73, 7: 16.07 },
      },
      ascensionEffects: [
        'Rage Build-up +2%',
        'Rage Build-up +4%',
        'Rage Build-up +6%',
        'Rage Build-up +8%',
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
        damage: { 11: 3508.79, 12: 3560.33 },
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
        hp: { 20: 26.56, 21: 26.9 },
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
  escarffier: [
    {
      name: 'Châtiment Piment',
      effectTemplate:
        'Throws a (literally) flaming-hot pepper, dealing {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 1: 566.1, 2: 573.91 },
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
      name: 'Bon Appétit',
      effectTemplate:
        'Bon appétit mes amis! Tosses a perfectly cooked hamburger to the allied Palmon with the highest Attack, boosting its Attack by {attack}% for 10s.',
      effectValues: {
        attack: { 1: 18, 2: 18.35 },
      },
      ascensionEffects: [
        'Attack +4%',
        'Attack +8%',
        'Attack +12%',
        'Attack +16%',
        '— TBD —',
      ],
    },
    {
      name: 'Rage Ignition',
      effectTemplate: 'Rage builds up {rate}% faster.',
      effectValues: {
        rate: { 1: 14, 2: 14.35 },
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
  fingenue: [
    {
      name: 'Spurt',
      effectTemplate:
        'Fires a water projectile, dealing {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 1: 136, 2: 137.89 },
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
      name: 'Waterspout',
      effectTemplate:
        'Summons a swirling column of water, dealing {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 1: 2580.6, 2: 2625.08 },
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
      name: "Ocean's Favor",
      effectTemplate: 'Deals +{damage}% damage while in battle.',
      effectValues: {
        damage: { 1: 14, 2: 14.35 },
      },
      ascensionEffects: [
        'Final Damage +2%',
        'Final Damage +4%',
        'Final Damage +6%',
        'Final Damage +8%',
        'Final Damage +10%',
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
  fulgairy: [
    {
      name: 'Thundercrack',
      effectTemplate:
        'Flings a lightning bolt at a single enemy, dealing {damage}% damage.',
      effectValues: {
        damage: { 1: 170, 2: 172.35 },
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
      name: 'Countervolt',
      effectTemplate:
        'Fills its body with electricity, gaining a Counterattack Shield that deals {damage}% damage to attackers. Triggers up to 5 times.',
      effectValues: {
        damage: { 1: 469.2, 2: 477.25 },
      },
      ascensionEffects: [
        'Counterattack Damage +30%',
        'Counterattack Damage +70%',
        'Counterattack Damage +120%',
        'Counterattack Damage +185%',
        'Counterattack Damage +270%',
      ],
    },
    {
      name: 'Thunderous Boon',
      effectTemplate:
        'Allied Electric Palmon take {damage}% less damage in combat.',
      effectValues: {
        damage: { 1: 8, 2: 8.26 },
      },
      ascensionEffects: [
        'Damage Reduction +1.5%',
        'Damage Reduction +3%',
        'Damage Reduction +4.5%',
        'Damage Reduction +6%',
        'Damage Reduction +7.5%',
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
  ghillant: [
    {
      name: 'Blitz',
      effectTemplate:
        'Delivers a powerful strike to a nearby target, dealing {damage}% damage.',
      effectValues: {
        damage: { 1: 160.6, 2: 162.8 },
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
      name: 'Shadow Surge',
      effectTemplate:
        'Hits an enemy for {damage}% damage, and takes 20% of the damage meant for allies for the next 8s.',
      effectValues: {
        damage: { 1: 1850.2, 2: 1882.08 },
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
      name: "Nature's Guard",
      effectTemplate:
        'Allied back-row Earth Palmon take {damage}% less damage in combat.',
      effectValues: {
        damage: { 1: 16, 2: 16.35 },
      },
      ascensionEffects: [
        'Damage Reduction +2%',
        'Damage Reduction +4%',
        'Damage Reduction +6%',
        'Damage Reduction +8%',
        'Damage Reduction +10%',
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
        damage: { 15: 441.49, 16: 446.56 },
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
        damage: { 15: 4754.76, 16: 4820.88 },
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
  hoofrit: [
    {
      name: 'Fiery Charge',
      effectTemplate: 'Rams a single enemy, dealing {damage}% damage.',
      effectValues: {
        damage: { 1: 260.1, 2: 263.69 },
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
      name: 'Blazing Volley',
      effectTemplate:
        "Deals {damage}% damage to all back-row enemies. If a target is already burning, they're also stunned for 2s.",
      effectValues: {
        damage: { 1: 884, 2: 899.25 },
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
      name: 'Blazing Crescendo',
      effectTemplate: 'Gains +{rate}% Crit Rate in combat.',
      effectValues: {
        rate: { 1: 14, 2: 14.35 },
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
  incineraptor: [
    {
      name: 'Heat Wave',
      effectTemplate: 'Deals {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 1: 250, 2: 252.58 },
      },
      ascensionEffects: [
        'Damage +20%',
        'Damage +45%',
        'Damage +70%',
        'Damage +100%',
        'Damage +150%',
      ],
    },
    {
      name: 'Flamewing Dive',
      effectTemplate:
        'Deals {damage}% damage to all enemies in a straight line.',
      effectValues: {
        damage: { 1: 625.3, 2: 636.03 },
      },
      ascensionEffects: [
        'Damage +20%',
        'Damage +45%',
        'Damage +70%',
        'Damage +100%',
        'Damage +150%',
      ],
    },
    {
      name: 'Eagle Eye',
      effectTemplate:
        "Incineraptor can always find where the treasure is hidden. Provides extra treasure (up to {extra} a day) when completing an Intel Quest. Incineraptor can burn 10 Incineraptor Plumes to generate 3 high-quality intel quests. You'll receive 1 Incineraptor Plume every {minutes} min.",
      effectValues: {
        extra: { 30: 42 },
        minutes: { 30: 67 },
      },
      ascensionEffects: [
        'Plume Output Time -10 min',
        'Owl-Eyed Chests +5',
        'Plume Output Time -20 min',
        '— TBD —',
        '— TBD —',
      ],
    },
    {
      name: 'Sturdy',
      effectTemplate: 'Gains +{boost}% Total Attack, Defense, and HP.',
      effectValues: {
        boost: { 30: 10 },
      },
      ascensionEffects: [],
    },
  ],
  kungpaw: [
    {
      name: 'Hydro Punch',
      effectTemplate:
        'Channels Qi to condense water flow onto the fist, dealing {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 1: 248.6, 2: 252.04 },
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
      name: 'Tidal Vortex',
      effectTemplate:
        'Charges in place and releases Qi, dealing {damage}% damage to 3 random enemies. Each time Kungpaw is attacked for the next 5s, there is a 25% chance to ignore the damage.',
      effectValues: {
        damage: { 1: 965.8, 2: 982.44 },
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
      name: "Shifu's Guidance",
      effectTemplate:
        'Whether deployed or not, back-row Palmon on your squad take {damage}% less Rage Skill damage for 12s once the battle starts.',
      effectValues: {
        damage: { 20: 14.42, 21: 14.68 },
      },
      ascensionEffects: [
        'Rage Skill Damage Taken -1.5%',
        'Duration Increase: 2s in total.',
        'Rage Skill Damage Taken -4.5%',
        'Duration Increase: 5s in total.',
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
  limudroid: [
    {
      name: 'Energy Ball',
      effectTemplate:
        'Throws an energy ball at a single enemy, dealing {damage}% damage.',
      effectValues: {
        damage: { 1: 176, 2: 178.45 },
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
      name: 'Ionic Rays',
      effectTemplate:
        'Fires three laser eyebeams, dealing {damage}% damage to all enemies.',
      effectValues: {
        damage: { 1: 759, 2: 772.07 },
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
      name: 'Whiz Kid',
      effectTemplate:
        "Limudroid's advanced digibrain grants you +{boost}% tech research speed. When researching a tech, reduces final research time by {reduction} min.",
      effectValues: {
        boost: { 20: 21.34, 21: 22.2 },
        reduction: { 20: 64, 21: 65 },
      },
      ascensionEffects: [
        'Time Reduction +5 min',
        'Time Reduction +10 min',
        'Time Reduction +15 min',
        'Time Reduction +30 min',
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
  magmolin: [
    {
      name: 'Claw',
      effectTemplate: 'Deals {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 2: 147.4, 3: 149.47 },
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
      name: 'Lava Shock',
      effectTemplate:
        'Slams the ground, causing volcanic spikes to hit 3 random enemies for {damage}% damage and burns them, dealing an extra {burn}% damage over 10s.',
      effectValues: {
        damage: { 2: 583, 3: 593.04 },
        burn: { 2: 1000, 3: 1027.6 },
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
      name: 'Tempered Steel',
      effectTemplate:
        'Increases Steel output by +{steel}% for all Furnaces in Camp. Allied Fire Palmon take {reduction}% less damage in combat.',
      effectValues: {
        steel: { 2: 41.04, 3: 44.14 },
        reduction: { 2: 12.09, 3: 12.35 },
      },
      ascensionEffects: [
        'Fire Palmon Damage Taken -1.5%',
        'Fire Palmon Damage Taken -3%',
        'Fire Palmon Damage Taken -4.5%',
        'Fire Palmon Damage Taken -6%',
        'Fire Palmon Damage Taken -7.5%',
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
  mantleray: [
    {
      name: 'Lightning Bolt',
      effectTemplate:
        'Launches lightning bolts from a distance, dealing {damage}% damage to a random back-row enemy.',
      effectValues: {
        damage: { 5: 202.66, 6: 205.3 },
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
      name: 'Electric Burst',
      effectTemplate:
        'Fires 3 electric bombs randomly targeting enemies, each dealing {damage}% damage. (The bombs can target the same enemy).',
      effectValues: {
        damage: { 5: 915.9, 6: 930.67 },
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
      name: 'Stinging Spark',
      effectTemplate: 'Gains +{rate}% Crit Rate while in combat.',
      effectValues: {
        rate: { 4: 15.04, 5: 15.38 },
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
  meowdame: [
    {
      name: 'Dream Orb',
      effectTemplate: 'Deals {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 4: 250, 5: 252.58 },
      },
      ascensionEffects: [
        'Damage +20%',
        'Damage +45%',
        'Damage +70%',
        'Damage +100%',
        'Damage +150%',
      ],
    },
    {
      name: 'Starlight Blessing',
      effectTemplate:
        'Grants a random allied Palmon a {damage}% bonus to damage dealt for 5s.',
      effectValues: {
        damage: { 4: 15, 5: 15.18 },
      },
      ascensionEffects: [
        'Damage +2%',
        'Damage +4%',
        'Damage +6%',
        'Damage +8%',
        'Damage +10%',
      ],
    },
    {
      name: 'Miracle-Maker',
      effectTemplate:
        'Meowdame has a penchant for making miracles happen. Increases Gold, Lumber, and Steel rewards by {bonus}% when it defeats a Bullymon or Bullyboss.',
      effectValues: {
        bonus: { 15: 51.7, 16: 53.25 },
      },
      ascensionEffects: [
        'Resource Bonus +5%',
        'Resource Bonus +10%',
        'Resource Bonus +15%',
        'Resource Bonus +20%',
        '— TBD —',
      ],
    },
    {
      name: 'Sturdy',
      effectTemplate: 'Gains +{boost}% Total Attack, Defense, and HP.',
      effectValues: {
        boost: { 30: 10 },
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
  oleana: [
    {
      name: 'Olive Barrage',
      effectTemplate:
        'Throws an olive, dealing {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 2: 170, 3: 172.35 },
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
      name: 'Wreath Toss',
      effectTemplate:
        'Summons an olive wreath overhead. Throws multiple olives at the enemy front row, dealing {damage}% damage to each enemy.',
      effectValues: {
        damage: { 2: 853.4, 3: 868.13 },
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
      name: 'Leafy Hug',
      effectTemplate:
        'Increases the HP of all Palmon by {hp} (even when undeployed). Increases Hospital capacity by {capacity}.',
      effectValues: {
        hp: { 2: 377587, 3: 396207 },
        capacity: { 2: 1259, 3: 1321 },
      },
      ascensionEffects: [
        'All Palmon HP +60000',
        'All Palmon HP +150000',
        'All Palmon HP +300000',
        'All Palmon HP +540000',
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
  pipistrigoi: [
    {
      name: 'Netherflame',
      effectTemplate:
        'Shoots a blue fireball, dealing {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 2: 100, 3: 101.38 },
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
      name: 'Phantom Cyclone',
      effectTemplate:
        'Shoots a blue fire tornado, dealing {damage}% damage to all enemies.',
      effectValues: {
        damage: { 2: 301.32, 3: 306.14 },
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
      name: "Nocturne's Focus",
      effectTemplate: 'Damage +{damage}% for Phantom Cyclone.',
      effectValues: {
        damage: { 2: 11.38, 3: 11.73 },
      },
      ascensionEffects: [
        'Damage +2% for Phantom Cyclone.',
        'Damage +4% for Phantom Cyclone.',
        'Damage +6% for Phantom Cyclone.',
        'Damage +8% for Phantom Cyclone.',
        'Damage +10% for Phantom Cyclone.',
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
  platyputz: [
    {
      name: 'I Got Just the Thing',
      effectTemplate:
        'Platyputz fishes out an assortment of treasures from its pouch and hucks them at a single enemy, dealing a total of {damage}% damage.',
      effectValues: {
        damage: { 5: 208.26, 6: 210.34 },
      },
      ascensionEffects: [
        'Damage +20%',
        'Damage +45%',
        'Damage +70%',
        'Damage +100%',
        'Damage +150%',
      ],
    },
    {
      name: 'Bubble Shield',
      effectTemplate:
        'Grants a shield equal to {shield}% of its max HP to the ally with the lowest HP for 6s.',
      effectValues: {
        shield: { 5: 18.54, 6: 18.8 },
      },
      ascensionEffects: [
        'Shield +5%',
        'Effect Duration → 5s',
        'Shield +10%',
        'Effect Duration → 6s',
        'Shield +15%',
      ],
    },
    {
      name: 'Blunt Sense',
      effectTemplate:
        "Platyputz's dull mind dulls the pain. It takes -{damage}% damage.",
      effectValues: {
        damage: { 13: 14.11, 14: 14.37 },
      },
      ascensionEffects: [
        'Damage Reduction +1.5%',
        'Damage Reduction +3%',
        'Damage Reduction +4.5%',
        'Damage Reduction +6%',
        'Damage Reduction +7.5%',
      ],
    },
    {
      name: 'Sturdy',
      effectTemplate: 'Gains +{boost}% Total Attack, Defense, and HP.',
      effectValues: {
        boost: { 30: 10 },
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
  salamantis: [
    {
      name: 'Fatal Flier',
      effectTemplate: 'Throws a dart, dealing {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 2: 170, 3: 172.35 },
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
      name: 'Blade Vortex',
      effectTemplate:
        'Hurls 5 darts at 5 random enemies, dealing {damage}% damage to each.',
      effectValues: {
        damage: { 2: 584.8, 3: 594.9 },
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
      name: 'Predator Instincts',
      effectTemplate: 'Allied Earth Palmon deal {damage}% more damage in combat.',
      effectValues: {
        damage: { 2: 8, 3: 8.26 },
      },
      ascensionEffects: [
        'Earth Palmon Final Damage +1.5%',
        'Earth Palmon Final Damage +3%',
        'Earth Palmon Final Damage +4.5%',
        'Earth Palmon Final Damage +6%',
        'Earth Palmon Final Damage +7.5%',
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
  revontulet: [
    {
      name: 'Foxfire',
      effectTemplate:
        'Unleashes a fireball from its flaming tail, dealing {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 2: 170, 3: 172.35 },
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
      name: 'Burning Tails',
      effectTemplate:
        'Shoots 3 to 5 fireballs, each dealing {damage}% damage to an enemy and burns them, dealing an extra {burn}% damage over 10s.',
      effectValues: {
        damage: { 2: 484.33, 3: 492.66 },
        burn: { 2: 920, 3: 936.6 },
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
      name: 'Spectral Flames',
      effectTemplate: 'Allied Fire Palmon deal {damage}% more damage in combat.',
      effectValues: {
        damage: { 2: 8.52, 3: 8.78 },
      },
      ascensionEffects: [
        'Fire Palmon Final Damage +1.5%',
        'Fire Palmon Final Damage +3%',
        'Fire Palmon Final Damage +4.5%',
        'Fire Palmon Final Damage +6%',
        'Fire Palmon Final Damage +7.5%',
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
  statchew: [
    {
      name: 'Gnash',
      effectTemplate: 'Bites a nearby enemy, dealing {damage}% damage.',
      effectValues: {
        damage: { 2: 370, 3: 375.11 },
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
      name: 'Protective Roar',
      effectTemplate:
        'Lets out a terrifying roar, dealing {damage}% damage to all enemies and reducing their damage dealt by 30% for 5s.',
      effectValues: {
        damage: { 2: 828.8, 3: 842.98 },
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
      name: 'Sentinel',
      effectTemplate:
        'Allied front-row Palmon take {damage}% less damage while in combat.',
      effectValues: {
        damage: { 2: 12.5, 3: 12.76 },
      },
      ascensionEffects: [
        'Damage Reduction +1.5%',
        'Damage Reduction +3%',
        'Damage Reduction +4.5%',
        'Damage Reduction +6%',
        'Damage Reduction +7.5%',
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
  snowkami: [
    {
      name: 'Frostclaw',
      effectTemplate:
        'Bites a single enemy multiple times, dealing a total of {damage}% damage.',
      effectValues: {
        damage: { 4: 200, 5: 202.06 },
      },
      ascensionEffects: [
        'Damage +20%',
        'Damage +45%',
        'Damage +70%',
        'Damage +100%',
        'Damage +150%',
      ],
    },
    {
      name: 'Glacial Howl',
      effectTemplate:
        'Snowkami unleashes the wrath of winter, dealing {damage}% damage to a single enemy. Has a 70% chance to Freeze the target for 2.5s.',
      effectValues: {
        damage: { 4: 1416.45, 5: 1440.85 },
      },
      ascensionEffects: [
        'Damage +20%',
        'Damage +45%',
        'Damage +70%',
        'Damage +100%',
        'Damage +150%',
      ],
    },
    {
      name: 'Wolfy Will',
      effectTemplate: 'Gains +{attack}% Attack while in combat.',
      effectValues: {
        attack: { 4: 11, 5: 11.26 },
      },
      ascensionEffects: [
        'Attack +1.5%',
        'Attack +3%',
        'Attack +4.5%',
        'Attack +6%',
        'Attack +7.5%',
      ],
    },
    {
      name: 'Sturdy',
      effectTemplate: 'Gains +{boost}% Total Attack, Defense, and HP.',
      effectValues: {
        boost: { 30: 10 },
      },
      ascensionEffects: [],
    },
  ],
  spookaboo: [
    {
      name: 'Candleflame Orb',
      effectTemplate:
        'Launches a ghostly fireball, dealing {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 2: 248.6, 3: 252.04 },
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
      name: "Jack-o'-Smash",
      effectTemplate:
        'Drops a pumpkin lantern from above, dealing {damage}% damage to 3 random enemies.',
      effectValues: {
        damage: { 2: 930.6, 3: 946.71 },
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
      name: 'Ghostly Power',
      effectTemplate:
        'Increases the Attack of all Palmon by {attack} (even when undeployed). Increases Armigo Hut capacity by {capacity}.',
      effectValues: {
        attack: { 2: 2380, 3: 2442 },
        capacity: { 2: 4794, 3: 4914 },
      },
      ascensionEffects: [
        'All Palmon Attack +200',
        'All Palmon Attack +500',
        'All Palmon Attack +1000',
        'All Palmon Attack +1800',
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
  surveilynx: [
    {
      name: 'Snap Shot',
      effectTemplate:
        'A long-ranged attack that deals {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 2: 90.1, 3: 91.35 },
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
      name: 'Shadow Step',
      effectTemplate:
        'Surveilynx teleports to 3 nearby spots, dealing {damage}% damage to all enemies in a fan.',
      effectValues: {
        damage: { 2: 673.2, 3: 684.82 },
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
      name: 'Tactical Drills',
      effectTemplate:
        'Surveilynx can Quick Train up to {trainCount} Armigo per day. Your Armigo gain +{attack}% Attack when defending your Camp.',
      effectValues: {
        trainCount: { 7: 425, 8: 450 },
        attack: { 7: 10.04, 8: 10.21 },
      },
      ascensionEffects: [
        'Armigo Attack +2%',
        'Armigo Attack +4%',
        'Armigo Attack +6%',
        'Armigo Attack +8%',
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
  terrastudo: [
    {
      name: 'Headbutt',
      effectTemplate: 'Deals {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 4: 200, 5: 202.06 },
      },
      ascensionEffects: [
        'Damage +20%',
        'Damage +45%',
        'Damage +70%',
        'Damage +100%',
        'Damage +150%',
      ],
    },
    {
      name: 'Tectonic Spin',
      effectTemplate:
        'Turns into a rapidly-spinning pinball of death, dealing {damage}% damage to all nearby enemy targets.',
      effectValues: {
        damage: { 4: 481.65, 5: 489.92 },
      },
      ascensionEffects: [
        'Damage +20%',
        'Damage +45%',
        'Damage +70%',
        'Damage +100%',
        'Damage +150%',
      ],
    },
    {
      name: 'Drill Shell',
      effectTemplate: 'Ore output +{output}% when working a Mining job.',
      effectValues: {
        output: { 4: 46.56, 5: 47.25 },
      },
      ascensionEffects: [
        'Output +5%',
        'Output +10%',
        'Output +15%',
        'Output +20%',
        'Output +30%',
      ],
    },
    {
      name: 'Sturdy',
      effectTemplate: 'Gains +{boost}% Total Attack, Defense, and HP.',
      effectValues: {
        boost: { 30: 10 },
      },
      ascensionEffects: [],
    },
  ],
  thunderclawd: [
    {
      name: 'Thunderstrike',
      effectTemplate:
        'Deals {damage}% damage to the closest enemy target and all enemies near it.',
      effectValues: {
        damage: { 4: 93, 5: 93.96 },
      },
      ascensionEffects: [
        'Damage +20%',
        'Damage +45%',
        'Damage +70%',
        'Damage +100%',
        'Damage +150%',
      ],
    },
    {
      name: 'Dark Cloud',
      effectTemplate:
        'Rises up in the air and unleashes a thunderstorm, striking 4 random enemies for {damage}% damage.',
      effectValues: {
        damage: { 4: 712.5, 5: 724.82 },
      },
      ascensionEffects: [
        'Damage +20%',
        'Damage +45%',
        'Damage +70%',
        'Damage +100%',
        'Damage +150%',
      ],
    },
    {
      name: 'Ionized',
      effectTemplate: 'Electricity output +{output}% when working a Charging job.',
      effectValues: {
        output: { 4: 43.11, 5: 43.8 },
      },
      ascensionEffects: [
        'Output +5%',
        'Output +10%',
        'Output +15%',
        'Output +20%',
        'Output +30%',
      ],
    },
    {
      name: 'Sturdy',
      effectTemplate: 'Gains +{boost}% Total Attack, Defense, and HP.',
      effectValues: {
        boost: { 30: 10 },
      },
      ascensionEffects: [],
    },
  ],
  vulcanid: [
    {
      name: 'Blazing Bite',
      effectTemplate: 'Deals {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 4: 200, 5: 202.06 },
      },
      ascensionEffects: [
        'Damage +20%',
        'Damage +45%',
        'Damage +70%',
        'Damage +100%',
        'Damage +150%',
      ],
    },
    {
      name: 'Trial By Fire',
      effectTemplate: 'Deals {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 4: 1416.45, 5: 1440.85 },
      },
      ascensionEffects: [
        'Damage +20%',
        'Damage +45%',
        'Damage +70%',
        'Damage +100%',
        'Damage +150%',
      ],
    },
    {
      name: 'Hot Diggity Dog',
      effectTemplate: 'Steel output +{output}% when working a Smelting job.',
      effectValues: {
        output: { 4: 46.56, 5: 47.25 },
      },
      ascensionEffects: [
        'Output +5%',
        'Output +10%',
        'Output +15%',
        'Output +20%',
        'Output +30%',
      ],
    },
    {
      name: 'Sturdy',
      effectTemplate: 'Gains +{boost}% Total Attack, Defense, and HP.',
      effectValues: {
        boost: { 30: 10 },
      },
      ascensionEffects: [],
    },
  ],
  woozard: [
    {
      name: 'Shroomshot',
      effectTemplate:
        'Fires a toxic spore, dealing {damage}% damage to a single enemy.',
      effectValues: {
        damage: { 2: 104, 3: 105.45 },
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
      name: 'Fungiburst',
      effectTemplate:
        'Fires 6 shrooms at the enemy with the highest Attack, dealing {damage}% total damage and reducing their Attack by 35% for 10s.',
      effectValues: {
        damage: { 2: 720.2, 3: 732.63 },
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
      name: 'Dragonesque',
      effectTemplate: 'Deals +{damage}% damage while in battle.',
      effectValues: {
        damage: { 2: 12, 3: 12.35 },
      },
      ascensionEffects: [
        'Final Damage +2%',
        'Final Damage +4%',
        'Final Damage +6%',
        'Final Damage +8%',
        'Final Damage +10%',
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

