import { CHEST_RESOURCES } from '../../lib/data/chests.js';
import StepperInput from '../ui/StepperInput.jsx';

// 5-input grid for the player's raw on-hand resource stockpile. Used on
// the Dashboard and the Resources page; reads / writes through the
// active profile via the parent. Inputs accept either plain digits or
// compact form ("1.5M", "100k", "1,500,000") via the underlying
// CompactInput, with click-step buttons for small adjustments.
export default function OnHandResources({ onHand, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {CHEST_RESOURCES.map((r) => (
        <label key={r.key} className="flex flex-col gap-1">
          <span className={`text-xs font-medium ${r.accent}`}>{r.label}</span>
          <StepperInput
            value={onHand?.[r.key] ?? 0}
            onChange={(value) => onChange(r.key, value)}
            className="h-8 w-32"
            ariaLabel={`On-hand ${r.label}`}
          />
        </label>
      ))}
    </div>
  );
}
