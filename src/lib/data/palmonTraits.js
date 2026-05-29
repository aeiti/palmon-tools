// Breeding-trait catalog. The in-game Trait Filter splits traits into two
// tabs — Combat and Work — and each trait shows up at one or more grades
// (S/A/B/C) with progressively weaker effects.
//
// Notes from the source screenshots:
//   * Combat traits don't reuse names across grades — each (combat, grade)
//     slot has a unique name (Heartless A, Mean B, Softie C, etc.).
//   * Work traits *do* reuse names across S/A/B for the common families
//     (Caffeinated, Light Eater, Sweet Dreams, Comfy, Alchemist, etc.).
//   * Within a single (work, grade) bucket there can also be multiple
//     traits hitting the same stat at different magnitudes — e.g. B-grade
//     Charging output: E-Conductor +3% alongside Battery Pack +5%.
//   * `grades` only contains the grades that exist for that trait.

export const TRAIT_GRADES = ['S', 'A', 'B', 'C'];
export const TRAIT_CATEGORIES = ['combat', 'work'];

export const PALMON_TRAITS = {
  alchemist: {
    name: 'Alchemist',
    category: 'work',
    grades: {
      S: 'Magicking output +8%',
      A: 'Magicking output +5%',
      B: 'Magicking output +2%',
    },
  },
  anvilAdept: {
    name: 'Anvil Adept',
    category: 'work',
    grades: {
      B: 'Smelting output +5%',
    },
  },
  batteryPack: {
    name: 'Battery Pack',
    category: 'work',
    grades: {
      B: 'Charging output +5%',
    },
  },
  bellowFellow: {
    name: 'Bellow Fellow',
    category: 'work',
    grades: {
      A: 'Smelting output +10%',
    },
  },
  belligerent: {
    name: 'Belligerent',
    category: 'combat',
    grades: {
      S: 'Attack +7%',
    },
  },
  blessed: {
    name: 'Blessed',
    category: 'combat',
    grades: {
      A: 'Crit Rate +8%',
    },
  },
  brutal: {
    name: 'Brutal',
    category: 'combat',
    grades: {
      A: 'Crit Damage +4%',
    },
  },
  caffeinated: {
    name: 'Caffeinated',
    category: 'work',
    grades: {
      S: 'Energy gauge depletes 50% slower',
      A: 'Energy gauge depletes 25% slower',
      B: 'Energy gauge depletes 10% slower',
    },
  },
  clearHeaded: {
    name: 'Clear-Headed',
    category: 'combat',
    grades: {
      S: 'Stun Resist +7%',
    },
  },
  coach: {
    name: 'Coach',
    category: 'work',
    grades: {
      S: 'Training time -8% when assigned to Training.',
      A: 'Training time -4% when assigned to Training.',
      B: 'Training time -2% when assigned to Training.',
    },
  },
  combative: {
    name: 'Combative',
    category: 'combat',
    grades: {
      A: 'Attack +4%',
    },
  },
  comfy: {
    name: 'Comfy',
    category: 'work',
    grades: {
      S: 'XP gained per second +3 when sleeping on a Palmon Bed',
      A: 'XP gained per second +2 when sleeping on a Palmon Bed',
      B: 'XP gained per second +1 when sleeping on a Palmon Bed',
    },
  },
  crackShot: {
    name: 'Crack Shot',
    category: 'combat',
    grades: {
      A: 'Accuracy +2.5%',
    },
  },
  deadeye: {
    name: 'Deadeye',
    category: 'combat',
    grades: {
      A: 'Accuracy +8%',
    },
  },
  diamondSkull: {
    name: 'Diamond Skull',
    category: 'combat',
    grades: {
      A: 'Crit Damage Reduction +15%',
    },
  },
  dreamiumHunter: {
    name: 'Dreamium Hunter',
    category: 'work',
    grades: {
      S: 'Dreamium output +8%',
      A: 'Dreamium output +5%',
      B: 'Dreamium output +2%',
    },
  },
  durable: {
    name: 'Durable',
    category: 'combat',
    grades: {
      B: 'HP +2%',
    },
  },
  eConductor: {
    name: 'E-Conductor',
    category: 'work',
    grades: {
      B: 'Charging output +3%',
    },
  },
  electricFrenzy: {
    name: 'Electric Frenzy',
    category: 'work',
    grades: {
      S: 'Charging output +15%',
    },
  },
  elusive: {
    name: 'Elusive',
    category: 'combat',
    grades: {
      S: 'Evasion +5%',
    },
  },
  embattled: {
    name: 'Embattled',
    category: 'combat',
    grades: {
      C: 'Stun Resist -5%',
    },
  },
  energetic: {
    name: 'Energetic',
    category: 'combat',
    grades: {
      A: 'HP +4%',
    },
  },
  energySaver: {
    name: 'Energy Saver',
    category: 'work',
    grades: {
      C: 'Charging output -5%',
    },
  },
  fabergeJaw: {
    name: 'Fabergé Jaw',
    category: 'combat',
    grades: {
      C: 'Crit Damage Reduction -3%',
    },
  },
  favored: {
    name: 'Favored',
    category: 'combat',
    grades: {
      A: 'Crit Rate +2.5%',
    },
  },
  fleetFooted: {
    name: 'Fleet-Footed',
    category: 'work',
    grades: {
      A: 'Move Speed +5%',
    },
  },
  forgeFanatic: {
    name: 'Forge Fanatic',
    category: 'work',
    grades: {
      S: 'Smelting output +30%',
    },
  },
  fortunate: {
    name: 'Fortunate',
    category: 'combat',
    grades: {
      S: 'Crit Rate +5%',
    },
  },
  fumbling: {
    name: 'Fumbling',
    category: 'combat',
    grades: {
      C: 'Evasion -2%',
    },
  },
  generous: {
    name: 'Generous',
    category: 'work',
    grades: {
      A: 'Dismissal rewards +50%',
    },
  },
  gunner: {
    name: 'Gunner',
    category: 'combat',
    grades: {
      B: 'Accuracy +1.5%',
    },
  },
  hardy: {
    name: 'Hardy',
    category: 'combat',
    grades: {
      A: 'Tenacity +2.5%',
    },
  },
  healingTouch: {
    name: 'Healing Touch',
    category: 'work',
    grades: {
      S: 'Healing time -8% when assigned to Healing.',
      A: 'Healing time -4% when assigned to Healing.',
      B: 'Healing time -2% when assigned to Healing.',
    },
  },
  heartless: {
    name: 'Heartless',
    category: 'combat',
    grades: {
      A: 'Crit Damage +15%',
    },
  },
  hostile: {
    name: 'Hostile',
    category: 'combat',
    grades: {
      B: 'Attack +2%',
    },
  },
  ironSkull: {
    name: 'Iron Skull',
    category: 'combat',
    grades: {
      A: 'Crit Damage Reduction +4%',
    },
  },
  ironWill: {
    name: 'Iron Will',
    category: 'combat',
    grades: {
      A: 'Tenacity +8%',
    },
  },
  jinxed: {
    name: 'Jinxed',
    category: 'combat',
    grades: {
      C: 'Crit Rate -2%',
    },
  },
  lightEater: {
    name: 'Light Eater',
    category: 'work',
    grades: {
      S: 'Hunger gauge depletes 50% slower',
      A: 'Hunger gauge depletes 25% slower',
      B: 'Hunger gauge depletes 10% slower',
    },
  },
  lightningAffinity: {
    name: 'Lightning Affinity',
    category: 'work',
    grades: {
      A: 'Charging output +10%',
    },
  },
  lucky: {
    name: 'Lucky',
    category: 'combat',
    grades: {
      B: 'Crit Rate +1.5%',
    },
  },
  mean: {
    name: 'Mean',
    category: 'combat',
    grades: {
      B: 'Crit Damage +3%',
    },
  },
  myopic: {
    name: 'Myopic',
    category: 'combat',
    grades: {
      C: 'Accuracy -2%',
    },
  },
  nimble: {
    name: 'Nimble',
    category: 'combat',
    grades: {
      B: 'Evasion +1.5%',
    },
  },
  pacifist: {
    name: 'Pacifist',
    category: 'combat',
    grades: {
      C: 'Attack -4%',
    },
  },
  prodigy: {
    name: 'Prodigy',
    category: 'work',
    grades: {
      S: 'Research time -900s when assigned to Analyzing.',
      A: 'Research time -300s when assigned to Analyzing.',
      B: 'Research time -120s when assigned to Analyzing.',
    },
  },
  pushover: {
    name: 'Pushover',
    category: 'combat',
    grades: {
      C: 'Defense -4%',
    },
  },
  resolute: {
    name: 'Resolute',
    category: 'combat',
    grades: {
      A: 'Defense +4%',
    },
  },
  robust: {
    name: 'Robust',
    category: 'combat',
    grades: {
      S: 'HP +7%',
    },
  },
  rooted: {
    name: 'Rooted',
    category: 'combat',
    grades: {
      B: 'Defense +2%',
    },
  },
  ruthless: {
    name: 'Ruthless',
    category: 'combat',
    grades: {
      S: 'Crit Damage +8%',
    },
  },
  sawSavant: {
    name: 'Saw Savant',
    category: 'work',
    grades: {
      A: 'Sawing output +10%',
    },
  },
  sawdustAllergy: {
    name: 'Sawdust Allergy',
    category: 'work',
    grades: {
      C: 'Sawing output -5%',
    },
  },
  sharpshooter: {
    name: 'Sharpshooter',
    category: 'combat',
    grades: {
      S: 'Accuracy +5%',
    },
  },
  sickly: {
    name: 'Sickly',
    category: 'combat',
    grades: {
      C: 'HP -4%',
    },
  },
  slippery: {
    name: 'Slippery',
    category: 'combat',
    grades: {
      A: 'Evasion +2.5%',
    },
  },
  sluggard: {
    name: 'Sluggard',
    category: 'work',
    grades: {
      C: 'Move Speed -10%',
    },
  },
  softie: {
    name: 'Softie',
    category: 'combat',
    grades: {
      C: 'Crit Damage -3%',
    },
  },
  sootAllergy: {
    name: 'Soot Allergy',
    category: 'work',
    grades: {
      C: 'Smelting output -5%',
    },
  },
  spineless: {
    name: 'Spineless',
    category: 'combat',
    grades: {
      C: 'Tenacity -2%',
    },
  },
  steadfast: {
    name: 'Steadfast',
    category: 'combat',
    grades: {
      S: 'Defense +7%',
    },
  },
  steady: {
    name: 'Steady',
    category: 'combat',
    grades: {
      A: 'Stun Resist +5%',
    },
  },
  steelSkull: {
    name: 'Steel Skull',
    category: 'combat',
    grades: {
      S: 'Crit Damage Reduction +8%',
    },
  },
  stoneSkull: {
    name: 'Stone Skull',
    category: 'combat',
    grades: {
      B: 'Crit Damage Reduction +3%',
    },
  },
  stubborn: {
    name: 'Stubborn',
    category: 'combat',
    grades: {
      B: 'Tenacity +1.5%',
    },
  },
  supersonic: {
    name: 'Supersonic',
    category: 'work',
    grades: {
      S: 'Move Speed +10%',
    },
  },
  sweetDreams: {
    name: 'Sweet Dreams',
    category: 'work',
    grades: {
      S: 'XP gained +15% when sleeping on a Palmon Bed',
      A: 'XP gained +10% when sleeping on a Palmon Bed',
      B: 'XP gained +5% when sleeping on a Palmon Bed',
    },
  },
  temperate: {
    name: 'Temperate',
    category: 'work',
    grades: {
      S: 'Food consumption -50% when eating',
      A: 'Food consumption -25% when eating',
      B: 'Food consumption -10% when eating',
    },
  },
  turboBuilder: {
    name: 'Turbo Builder',
    category: 'work',
    grades: {
      S: 'Construction time -900s when assigned to Building.',
      A: 'Construction time -300s when assigned to Building.',
      B: 'Construction time -120s when assigned to Building.',
    },
  },
  unshakeable: {
    name: 'Unshakeable',
    category: 'combat',
    grades: {
      A: 'Defense +10%',
    },
  },
  unyielding: {
    name: 'Unyielding',
    category: 'combat',
    grades: {
      S: 'Tenacity +5%',
    },
  },
  vigorous: {
    name: 'Vigorous',
    category: 'combat',
    grades: {
      A: 'HP +10%',
    },
  },
  warlike: {
    name: 'Warlike',
    category: 'combat',
    grades: {
      A: 'Attack +10%',
    },
  },
  woodWhiz: {
    name: 'Wood Whiz',
    category: 'work',
    grades: {
      S: 'Sawing output +30%',
    },
  },
  workshopper: {
    name: 'Workshopper',
    category: 'work',
    grades: {
      B: 'Sawing output +5%',
    },
  },
};
