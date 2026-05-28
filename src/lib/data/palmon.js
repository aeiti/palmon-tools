// Palmon catalog data. Pure facts about elements, rarities, species, and
// the various caps / slot counts the game enforces. Edit this file when the
// in-game catalog changes. State helpers (empty/normalize, squad, display)
// live in src/lib/palmon.js.

export const MAX_PALMON_LEVEL = 300;
export const MAX_SKILL_LEVEL = 30;
export const STAR_LEVELS = 5;
export const SUB_STAR_LEVELS = 5;
export const SQUAD_COUNT = 4;
export const MAX_PALMON_PER_SQUAD = 7;
export const SKILL_SLOTS = 4;
export const TRAIT_SLOTS = 4;
export const EQUIPMENT_SLOTS = 4;

export const ELEMENTS = [
  { key: 'fire', label: 'Fire' },
  { key: 'water', label: 'Water' },
  { key: 'earth', label: 'Earth' },
  { key: 'electric', label: 'Electric' },
];

export const RARITIES = [
  { key: 'sr', label: 'SR' },
  { key: 'ssr', label: 'SSR' },
  { key: 'ur', label: 'UR' },
];

export const PALMON_SPECIES = [
  { key: 'abuzzinian', name: 'Abuzzinian', element: 'electric', rarity: 'ur' },
  { key: 'auktyke', name: 'Auktyke', element: 'water', rarity: 'sr' },
  { key: 'baboom', name: 'Baboom', element: 'earth', rarity: 'ur' },
  { key: 'barkplug', name: 'Barkplug', element: 'electric', rarity: 'ur' },
  { key: 'battereina', name: 'Battereina', element: 'electric', rarity: 'ur' },
  { key: 'blazeal', name: 'Blazeal', element: 'fire', rarity: 'ur' },
  { key: 'bruiseberry', name: 'Bruiseberry', element: 'earth', rarity: 'sr' },
  { key: 'cerverdant', name: 'Cerverdant', element: 'earth', rarity: 'ssr' },
  { key: 'dolphriend', name: 'Dolphriend', element: 'water', rarity: 'ur' },
  { key: 'emboa', name: 'Emboa', element: 'fire', rarity: 'sr' },
  { key: 'escarffier', name: 'Escarffier', element: 'fire', rarity: 'ur' },
  { key: 'fingenue', name: 'Fingenue', element: 'water', rarity: 'ur' },
  { key: 'flouffant', name: 'Flouffant', element: 'earth', rarity: 'sr' },
  { key: 'fulgairy', name: 'Fulgairy', element: 'electric', rarity: 'ur' },
  { key: 'ghillant', name: 'Ghillant', element: 'earth', rarity: 'ur' },
  { key: 'glacewing', name: 'Glacewing', element: 'water', rarity: 'ur', mythical: true },
  { key: 'gnashley', name: 'Gnashley', element: 'water', rarity: 'ur' },
  { key: 'graffitty', name: 'Graffitty', element: 'earth', rarity: 'sr' },
  { key: 'herculeaf', name: 'Herculeaf', element: 'earth', rarity: 'sr' },
  { key: 'hoofrit', name: 'Hoofrit', element: 'fire', rarity: 'ur' },
  { key: 'incineraptor', name: 'Incineraptor', element: 'fire', rarity: 'ssr' },
  { key: 'kilohopp', name: 'Kilohopp', element: 'electric', rarity: 'sr' },
  { key: 'kungpaw', name: 'Kungpaw', element: 'water', rarity: 'ur' },
  { key: 'lendanear', name: 'Lendanear', element: 'water', rarity: 'sr' },
  { key: 'limudroid', name: 'Limudroid', element: 'electric', rarity: 'ur' },
  { key: 'lucidina', name: 'Lucidina', element: 'water', rarity: 'ur' },
  { key: 'magmolin', name: 'Magmolin', element: 'fire', rarity: 'ur' },
  { key: 'mantleray', name: 'Mantleray', element: 'electric', rarity: 'ur' },
  { key: 'maximito', name: 'Maximito', element: 'electric', rarity: 'sr' },
  { key: 'meowdame', name: 'Meowdame', element: 'water', rarity: 'ssr' },
  { key: 'ninjump', name: 'Ninjump', element: 'water', rarity: 'ur' },
  { key: 'oleana', name: 'Oleana', element: 'earth', rarity: 'ur' },
  { key: 'pipistrigoi', name: 'Pipistrigoi', element: 'fire', rarity: 'ur' },
  { key: 'platyputz', name: 'Platyputz', element: 'water', rarity: 'ssr' },
  { key: 'plunderjaw', name: 'Plunderjaw', element: 'water', rarity: 'ur', mythical: true },
  { key: 'regalion', name: 'Regalion', element: 'water', rarity: 'ur' },
  { key: 'revontulet', name: 'Revontulet', element: 'fire', rarity: 'ur' },
  { key: 'rootwarden', name: 'Rootwarden', element: 'earth', rarity: 'ur', mythical: true },
  { key: 'salamantis', name: 'Salamantis', element: 'earth', rarity: 'ur' },
  { key: 'snowkami', name: 'Snowkami', element: 'water', rarity: 'ssr' },
  { key: 'spinchilla', name: 'Spinchilla', element: 'earth', rarity: 'sr' },
  { key: 'spookaboo', name: 'Spookaboo', element: 'fire', rarity: 'ur' },
  { key: 'squeezel', name: 'Squeezel', element: 'water', rarity: 'ssr' },
  { key: 'statchew', name: 'Statchew', element: 'earth', rarity: 'ur' },
  { key: 'surveilynx', name: 'Surveilynx', element: 'earth', rarity: 'ur' },
  { key: 'terrastudo', name: 'Terrastudo', element: 'earth', rarity: 'ssr' },
  { key: 'thunderclawd', name: 'Thunderclawd', element: 'electric', rarity: 'ssr' },
  { key: 'vulcanid', name: 'Vulcanid', element: 'fire', rarity: 'sr' },
  { key: 'woozard', name: 'Woozard', element: 'earth', rarity: 'ur' },
  { key: 'wyvierno', name: 'Wyvierno', element: 'electric', rarity: 'sr' },
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

export function placeholderEquipmentName(slotIndex) {
  return `Equipment ${slotIndex + 1}`;
}
