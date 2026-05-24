import { useState } from 'react';
import { formatCompact, parseCompact } from '../../lib/format.js';

// Text input that displays a numeric value in compact form (K / M / B) when
// not focused, and accepts either plain digits ("1500000") or the compact
// form ("1.5M", "100k", etc.) while editing. Commits the parsed integer to
// the parent on blur via onChange(newValue).
//
// Pattern: a local draft string holds whatever the user is currently typing.
// While draft is non-null we treat the field as actively editing (focused);
// when draft is null we render the formatted view. No useEffect — focus /
// blur events drive the transitions.
export default function CompactInput({
  value,
  onChange,
  ariaLabel,
  className,
  ...rest
}) {
  const [draft, setDraft] = useState(null);
  const isEditing = draft !== null;
  const display = isEditing ? draft : formatCompact(value);

  const handleFocus = (e) => {
    setDraft(formatCompact(value));
    // select-all so a fresh edit overwrites instead of appending
    e.target.select();
  };

  const handleBlur = (e) => {
    // Read from the DOM, not from `draft` closure — focus → type → blur
    // can fire faster than React re-renders, leaving the closure's draft
    // stale (null) on commit and silently dropping the edit.
    const current = e.currentTarget.value;
    setDraft(null);
    const parsed = parseCompact(current);
    if (parsed === null) return; // unparseable: revert to formatted value
    if (parsed !== value) onChange(parsed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.currentTarget.blur();
    else if (e.key === 'Escape') {
      setDraft(null);
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={display}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      className={className}
      {...rest}
    />
  );
}
