// Compact labeled select used across roster/inventory forms. Supports a flat
// options list (`options`) or grouped options (`groups`) for picker UIs that
// segment by rarity tier or similar.

export default function SelectField({
  label,
  value,
  onChange,
  options,
  groups,
  ariaLabel,
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        value={value === null || value === undefined ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel || label}
        className="select-compact"
      >
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
        {groups?.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
