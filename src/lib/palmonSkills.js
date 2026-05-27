// Renders a skill effect template at a given level. Substitutes {var}
// placeholders with the corresponding value from effectValues[var][level].
// Missing values render as "TBD".

const UNKNOWN = 'TBD';

export function renderSkillEffect(skill, level) {
  if (!skill?.effectTemplate) return '';
  return skill.effectTemplate.replace(/\{(\w+)\}/g, (_, key) => {
    const v = skill.effectValues?.[key]?.[level];
    return v == null ? UNKNOWN : String(v);
  });
}

// True when every variable in the template has a value at the given level.
// Used to decide whether to show a "values not yet captured" hint.
export function skillEffectIsFullyKnown(skill, level) {
  if (!skill?.effectTemplate) return false;
  const placeholders = skill.effectTemplate.match(/\{(\w+)\}/g) || [];
  if (placeholders.length === 0) return true;
  return placeholders.every((p) => {
    const key = p.slice(1, -1);
    return skill.effectValues?.[key]?.[level] != null;
  });
}
