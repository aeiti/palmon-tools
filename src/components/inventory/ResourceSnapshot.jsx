import { useState } from 'react';
import { MASTERY_CHESTS } from '../../lib/data/campMastery.js';
import { OTHER_ITEMS } from '../../lib/data/other.js';
import { formatWhen, toLocalInputValue } from '../mastery/format.js';
import ResetButton from '../ui/ResetButton.jsx';
import SectionCard from '../ui/SectionCard.jsx';
import StepperInput from '../ui/StepperInput.jsx';
import ChestInventory from './ChestInventory.jsx';
import OnHandResources from './OnHandResources.jsx';

const CHEST_LABEL = Object.fromEntries(OTHER_ITEMS.map((i) => [i.key, i.label]));

// Everything you'd count when checking your stockpile — on-hand resources,
// Camp Mastery chests, and resource chests — in one place. Rendered on both
// Resource Inventory and Camp Mastery; edits write straight to the profile,
// so the two pages always show the same numbers. "Log reading" saves a
// timestamped snapshot of all of it to the Camp Mastery log.
//
// `profile` is the active profile; `actions` holds the useProfiles mutators
// (the page owns the single useProfiles instance).
export default function ResourceSnapshot({ profile, actions, lastLoggedAt }) {
  return (
    <div className="flex flex-col gap-6">
      <LogBar onLog={actions.logMasteryReading} lastLoggedAt={lastLoggedAt} />

      <SectionCard
        title="On-hand"
        actions={
          <ResetButton
            onReset={actions.resetActiveOnHand}
            confirmTitle="Reset on-hand resources?"
            confirmMessage={`Set on-hand XP, Electricity, Gold, Lumber, and Steel for "${profile.name}" back to 0.`}
          />
        }
      >
        <OnHandResources onHand={profile.onHand} onChange={actions.updateOnHand} />
      </SectionCard>

      <SectionCard title="Camp Mastery chests">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {MASTERY_CHESTS.map((c) => (
            <label key={c.key} className="flex flex-col gap-1">
              <span className="truncate text-xs font-medium text-slate-400">
                {CHEST_LABEL[c.key]}
              </span>
              <StepperInput
                value={profile.other?.[c.key] || 0}
                onChange={(v) => actions.updateOtherCount(c.key, v)}
                className="h-8 w-full"
                ariaLabel={CHEST_LABEL[c.key]}
              />
            </label>
          ))}
        </div>
      </SectionCard>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="h-section">Resource chests</h2>
          <ResetButton
            onReset={actions.resetActiveChests}
            confirmTitle="Reset chests?"
            confirmMessage={`Set all chest counts for "${profile.name}" back to 0.`}
          />
        </div>
        <ChestInventory
          chests={profile.chests}
          onChange={actions.updateChestCount}
          leveledOverrides={profile.leveledChestOverrides}
          playerLevel={profile.level}
          onLeveledOverrideChange={actions.updateLeveledChestOverride}
          onLeveledOverrideReset={actions.resetActiveLeveledChestOverrides}
        />
      </section>
    </div>
  );
}

function LogBar({ onLog, lastLoggedAt }) {
  // null = "now"; the field only holds a value once the user picks a time.
  const [at, setAt] = useState(null);
  const [note, setNote] = useState('');
  const [openedAt, setOpenedAt] = useState(() => Date.now());

  const submit = (e) => {
    e.preventDefault();
    const when = at ? Date.parse(at) : Date.now();
    if (!Number.isFinite(when)) return;
    onLog({ at: new Date(when).toISOString(), note });
    setAt(null);
    setNote('');
    setOpenedAt(Date.now());
  };

  return (
    <form onSubmit={submit} className="card flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="h-section">Log a reading</h2>
        <span className="text-xs text-slate-500">
          {lastLoggedAt
            ? `Last logged ${formatWhen(lastLoggedAt)}`
            : 'Nothing logged yet'}
        </span>
      </div>
      <p className="text-xs text-slate-500">
        Update the counts below, then log them. Saves on-hand stock and every
        chest to the Camp Mastery log.
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          type="datetime-local"
          className="input-inline h-8"
          value={at ?? toLocalInputValue(openedAt)}
          onChange={(e) => setAt(e.target.value)}
          aria-label="Reading time"
        />
        <input
          type="text"
          className="input-inline h-8 min-w-0 flex-1"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Log reading
        </button>
      </div>
    </form>
  );
}
