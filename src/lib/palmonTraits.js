// Trait helpers: composite-key encode/decode + pre-computed SelectField
// groups for the roster-card pickers. Catalog data lives in
// src/lib/data/palmonTraits.js.

import {
  PALMON_TRAITS,
  TRAIT_CATEGORIES,
  TRAIT_GRADES,
} from './data/palmonTraits.js';

const CATEGORY_LABEL = { combat: 'Combat', work: 'Work' };

// A roster slot stores either '' (empty) or '<slug>:<grade>', e.g.
// 'caffeinated:S'. Keys are deterministic so storage / dropdown values
// round-trip without an extra lookup table.

export function traitKeyFor(slug, grade) {
  return `${slug}:${grade}`;
}

export function decodeTraitKey(key) {
  if (typeof key !== 'string' || !key.includes(':')) return null;
  const [slug, grade] = key.split(':');
  const family = PALMON_TRAITS[slug];
  if (!family) return null;
  const effect = family.grades[grade];
  if (!effect) return null;
  return {
    slug,
    grade,
    name: family.name,
    category: family.category,
    effect,
  };
}

export function isValidTraitKey(key) {
  if (key === '' || key === null || key === undefined) return true;
  return decodeTraitKey(key) !== null;
}

// One <optgroup> per category, sorted by trait name then grade (S→A→B→C).
// Suitable to feed straight into SelectField's `groups` prop.
export const TRAIT_PICKER_GROUPS = (() => {
  const buckets = {};
  for (const [slug, family] of Object.entries(PALMON_TRAITS)) {
    for (const grade of TRAIT_GRADES) {
      const effect = family.grades[grade];
      if (!effect) continue;
      const cat = family.category;
      (buckets[cat] ||= []).push({
        value: traitKeyFor(slug, grade),
        label: `${family.name} (${grade}) — ${effect}`,
        _name: family.name,
        _grade: grade,
      });
    }
  }
  return TRAIT_CATEGORIES.map((cat) => ({
    label: CATEGORY_LABEL[cat],
    options: (buckets[cat] || [])
      .sort(
        (a, b) =>
          a._name.localeCompare(b._name) ||
          TRAIT_GRADES.indexOf(a._grade) - TRAIT_GRADES.indexOf(b._grade),
      )
      .map(({ _name, _grade, ...rest }) => rest),
  }));
})();
