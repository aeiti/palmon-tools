// Breeding-trait catalog. Each trait can show up at multiple grades with
// progressively stronger effects; the `grades` map only contains the grades
// that actually exist for that trait in the in-game roster.
//
// Grades observed so far: S, A, B, C. The C tier only has Jinxed captured —
// more entries likely exist but aren't sourced yet.

export const TRAIT_GRADES = ['S', 'A', 'B', 'C'];

export const PALMON_TRAITS = {
  alchemist: {
    name: 'Alchemist',
    grades: {
      S: 'Magicking output +8%',
      A: 'Magicking output +5%',
      B: 'Magicking output +2%',
    },
  },
  anvilAdept: {
    name: 'Anvil Adept',
    grades: {
      B: 'Smelting output +5%',
    },
  },
  batteryPack: {
    name: 'Battery Pack',
    grades: {
      B: 'Charging output +5%',
    },
  },
  bellowFellow: {
    name: 'Bellow Fellow',
    grades: {
      A: 'Smelting output +10%',
    },
  },
  belligerent: {
    name: 'Belligerent',
    grades: {
      S: 'Attack +7%',
    },
  },
  blessed: {
    name: 'Blessed',
    grades: {
      A: 'Crit Rate +8%',
    },
  },
  brutal: {
    name: 'Brutal',
    grades: {
      A: 'Crit Damage +4%',
    },
  },
  caffeinated: {
    name: 'Caffeinated',
    grades: {
      S: 'Energy gauge depletes 50% slower',
      A: 'Energy gauge depletes 25% slower',
      B: 'Energy gauge depletes 10% slower',
    },
  },
  clearHeaded: {
    name: 'Clear-Headed',
    grades: {
      S: 'Stun Resist +7%',
    },
  },
  coach: {
    name: 'Coach',
    grades: {
      S: 'Training time -8% when assigned to Training.',
      A: 'Training time -4% when assigned to Training.',
      B: 'Training time -2% when assigned to Training.',
    },
  },
  combative: {
    name: 'Combative',
    grades: {
      A: 'Attack +4%',
    },
  },
  comfy: {
    name: 'Comfy',
    grades: {
      S: 'XP gained per second +3 when sleeping on a Palmon Bed',
      A: 'XP gained per second +2 when sleeping on a Palmon Bed',
      B: 'XP gained per second +1 when sleeping on a Palmon Bed',
    },
  },
  crackShot: {
    name: 'Crack Shot',
    grades: {
      A: 'Accuracy +2.5%',
    },
  },
  deadeye: {
    name: 'Deadeye',
    grades: {
      A: 'Accuracy +8%',
    },
  },
  diamondSkull: {
    name: 'Diamond Skull',
    grades: {
      A: 'Crit Damage Reduction +15%',
    },
  },
  dreamiumHunter: {
    name: 'Dreamium Hunter',
    grades: {
      S: 'Dreamium output +8%',
      A: 'Dreamium output +5%',
      B: 'Dreamium output +2%',
    },
  },
  durable: {
    name: 'Durable',
    grades: {
      B: 'HP +2%',
    },
  },
  eConductor: {
    name: 'E-Conductor',
    grades: {
      B: 'Charging output +3%',
    },
  },
  electricFrenzy: {
    name: 'Electric Frenzy',
    grades: {
      S: 'Charging output +15%',
    },
  },
  elusive: {
    name: 'Elusive',
    grades: {
      S: 'Evasion +5%',
    },
  },
  energetic: {
    name: 'Energetic',
    grades: {
      A: 'HP +4%',
    },
  },
  favored: {
    name: 'Favored',
    grades: {
      A: 'Crit Rate +2.5%',
    },
  },
  fleetFooted: {
    name: 'Fleet-Footed',
    grades: {
      A: 'Move Speed +5%',
    },
  },
  forgeFanatic: {
    name: 'Forge Fanatic',
    grades: {
      S: 'Smelting output +30%',
    },
  },
  fortunate: {
    name: 'Fortunate',
    grades: {
      S: 'Crit Rate +5%',
    },
  },
  gunner: {
    name: 'Gunner',
    grades: {
      B: 'Accuracy +1.5%',
    },
  },
  hardy: {
    name: 'Hardy',
    grades: {
      A: 'Tenacity +2.5%',
    },
  },
  healingTouch: {
    name: 'Healing Touch',
    grades: {
      S: 'Healing time -8% when assigned to Healing.',
      A: 'Healing time -4% when assigned to Healing.',
      B: 'Healing time -2% when assigned to Healing.',
    },
  },
  heartless: {
    name: 'Heartless',
    grades: {
      A: 'Crit Damage +15%',
    },
  },
  hostile: {
    name: 'Hostile',
    grades: {
      B: 'Attack +2%',
    },
  },
  ironSkull: {
    name: 'Iron Skull',
    grades: {
      A: 'Crit Damage Reduction +4%',
    },
  },
  ironWill: {
    name: 'Iron Will',
    grades: {
      A: 'Tenacity +8%',
    },
  },
  jinxed: {
    name: 'Jinxed',
    grades: {
      C: 'Crit Rate -2%',
    },
  },
  lightEater: {
    name: 'Light Eater',
    grades: {
      S: 'Hunger gauge depletes 50% slower',
      A: 'Hunger gauge depletes 25% slower',
      B: 'Hunger gauge depletes 10% slower',
    },
  },
  lightningAffinity: {
    name: 'Lightning Affinity',
    grades: {
      A: 'Charging output +10%',
    },
  },
  lucky: {
    name: 'Lucky',
    grades: {
      B: 'Crit Rate +1.5%',
    },
  },
  mean: {
    name: 'Mean',
    grades: {
      B: 'Crit Damage +3%',
    },
  },
  nimble: {
    name: 'Nimble',
    grades: {
      B: 'Evasion +1.5%',
    },
  },
  prodigy: {
    name: 'Prodigy',
    grades: {
      S: 'Research time -900s when assigned to Analyzing.',
      A: 'Research time -300s when assigned to Analyzing.',
      B: 'Research time -120s when assigned to Analyzing.',
    },
  },
  resolute: {
    name: 'Resolute',
    grades: {
      A: 'Defense +4%',
    },
  },
  robust: {
    name: 'Robust',
    grades: {
      S: 'HP +7%',
    },
  },
  rooted: {
    name: 'Rooted',
    grades: {
      B: 'Defense +2%',
    },
  },
  ruthless: {
    name: 'Ruthless',
    grades: {
      S: 'Crit Damage +8%',
    },
  },
  sawSavant: {
    name: 'Saw Savant',
    grades: {
      A: 'Sawing output +10%',
    },
  },
  sharpshooter: {
    name: 'Sharpshooter',
    grades: {
      S: 'Accuracy +5%',
    },
  },
  slippery: {
    name: 'Slippery',
    grades: {
      A: 'Evasion +2.5%',
    },
  },
  steadfast: {
    name: 'Steadfast',
    grades: {
      S: 'Defense +7%',
    },
  },
  steelSkull: {
    name: 'Steel Skull',
    grades: {
      S: 'Crit Damage Reduction +8%',
    },
  },
  stoneSkull: {
    name: 'Stone Skull',
    grades: {
      B: 'Crit Damage Reduction +3%',
    },
  },
  stubborn: {
    name: 'Stubborn',
    grades: {
      B: 'Tenacity +1.5%',
    },
  },
  supersonic: {
    name: 'Supersonic',
    grades: {
      S: 'Move Speed +10%',
    },
  },
  sweetDreams: {
    name: 'Sweet Dreams',
    grades: {
      S: 'XP gained +15% when sleeping on a Palmon Bed',
      B: 'XP gained +5% when sleeping on a Palmon Bed',
    },
  },
  turboBuilder: {
    name: 'Turbo Builder',
    grades: {
      S: 'Construction time -900s when assigned to Building.',
      A: 'Construction time -300s when assigned to Building.',
      B: 'Construction time -120s when assigned to Building.',
    },
  },
  unshakeable: {
    name: 'Unshakeable',
    grades: {
      A: 'Defense +10%',
    },
  },
  unyielding: {
    name: 'Unyielding',
    grades: {
      S: 'Tenacity +5%',
    },
  },
  vigorous: {
    name: 'Vigorous',
    grades: {
      A: 'HP +10%',
    },
  },
  warlike: {
    name: 'Warlike',
    grades: {
      A: 'Attack +10%',
    },
  },
  woodWhiz: {
    name: 'Wood Whiz',
    grades: {
      S: 'Sawing output +30%',
    },
  },
  workshopper: {
    name: 'Workshopper',
    grades: {
      B: 'Sawing output +5%',
    },
  },
};
