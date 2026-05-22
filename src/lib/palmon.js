export const MAX_PALMON_LEVEL = 300;
export const MAX_SKILL_LEVEL = 30;
export const STAR_LEVELS = 5;
export const SUB_STAR_LEVELS = 5;
export const SQUAD_COUNT = 4;
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
  { key: 'common', label: 'Common' },
  { key: 'rare', label: 'Rare' },
  { key: 'epic', label: 'Epic' },
  { key: 'legendary', label: 'Legendary' },
  { key: 'mythical', label: 'Mythical' },
];

export const PALMON_SPECIES = [
  { key: 'abuzzinian', name: 'Abuzzinian', element: 'electric' },
  { key: 'auktyke', name: 'Auktyke', element: 'water' },
  { key: 'baboom', name: 'Baboom', element: 'earth' },
  { key: 'barkplug', name: 'Barkplug', element: 'electric' },
  { key: 'battereina', name: 'Battereina', element: 'electric' },
  { key: 'blazeal', name: 'Blazeal', element: 'fire' },
  { key: 'bruiseberry', name: 'Bruiseberry', element: 'earth' },
  { key: 'cerverdant', name: 'Cerverdant', element: 'earth' },
  { key: 'dolphriend', name: 'Dolphriend', element: 'water' },
  { key: 'emboa', name: 'Emboa', element: 'fire' },
  { key: 'fingenue', name: 'Fingenue', element: 'water' },
  { key: 'flouffant', name: 'Flouffant', element: 'earth' },
  { key: 'ghillant', name: 'Ghillant', element: 'earth' },
  { key: 'glacewing', name: 'Glacewing', element: 'water', rarity: 'mythical' },
  { key: 'gnashley', name: 'Gnashley', element: 'water' },
  { key: 'graffitty', name: 'Graffitty', element: 'earth' },
  { key: 'herculeaf', name: 'Herculeaf', element: 'earth' },
  { key: 'hoofrit', name: 'Hoofrit', element: 'fire' },
  { key: 'incineraptor', name: 'Incineraptor', element: 'fire' },
  { key: 'kilohopp', name: 'Kilohopp', element: 'electric' },
  { key: 'lendanear', name: 'Lendanear', element: 'water' },
  { key: 'lucidina', name: 'Lucidina', element: 'water' },
  { key: 'magmolin', name: 'Magmolin', element: 'fire' },
  { key: 'mantleray', name: 'Mantleray', element: 'electric' },
  { key: 'maximito', name: 'Maximito', element: 'electric' },
  { key: 'meowdame', name: 'Meowdame', element: 'water' },
  { key: 'ninjump', name: 'Ninjump', element: 'water' },
  { key: 'platyputz', name: 'Platyputz', element: 'water' },
  { key: 'plunderjaw', name: 'Plunderjaw', element: 'water', rarity: 'mythical' },
  { key: 'regalion', name: 'Regalion', element: 'water' },
  { key: 'rootwarden', name: 'Rootwarden', element: 'earth' },
  { key: 'snowkami', name: 'Snowkami', element: 'water' },
  { key: 'spinchilla', name: 'Spinchilla', element: 'earth' },
  { key: 'squeezel', name: 'Squeezel', element: 'water' },
  { key: 'statchew', name: 'Statchew', element: 'earth' },
  { key: 'surveilynx', name: 'Surveilynx', element: 'earth' },
  { key: 'terrastudo', name: 'Terrastudo', element: 'earth' },
  { key: 'thunderclawd', name: 'Thunderclawd', element: 'electric' },
  { key: 'vulcanid', name: 'Vulcanid', element: 'fire' },
  { key: 'wyvierno', name: 'Wyvierno', element: 'electric' },
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
