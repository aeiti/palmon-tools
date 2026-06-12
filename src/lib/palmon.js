// Palmon state helpers — empty/normalize, squad membership, display names.
// Catalog data lives in src/lib/data/palmon.js.

import {
  EQUIPMENT_SLOTS,
  MAX_EVOLUTION_STAGE,
  MAX_PALMON_LEVEL,
  MAX_PALMON_PER_SQUAD,
  MAX_SKILL_LEVEL,
  PALMON_SPECIES_BY_KEY,
  SKILL_SLOTS,
  SQUAD_COUNT,
  STAR_LEVELS,
  SUB_STAR_LEVELS,
  TRAIT_SLOTS,
  palmonSpeciesName,
} from './data/palmon.js';
import { PALMON_EVOLUTIONS } from './data/palmonEvolutions.js';
import { isEquipmentInstanceId } from './equipment.js';
import { isValidTraitKey } from './palmonTraits.js';

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
    subStar: 0,
    evolutionStage: 1,
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

// Sub-stars are 0–SUB_STAR_LEVELS within a star tier. At star 5 (max) the
// sub-star is pinned to 0 — there's no progression past 5-0.
function clampSubStar(rawStar, rawSubStar) {
  const star = clampInt(rawStar, 1, STAR_LEVELS);
  if (star >= STAR_LEVELS) return 0;
  return clampInt(rawSubStar, 0, SUB_STAR_LEVELS);
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
    subStar: clampSubStar(palmon.star, palmon.subStar),
    evolutionStage: clampInt(palmon.evolutionStage, 1, MAX_EVOLUTION_STAGE),
    squad: clampSquad(palmon.squad),
    // Slot entries are equipment-instance ids (eq_…); legacy free-text
    // values from earlier versions are discarded. The bidirectional sync
    // pass in useProfiles.normalize rewrites this from the equipment-side
    // claims, so this just gates out garbage.
    equipment: padArray(palmon.equipment, EQUIPMENT_SLOTS, (v) =>
      isEquipmentInstanceId(v) ? v : '',
    ),
    skills: padArray(palmon.skills, SKILL_SLOTS, (v) => ({
      level: clampOptionalInt(v?.level, 0, MAX_SKILL_LEVEL),
    })),
    traits: padArray(palmon.traits, TRAIT_SLOTS, (v) => {
      const s = typeof v === 'string' ? v.trim() : '';
      return isValidTraitKey(s) ? s : '';
    }),
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

export function speciesEvolvedName(speciesKey) {
  return PALMON_EVOLUTIONS[speciesKey]?.name || '';
}

export function speciesHasEvolution(speciesKey) {
  return Boolean(PALMON_EVOLUTIONS[speciesKey]);
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
