import { describe, expect, it } from 'vitest';
import { traitsByGradeFor } from '../palmonTraits.js';
import { PALMON_TRAITS, TRAIT_GRADES } from '../data/palmonTraits.js';

describe('traitsByGradeFor', () => {
  it('returns a bucket for every grade in TRAIT_GRADES', () => {
    const buckets = traitsByGradeFor('combat');
    expect(Object.keys(buckets).sort()).toEqual([...TRAIT_GRADES].sort());
  });

  it('returns an empty array for grades the category never uses', () => {
    // No category is fully empty today, but the contract is "grade bucket
    // always exists, even if empty". Assert via an unknown category.
    const buckets = traitsByGradeFor('nonexistent');
    for (const grade of TRAIT_GRADES) {
      expect(buckets[grade]).toEqual([]);
    }
  });

  it('sorts traits alphabetically by name within a bucket', () => {
    const sBucket = traitsByGradeFor('combat').S;
    const names = sBucket.map((t) => t.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('returns { slug, name, effect } for each trait', () => {
    const sBucket = traitsByGradeFor('combat').S;
    expect(sBucket.length).toBeGreaterThan(0);
    for (const trait of sBucket) {
      expect(Object.keys(trait).sort()).toEqual(['effect', 'name', 'slug']);
      expect(PALMON_TRAITS[trait.slug].name).toBe(trait.name);
      expect(PALMON_TRAITS[trait.slug].grades.S).toBe(trait.effect);
    }
  });

  it('only includes traits whose category matches', () => {
    const combatTraits = Object.values(traitsByGradeFor('combat')).flat();
    for (const trait of combatTraits) {
      expect(PALMON_TRAITS[trait.slug].category).toBe('combat');
    }
    const workTraits = Object.values(traitsByGradeFor('work')).flat();
    for (const trait of workTraits) {
      expect(PALMON_TRAITS[trait.slug].category).toBe('work');
    }
  });

  it('emits one entry per (trait, grade) — work families repeat across S/A/B', () => {
    const work = traitsByGradeFor('work');
    // Caffeinated has S/A/B in the catalog; each grade should surface once.
    const caffeinatedGrades = TRAIT_GRADES.filter((g) =>
      work[g].some((t) => t.slug === 'caffeinated'),
    );
    expect(caffeinatedGrades).toEqual(['S', 'A', 'B']);
  });
});
