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
  { key: 'r', label: 'R' },
  { key: 'sr', label: 'SR' },
  { key: 'ur', label: 'UR' },
  { key: 'mythical', label: 'Mythical' },
];

export const PALMON_SPECIES = [
  { key: 'abuzzinian', name: 'Abuzzinian', element: 'electric', rarity: 'ur' },
  { key: 'auktyke', name: 'Auktyke', element: 'water', rarity: 'sr' },
  { key: 'baboom', name: 'Baboom', element: 'earth', rarity: 'ur' },
  { key: 'barkplug', name: 'Barkplug', element: 'electric', rarity: 'ur' },
  { key: 'battereina', name: 'Battereina', element: 'electric', rarity: 'ur' },
  { key: 'blazeal', name: 'Blazeal', element: 'fire', rarity: 'ur' },
  { key: 'bruiseberry', name: 'Bruiseberry', element: 'earth', rarity: 'sr' },
  { key: 'cerverdant', name: 'Cerverdant', element: 'earth', rarity: 'sr' },
  { key: 'dolphriend', name: 'Dolphriend', element: 'water', rarity: 'ur' },
  { key: 'emboa', name: 'Emboa', element: 'fire', rarity: 'sr' },
  { key: 'fingenue', name: 'Fingenue', element: 'water', rarity: 'ur' },
  { key: 'flouffant', name: 'Flouffant', element: 'earth', rarity: 'sr' },
  { key: 'ghillant', name: 'Ghillant', element: 'earth', rarity: 'ur' },
  { key: 'glacewing', name: 'Glacewing', element: 'water', rarity: 'mythical' },
  { key: 'gnashley', name: 'Gnashley', element: 'water', rarity: 'ur' },
  { key: 'graffitty', name: 'Graffitty', element: 'earth', rarity: 'sr' },
  { key: 'herculeaf', name: 'Herculeaf', element: 'earth', rarity: 'sr' },
  { key: 'hoofrit', name: 'Hoofrit', element: 'fire', rarity: 'ur' },
  { key: 'incineraptor', name: 'Incineraptor', element: 'fire', rarity: 'ur' },
  { key: 'kilohopp', name: 'Kilohopp', element: 'electric', rarity: 'sr' },
  { key: 'lendanear', name: 'Lendanear', element: 'water', rarity: 'sr' },
  { key: 'lucidina', name: 'Lucidina', element: 'water', rarity: 'ur' },
  { key: 'magmolin', name: 'Magmolin', element: 'fire', rarity: 'ur' },
  { key: 'mantleray', name: 'Mantleray', element: 'electric', rarity: 'ur' },
  { key: 'maximito', name: 'Maximito', element: 'electric', rarity: 'sr' },
  { key: 'meowdame', name: 'Meowdame', element: 'water', rarity: 'ur' },
  { key: 'ninjump', name: 'Ninjump', element: 'water', rarity: 'ur' },
  { key: 'platyputz', name: 'Platyputz', element: 'water', rarity: 'sr' },
  { key: 'plunderjaw', name: 'Plunderjaw', element: 'water', rarity: 'mythical' },
  { key: 'regalion', name: 'Regalion', element: 'water', rarity: 'ur' },
  { key: 'rootwarden', name: 'Rootwarden', element: 'earth', rarity: 'mythical' },
  { key: 'snowkami', name: 'Snowkami', element: 'water', rarity: 'ur' },
  { key: 'spinchilla', name: 'Spinchilla', element: 'earth', rarity: 'sr' },
  { key: 'squeezel', name: 'Squeezel', element: 'water', rarity: 'ur' },
  { key: 'statchew', name: 'Statchew', element: 'earth', rarity: 'ur' },
  { key: 'surveilynx', name: 'Surveilynx', element: 'earth', rarity: 'ur' },
  { key: 'terrastudo', name: 'Terrastudo', element: 'earth', rarity: 'ur' },
  { key: 'thunderclawd', name: 'Thunderclawd', element: 'electric', rarity: 'ur' },
  { key: 'vulcanid', name: 'Vulcanid', element: 'fire', rarity: 'sr' },
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

export function placeholderSkillName(slotIndex) {
  return `Skill ${slotIndex + 1}`;
}

export function placeholderTraitName(slotIndex) {
  return `Trait ${slotIndex + 1}`;
}

export function placeholderEquipmentName(slotIndex) {
  return `Equipment ${slotIndex + 1}`;
}

function makeId() {
  return `pm_${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyPalmon(speciesKey) {
  return {
    id: makeId(),
    speciesKey: speciesKey || '',
    nickname: '',
    level: 0,
    star: 1,
    subStar: 1,
    squad: null,
    equipment: Array.from({ length: EQUIPMENT_SLOTS }, () => ''),
    skills: Array.from({ length: SKILL_SLOTS }, () => ({ level: 0 })),
    traits: Array.from({ length: TRAIT_SLOTS }, () => ''),
  };
}

function clampInt(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function clampOptionalInt(value, min, max) {
  if (value === null || value === undefined || value === '') return 0;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function clampSquad(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > SQUAD_COUNT) return null;
  return Math.floor(n);
}

function padArray(arr, length, fill) {
  const out = Array.from({ length }, (_, i) => {
    const v = Array.isArray(arr) ? arr[i] : undefined;
    return fill(v, i);
  });
  return out;
}

export function normalizePalmon(palmon) {
  if (!palmon || typeof palmon !== 'object') return null;
  const speciesKey =
    typeof palmon.speciesKey === 'string' &&
    PALMON_SPECIES_BY_KEY[palmon.speciesKey]
      ? palmon.speciesKey
      : '';
  if (!speciesKey) return null;
  return {
    id: typeof palmon.id === 'string' && palmon.id ? palmon.id : makeId(),
    speciesKey,
    nickname:
      typeof palmon.nickname === 'string' ? palmon.nickname.trim() : '',
    level: clampOptionalInt(palmon.level, 0, MAX_PALMON_LEVEL),
    star: clampInt(palmon.star, 1, STAR_LEVELS),
    subStar: clampInt(palmon.subStar, 1, SUB_STAR_LEVELS),
    squad: clampSquad(palmon.squad),
    equipment: padArray(palmon.equipment, EQUIPMENT_SLOTS, (v) =>
      typeof v === 'string' ? v.trim() : '',
    ),
    skills: padArray(palmon.skills, SKILL_SLOTS, (v) => ({
      level: clampOptionalInt(v?.level, 0, MAX_SKILL_LEVEL),
    })),
    traits: padArray(palmon.traits, TRAIT_SLOTS, (v) =>
      typeof v === 'string' ? v.trim() : '',
    ),
  };
}

export function normalizePalmonList(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const norm = normalizePalmon(item);
    if (!norm) continue;
    if (seen.has(norm.id)) norm.id = makeId();
    seen.add(norm.id);
    out.push(norm);
  }
  return out;
}

export function formatStarLevel(palmon) {
  if (!palmon) return '';
  return `${palmon.star}-${palmon.subStar}`;
}

export function palmonSpeciesName(speciesKey) {
  return PALMON_SPECIES_BY_KEY[speciesKey]?.name || '';
}

export function palmonDisplayName(palmon, allPalmons) {
  if (!palmon) return '';
  const nickname = (palmon.nickname || '').trim();
  if (nickname) return nickname;
  const species = palmonSpeciesName(palmon.speciesKey) || 'Palmon';
  const sameSpecies = (allPalmons || []).filter(
    (p) => p.speciesKey === palmon.speciesKey,
  );
  if (sameSpecies.length <= 1) return species;
  const index = sameSpecies.findIndex((p) => p.id === palmon.id);
  return `${species} #${index + 1}`;
}

export function palmonOptions(palmons) {
  return (palmons || []).map((p) => ({
    id: p.id,
    label: palmonDisplayName(p, palmons),
  }));
}

export function hasAnyPalmons(palmons) {
  return Array.isArray(palmons) && palmons.length > 0;
}

export function palmonsInSquad(palmons, squad) {
  if (!Array.isArray(palmons) || !squad) return [];
  return palmons.filter((p) => p.squad === squad);
}

export function squadIsFull(palmons, squad, excludeId) {
  const members = palmonsInSquad(palmons, squad).filter(
    (p) => p.id !== excludeId,
  );
  return members.length >= MAX_PALMON_PER_SQUAD;
}
