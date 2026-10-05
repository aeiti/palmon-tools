import { useState } from 'react';
import { MASTERY_STEPS } from '../../lib/data/campMastery.js';
import CompactInput from '../ui/CompactInput.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import ResetButton from '../ui/ResetButton.jsx';

// Rarely-changed settings, opened from the summary bar: the planning rate,
// correcting which step you're on, and resetting the tracker. Changing the
// step rewrites which steps count as done, so it goes through a confirm.
export default function MasterySettings({
  profileName,
  planningRate,
  currentKey,
  onPlanningRate,
  onSetCurrent,
  onReset,
}) {
  const [pick, setPick] = useState(currentKey);
  const [confirming, setConfirming] = useState(false);
  const pickLabel = MASTERY_STEPS.find((s) => s.key === pick)?.label ?? pick;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-400">
          Planning rate (per resource, per hour)
        </span>
        <CompactInput
          value={planningRate}
          onChange={onPlanningRate}
          className="input-compact"
          ariaLabel="Planning rate per hour"
        />
        <span className="text-xs text-slate-500">
          Used until two readings give a measured rate.
        </span>
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-400">
          Correct the step you&apos;re saving for
        </span>
        <div className="flex gap-2">
          <select
            className="select-compact"
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            aria-label="Step you're saving for"
          >
            {MASTERY_STEPS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-secondary"
            disabled={pick === currentKey}
            onClick={() => setConfirming(true)}
          >
            Set
          </button>
        </div>
        <span className="text-xs text-slate-500">
          Marks every earlier step as done. Use “I bought …” for purchases.
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 sm:col-span-2">
        <span className="text-xs text-slate-500">
          Valuation: choice chests like leveled chests of the same tier;
          Awakening Bundles 5M; Supply Chests ~300K split evenly (unconfirmed).
        </span>
        <ResetButton
          onReset={onReset}
          label="Reset tracker"
          className="btn-ghost shrink-0 whitespace-nowrap"
          confirmTitle="Reset Camp Mastery?"
          confirmMessage={`Delete every reading, step record and the planning rate for "${profileName}". Stock and chest counts are kept.`}
        />
      </div>

      <ConfirmDialog
        open={confirming}
        title={`Saving for ${pickLabel}?`}
        message={`Every step before ${pickLabel} will be marked done, and ${pickLabel} onward cleared.`}
        confirmLabel="Set step"
        onConfirm={() => {
          onSetCurrent(pick);
          setConfirming(false);
        }}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
