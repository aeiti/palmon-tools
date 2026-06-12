import { describe, expect, it } from 'vitest';
import {
  emptyPalmon,
  formatStarLevel,
  hasAnyPalmons,
  normalizePalmon,
  normalizePalmonList,
  palmonDisplayName,
  palmonOptions,
  palmonsInSquad,
  speciesEvolvedName,
  speciesHasEvolution,
  squadIsFull,
} from '../palmon.js';
import {
  EQUIPMENT_SLOTS,
  MAX_EVOLUTION_STAGE,
  MAX_PALMON_LEVEL,
  MAX_PALMON_PER_SQUAD,
  MAX_SKILL_LEVEL,
  SKILL_SLOTS,
  SQUAD_COUNT,
  STAR_LEVELS,
  SUB_STAR_LEVELS,
  TRAIT_SLOTS,
} from '../data/palmon.js';

describe('emptyPalmon', () => {
  it('creates a palmon with the right slot shapes', () => {
    const p = emptyPalmon('abuzzinian');
    expect(p.speciesKey).toBe('abuzzinian');
    expect(p.level).toBe(0);
    expect(p.star).toBe(1);
    expect(p.subStar).toBe(0);
    expect(p.squad).toBeNull();
    expect(p.equipment).toHaveLength(EQUIPMENT_SLOTS);
    expect(p.skills).toHaveLength(SKILL_SLOTS);
    expect(p.traits).toHaveLength(TRAIT_SLOTS);
    expect(p.skills.every((s) => s.level === 0)).toBe(true);
    expect(p.evolutionStage).toBe(1);
  });

  it('assigns a unique-looking id', () => {
    const a = emptyPalmon('abuzzinian');
    const b = emptyPalmon('abuzzinian');
    expect(a.id).not.toBe(b.id);
  });
});

describe('normalizePalmon', () => {
  it('returns null for nullish / non-object input', () => {
    expect(normalizePalmon(null)).toBeNull();
    expect(normalizePalmon('garbage')).toBeNull();
  });

  it('returns null when species is unknown', () => {
    expect(normalizePalmon({ speciesKey: 'not-real' })).toBeNull();
    expect(normalizePalmon({ speciesKey: '' })).toBeNull();
  });

  it('clamps level into [0, MAX_PALMON_LEVEL] and floors fractions', () => {
    const overshoot = normalizePalmon({
      speciesKey: 'abuzzinian',
      level: MAX_PALMON_LEVEL + 50,
    });
    expect(overshoot.level).toBe(MAX_PALMON_LEVEL);

    const fractional = normalizePalmon({
      speciesKey: 'abuzzinian',
      level: 42.7,
    });
    expect(fractional.level).toBe(42);

    const negative = normalizePalmon({
      speciesKey: 'abuzzinian',
      level: -3,
    });
    expect(negative.level).toBe(0);
  });

  it('clamps star into [1, STAR_LEVELS]', () => {
    const overshoot = normalizePalmon({
      speciesKey: 'abuzzinian',
      star: 99,
    });
    expect(overshoot.star).toBe(STAR_LEVELS);

    const undershoot = normalizePalmon({
      speciesKey: 'abuzzinian',
      star: 0,
    });
    expect(undershoot.star).toBe(1);
  });

  it('clamps subStar into [0, SUB_STAR_LEVELS] within a non-max star tier', () => {
    const overshoot = normalizePalmon({
      speciesKey: 'abuzzinian',
      star: 3,
      subStar: 99,
    });
    expect(overshoot.subStar).toBe(SUB_STAR_LEVELS);

    const undershoot = normalizePalmon({
      speciesKey: 'abuzzinian',
      star: 3,
      subStar: -1,
    });
    expect(undershoot.subStar).toBe(0);
  });

  it('defaults evolutionStage to 1 when missing and clamps into [1, MAX_EVOLUTION_STAGE]', () => {
    const missing = normalizePalmon({ speciesKey: 'abuzzinian' });
    expect(missing.evolutionStage).toBe(1);

    const overshoot = normalizePalmon({
      speciesKey: 'abuzzinian',
      evolutionStage: MAX_EVOLUTION_STAGE + 5,
    });
    expect(overshoot.evolutionStage).toBe(MAX_EVOLUTION_STAGE);

    const undershoot = normalizePalmon({
      speciesKey: 'abuzzinian',
      evolutionStage: 0,
    });
    expect(undershoot.evolutionStage).toBe(1);
  });

  it('pins subStar to 0 when star is at max', () => {
    const out = normalizePalmon({
      speciesKey: 'abuzzinian',
      star: STAR_LEVELS,
      subStar: 4,
    });
    expect(out.subStar).toBe(0);
  });

  it('coerces invalid squad to null and clamps to SQUAD_COUNT range', () => {
    expect(
      normalizePalmon({ speciesKey: 'abuzzinian', squad: 0 }).squad,
    ).toBeNull();
    expect(
      normalizePalmon({ speciesKey: 'abuzzinian', squad: SQUAD_COUNT + 1 }).squad,
    ).toBeNull();
    expect(
      normalizePalmon({ speciesKey: 'abuzzinian', squad: 2 }).squad,
    ).toBe(2);
  });

  it('pads equipment / skills / traits to the slot count', () => {
    const out = normalizePalmon({ speciesKey: 'abuzzinian' });
    expect(out.equipment).toHaveLength(EQUIPMENT_SLOTS);
    expect(out.skills).toHaveLength(SKILL_SLOTS);
    expect(out.traits).toHaveLength(TRAIT_SLOTS);
  });

  it('clamps skill level into [0, MAX_SKILL_LEVEL]', () => {
    const out = normalizePalmon({
      speciesKey: 'abuzzinian',
      skills: [{ level: MAX_SKILL_LEVEL + 5 }],
    });
    expect(out.skills[0].level).toBe(MAX_SKILL_LEVEL);
  });

  it('keeps eq_-shaped equipment refs, discards legacy strings, keeps known traits', () => {
    const out = normalizePalmon({
      speciesKey: 'abuzzinian',
      equipment: ['eq_abc', 'legacy free text', '', null],
      traits: [123, '  caffeinated:S  ', 'something-unrecognized'],
    });
    expect(out.equipment).toEqual(['eq_abc', '', '', '']);
    expect(out.traits[0]).toBe('');
    expect(out.traits[1]).toBe('caffeinated:S');
    expect(out.traits[2]).toBe('');
  });

  it('generates a new id if missing', () => {
    const out = normalizePalmon({ speciesKey: 'abuzzinian' });
    expect(typeof out.id).toBe('string');
    expect(out.id.length).toBeGreaterThan(0);
  });
});

describe('normalizePalmonList', () => {
  it('returns [] for non-array input', () => {
    expect(normalizePalmonList(null)).toEqual([]);
    expect(normalizePalmonList('foo')).toEqual([]);
  });

  it('drops invalid entries and keeps valid ones', () => {
    const out = normalizePalmonList([
      { speciesKey: 'abuzzinian' },
      null,
      { speciesKey: 'not-real' },
      { speciesKey: 'baboom' },
    ]);
    expect(out.map((p) => p.speciesKey)).toEqual(['abuzzinian', 'baboom']);
  });

  it('reassigns duplicate ids', () => {
    const out = normalizePalmonList([
      { id: 'pm_1', speciesKey: 'abuzzinian' },
      { id: 'pm_1', speciesKey: 'baboom' },
    ]);
    expect(out[0].id).toBe('pm_1');
    expect(out[1].id).not.toBe('pm_1');
  });
});

describe('formatStarLevel', () => {
  it('renders as "star-subStar"', () => {
    expect(formatStarLevel({ star: 4, subStar: 2 })).toBe('4-2');
  });

  it('returns empty for nullish', () => {
    expect(formatStarLevel(null)).toBe('');
  });
});

describe('palmonDisplayName', () => {
  it('uses nickname if set', () => {
    expect(
      palmonDisplayName({ speciesKey: 'abuzzinian', nickname: 'Buzz' }, []),
    ).toBe('Buzz');
  });

  it('uses species name when no nickname and unique species', () => {
    const me = { id: '1', speciesKey: 'abuzzinian' };
    expect(palmonDisplayName(me, [me])).toBe('Abuzzinian');
  });

  it('numbers duplicates of the same species', () => {
    const a = { id: '1', speciesKey: 'abuzzinian' };
    const b = { id: '2', speciesKey: 'abuzzinian' };
    expect(palmonDisplayName(a, [a, b])).toBe('Abuzzinian #1');
    expect(palmonDisplayName(b, [a, b])).toBe('Abuzzinian #2');
  });

  it('falls back to "Palmon" when species is unknown', () => {
    expect(palmonDisplayName({ speciesKey: 'bogus' }, [])).toBe('Palmon');
  });
});

describe('palmonOptions', () => {
  it('returns { id, label } for every palmon', () => {
    const list = [
      { id: '1', speciesKey: 'abuzzinian', nickname: 'Buzz' },
      { id: '2', speciesKey: 'baboom' },
    ];
    expect(palmonOptions(list)).toEqual([
      { id: '1', label: 'Buzz' },
      { id: '2', label: 'Baboom' },
    ]);
  });
});

describe('speciesEvolvedName / speciesHasEvolution', () => {
  it('returns the evolved name for a species with an evolution', () => {
    expect(speciesEvolvedName('glacewing')).toBe('Cryovern');
    expect(speciesHasEvolution('glacewing')).toBe(true);
  });

  it('returns empty / false for species without an evolution', () => {
    expect(speciesEvolvedName('oleana')).toBe('');
    expect(speciesHasEvolution('oleana')).toBe(false);
    expect(speciesEvolvedName('spookaboo')).toBe('');
    expect(speciesHasEvolution('spookaboo')).toBe(false);
  });

  it('returns empty / false for unknown species keys', () => {
    expect(speciesEvolvedName('not-real')).toBe('');
    expect(speciesHasEvolution('not-real')).toBe(false);
  });
});

describe('hasAnyPalmons / palmonsInSquad / squadIsFull', () => {
  it('hasAnyPalmons checks for non-empty array', () => {
    expect(hasAnyPalmons(null)).toBe(false);
    expect(hasAnyPalmons([])).toBe(false);
    expect(hasAnyPalmons([{ id: '1' }])).toBe(true);
  });

  it('palmonsInSquad filters by squad number', () => {
    const list = [
      { id: '1', squad: 1 },
      { id: '2', squad: 2 },
      { id: '3', squad: 1 },
    ];
    expect(palmonsInSquad(list, 1)).toHaveLength(2);
    expect(palmonsInSquad(list, null)).toEqual([]);
    expect(palmonsInSquad(null, 1)).toEqual([]);
  });

  it('squadIsFull at MAX_PALMON_PER_SQUAD', () => {
    const list = Array.from({ length: MAX_PALMON_PER_SQUAD }, (_, i) => ({
      id: `pm_${i}`,
      squad: 1,
    }));
    expect(squadIsFull(list, 1)).toBe(true);
    expect(squadIsFull(list, 2)).toBe(false);
  });

  it('squadIsFull excludes a specific id from the count', () => {
    const list = Array.from({ length: MAX_PALMON_PER_SQUAD }, (_, i) => ({
      id: `pm_${i}`,
      squad: 1,
    }));
    expect(squadIsFull(list, 1, 'pm_0')).toBe(false);
  });
});
