// Palmon catalog data. Pure facts about elements, rarities, species, and
// the various caps / slot counts the game enforces. Edit this file when the
// in-game catalog changes. State helpers (empty/normalize, squad, display)
// live in src/lib/palmon.js.

export const MAX_PALMON_LEVEL = 300;
export const MAX_SKILL_LEVEL = 30;
export const STAR_LEVELS = 5;
export const SUB_STAR_LEVELS = 4;
export const SQUAD_COUNT = 4;
export const MAX_PALMON_PER_SQUAD = 7;
export const SKILL_SLOTS = 4;
export const TRAIT_SLOTS = 4;
export const EQUIPMENT_SLOTS = 4;
export const MAX_EVOLUTION_STAGE = 4;

export const ELEMENTS = [
  { key: 'fire', label: 'Fire' },
  { key: 'water', label: 'Water' },
  { key: 'earth', label: 'Earth' },
  { key: 'electric', label: 'Electric' },
];

export const RARITIES = [
  { key: 'SR', label: 'SR' },
  { key: 'SSR', label: 'SSR' },
  { key: 'UR', label: 'UR' },
];

export const PALMON_SPECIES = [
  { key: 'abuzzinian', name: 'Abuzzinian', element: 'electric', rarity: 'UR' },
  { key: 'auktyke', name: 'Auktyke', element: 'water', rarity: 'SR' },
  { key: 'axollium', name: 'Axollium', element: 'earth', rarity: 'SSR' },
  { key: 'baboom', name: 'Baboom', element: 'earth', rarity: 'UR' },
  { key: 'barkplug', name: 'Barkplug', element: 'electric', rarity: 'UR' },
  { key: 'battereina', name: 'Battereina', element: 'electric', rarity: 'UR' },
  { key: 'blazeal', name: 'Blazeal', element: 'fire', rarity: 'UR' },
  { key: 'bruiseberry', name: 'Bruiseberry', element: 'earth', rarity: 'SSR' },
  { key: 'cerverdant', name: 'Cerverdant', element: 'earth', rarity: 'SSR' },
  { key: 'dolphriend', name: 'Dolphriend', element: 'water', rarity: 'UR' },
  { key: 'embergeist', name: 'Embergeist', element: 'fire', rarity: 'UR', mythical: true },
  { key: 'emboa', name: 'Emboa', element: 'fire', rarity: 'SR' },
  { key: 'escarffier', name: 'Escarffier', element: 'fire', rarity: 'UR' },
  { key: 'fingenue', name: 'Fingenue', element: 'water', rarity: 'UR' },
  { key: 'flouffant', name: 'Flouffant', element: 'earth', rarity: 'SR' },
  { key: 'fulgairy', name: 'Fulgairy', element: 'electric', rarity: 'UR' },
  { key: 'ghillant', name: 'Ghillant', element: 'earth', rarity: 'UR' },
  { key: 'glacewing', name: 'Glacewing', element: 'water', rarity: 'UR', mythical: true },
  { key: 'gnashley', name: 'Gnashley', element: 'water', rarity: 'UR' },
  { key: 'graffitty', name: 'Graffitty', element: 'earth', rarity: 'SR' },
  { key: 'herculeaf', name: 'Herculeaf', element: 'earth', rarity: 'SR' },
  { key: 'hexkit', name: 'Hexkit', element: 'fire', rarity: 'UR', mythical: true },
  { key: 'hoofrit', name: 'Hoofrit', element: 'fire', rarity: 'UR' },
  { key: 'incineraptor', name: 'Incineraptor', element: 'fire', rarity: 'SSR' },
  { key: 'kilohopp', name: 'Kilohopp', element: 'electric', rarity: 'SR' },
  { key: 'kungpaw', name: 'Kungpaw', element: 'water', rarity: 'UR' },
  { key: 'lendanear', name: 'Lendanear', element: 'water', rarity: 'SSR' },
  { key: 'limudroid', name: 'Limudroid', element: 'electric', rarity: 'UR' },
  { key: 'lucidina', name: 'Lucidina', element: 'water', rarity: 'UR' },
  { key: 'magmolin', name: 'Magmolin', element: 'fire', rarity: 'UR' },
  { key: 'mammolith', name: 'Mammolith', element: 'earth', rarity: 'UR', mythical: true },
  { key: 'mantleray', name: 'Mantleray', element: 'electric', rarity: 'UR' },
  { key: 'maximito', name: 'Maximito', element: 'water', rarity: 'SSR' },
  { key: 'meowdame', name: 'Meowdame', element: 'water', rarity: 'SSR' },
  { key: 'ninjump', name: 'Ninjump', element: 'water', rarity: 'UR' },
  { key: 'oleana', name: 'Oleana', element: 'earth', rarity: 'UR' },
  { key: 'pipistrigoi', name: 'Pipistrigoi', element: 'fire', rarity: 'UR' },
  { key: 'platyputz', name: 'Platyputz', element: 'water', rarity: 'SSR' },
  { key: 'plunderjaw', name: 'Plunderjaw', element: 'water', rarity: 'UR', mythical: true },
  { key: 'regalion', name: 'Regalion', element: 'water', rarity: 'UR' },
  { key: 'revontulet', name: 'Revontulet', element: 'fire', rarity: 'UR' },
  { key: 'rootwarden', name: 'Rootwarden', element: 'earth', rarity: 'UR', mythical: true },
  { key: 'rotorlotor', name: 'Rotorlotor', element: 'electric', rarity: 'SSR' },
  { key: 'salamantis', name: 'Salamantis', element: 'earth', rarity: 'UR' },
  { key: 'snowkami', name: 'Snowkami', element: 'water', rarity: 'SSR' },
  { key: 'spinchilla', name: 'Spinchilla', element: 'earth', rarity: 'SR' },
  { key: 'spookaboo', name: 'Spookaboo', element: 'fire', rarity: 'UR' },
  { key: 'squeezel', name: 'Squeezel', element: 'water', rarity: 'SSR' },
  { key: 'statchew', name: 'Statchew', element: 'earth', rarity: 'UR' },
  { key: 'surveilynx', name: 'Surveilynx', element: 'earth', rarity: 'UR' },
  { key: 'terrastudo', name: 'Terrastudo', element: 'earth', rarity: 'SSR' },
  { key: 'thunderclawd', name: 'Thunderclawd', element: 'electric', rarity: 'SSR' },
  { key: 'thundertooth', name: 'Thundertooth', element: 'electric', rarity: 'UR', mythical: true },
  { key: 'voltbolt', name: 'Voltbolt', element: 'electric', rarity: 'SSR' },
  { key: 'vulcanid', name: 'Vulcanid', element: 'fire', rarity: 'SSR' },
  { key: 'woozard', name: 'Woozard', element: 'earth', rarity: 'UR' },
  { key: 'wyvierno', name: 'Wyvierno', element: 'fire', rarity: 'SSR' },
  { key: 'zapantis', name: 'Zapantis', element: 'electric', rarity: 'UR', mythical: true },
];

export const PALMON_SPECIES_BY_KEY = PALMON_SPECIES.reduce((acc, s) => {
  acc[s.key] = s;
  return acc;
}, {});

export const ELEMENT_BY_KEY = ELEMENTS.reduce((acc, e) => {
  acc[e.key] = e;
  return acc;
}, {});

export const RARITY_BY_KEY = RARITIES.reduce((acc, r) => {
  acc[r.key] = r;
  return acc;
}, {});

// Catalog lookups / placeholder formatters (no palmon state, just catalog).

export function palmonSpeciesName(speciesKey) {
  return PALMON_SPECIES_BY_KEY[speciesKey]?.name || '';
}

export function placeholderSkillName(slotIndex) {
  return `Skill ${slotIndex + 1}`;
}

export function placeholderTraitName(slotIndex) {
  return `Trait ${slotIndex + 1}`;
}
