import { CHEST_RESOURCES } from '../../lib/data/chests.js';

// 5-input grid for the player's raw on-hand resource stockpile. Used on
// the Dashboard and the Resources page; reads / writes through the
// active profile via the parent.
export default function OnHandResources({ onHand, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {CHEST_RESOURCES.map((r) => (
        <label key={r.key} className="flex flex-col gap-1">
          <span className={`text-xs font-medium ${r.accent}`}>{r.label}</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={onHand?.[r.key] ?? 0}
            onChange={(e) => onChange(r.key, e.target.value)}
            onFocus={(e) => e.target.select()}
            className="input-cell"
            aria-label={`On-hand ${r.label}`}
          />
        </label>
      ))}
    </div>
  );
}
