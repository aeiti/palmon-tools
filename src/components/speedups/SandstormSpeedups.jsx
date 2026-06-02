import { SANDSTORM_SPEEDUPS } from '../../lib/data/sandstormSpeedups.js';
import {
  totalHealingMinutes,
  totalMarchCount,
} from '../../lib/sandstormSpeedups.js';
import { formatDHM } from '../../lib/time.js';
import StepperInput from '../ui/StepperInput.jsx';

const TAG_CLASSES = {
  Sandstorm: 'bg-amber-900/40 text-amber-200',
  Desert: 'bg-orange-900/40 text-orange-200',
};

function TagChip({ tag }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
        TAG_CLASSES[tag] || 'bg-slate-700 text-slate-200'
      }`}
    >
      {tag}
    </span>
  );
}

export default function SandstormSpeedups({ state, onChange }) {
  const healing = totalHealingMinutes(state);
  const marchCount = totalMarchCount(state);

  return (
    <div className="panel flex flex-col">
      {SANDSTORM_SPEEDUPS.map((item) => (
        <div
          key={item.key}
          className="flex items-center gap-2 border-t border-slate-800 px-3 py-1.5 first:border-t-0"
        >
          <label
            htmlFor={`sandstorm-${item.key}`}
            className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-sm text-slate-200"
          >
            <span className="truncate">{item.label}</span>
            <TagChip tag={item.tag} />
          </label>
          <StepperInput
            id={`sandstorm-${item.key}`}
            value={state[item.key] ?? 0}
            onChange={(value) => onChange(item.key, value)}
            ariaLabel={`${item.label} (${item.tag})`}
            className="h-7 w-28 shrink-0"
          />
        </div>
      ))}
      <div className="border-t border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-400">
        <div className="flex justify-between">
          <span>Healing total</span>
          <span className="tabular-nums text-slate-200">
            {formatDHM(healing)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>March speedups owned</span>
          <span className="tabular-nums text-slate-200">{marchCount}</span>
        </div>
      </div>
    </div>
  );
}
