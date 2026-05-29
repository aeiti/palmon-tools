// Star + Sub-star selects with the coupling rule baked in:
// at max star (STAR_LEVELS), sub-star is pinned to 0 and the dropdown
// collapses to a single "0" option. Bumping star to max via this picker
// also resets sub-star to 0 in the same onChange call.
//
// Logic counterpart: clampSubStar() in src/lib/palmon.js enforces the same
// rule at the storage layer so loaded state stays consistent.

import SelectField from '../ui/SelectField.jsx';
import { STAR_LEVELS, SUB_STAR_LEVELS } from '../../lib/data/palmon.js';

const STAR_OPTIONS = Array.from({ length: STAR_LEVELS }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));
const SUB_STAR_OPTIONS = Array.from(
  { length: SUB_STAR_LEVELS + 1 },
  (_, i) => ({ value: String(i), label: String(i) }),
);
const SUB_STAR_OPTIONS_AT_MAX_STAR = [{ value: '0', label: '0' }];

export default function StarPicker({ star, subStar, onChange, displayName }) {
  const atMaxStar = star >= STAR_LEVELS;
  const namePrefix = displayName ? `${displayName} ` : '';
  return (
    <>
      <SelectField
        label="Star"
        value={String(star)}
        onChange={(v) => {
          const next = Number(v);
          const patch = { star: next };
          if (next >= STAR_LEVELS) patch.subStar = 0;
          onChange(patch);
        }}
        options={STAR_OPTIONS}
        ariaLabel={`${namePrefix}star`}
      />
      <SelectField
        label="Sub-star"
        value={String(subStar)}
        onChange={(v) => onChange({ subStar: Number(v) })}
        options={atMaxStar ? SUB_STAR_OPTIONS_AT_MAX_STAR : SUB_STAR_OPTIONS}
        ariaLabel={`${namePrefix}sub-star`}
      />
    </>
  );
}
