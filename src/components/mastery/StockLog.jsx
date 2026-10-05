import { useState } from 'react';
import { CHEST_RESOURCES } from '../../lib/data/chests.js';
import { MASTERY_RESOURCES } from '../../lib/data/campMastery.js';
import { formatCompact, formatCompactFull } from '../../lib/format.js';
import CompactInput from '../ui/CompactInput.jsx';
import { formatWhen, toLocalInputValue } from './format.js';

const RESOURCE_META = Object.fromEntries(CHEST_RESOURCES.map((r) => [r.key, r]));

// Form for a new stock reading plus the list of past readings, newest first.
// The form pre-fills with the current on-hand stock so a reading is usually
// three quick edits.
export default function StockLog({ log, onHand, onAdd, onDelete }) {
  const [draft, setDraft] = useState(() => freshDraft(onHand));

  const submit = (e) => {
    e.preventDefault();
    const at = Date.parse(draft.at);
    if (!Number.isFinite(at)) return;
    onAdd({ ...draft, at: new Date(at).toISOString() });
    setDraft((d) => ({ ...freshDraft(d), note: '' }));
  };

  const newestFirst = [...log].reverse();

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <label className="col-span-2 flex flex-col gap-1 sm:col-span-1">
            <span className="text-xs font-medium text-slate-400">When</span>
            <input
              type="datetime-local"
              className="input-inline h-8"
              value={draft.at}
              onChange={(e) => setDraft({ ...draft, at: e.target.value })}
              required
            />
          </label>
          {MASTERY_RESOURCES.map((r) => (
            <label key={r} className="flex flex-col gap-1">
              <span className={`text-xs font-medium ${RESOURCE_META[r].accent}`}>
                {RESOURCE_META[r].label}
              </span>
              <CompactInput
                value={draft[r]}
                onChange={(v) => setDraft((d) => ({ ...d, [r]: v }))}
                className="input-compact"
                ariaLabel={`${RESOURCE_META[r].label} stock`}
              />
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="input-inline h-8 flex-1"
            placeholder="Note (optional)"
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          />
          <button type="submit" className="btn-primary">
            Log reading
          </button>
        </div>
      </form>

      {newestFirst.length === 0 ? (
        <p className="text-subtle">
          No readings yet. Log your stock now and again in a few hours to
          measure your income rate.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-700/60">
          {newestFirst.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm"
            >
              <span className="w-full text-slate-300 sm:w-32">
                {formatWhen(Date.parse(e.at))}
              </span>
              {MASTERY_RESOURCES.map((r) => (
                <span
                  key={r}
                  className={`w-14 tabular-nums ${RESOURCE_META[r].accent}`}
                  title={formatCompactFull(e[r])}
                >
                  {formatCompact(e[r])}
                </span>
              ))}
              <span className="flex-1 truncate text-slate-500">{e.note}</span>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => onDelete(e.id)}
                aria-label={`Delete reading from ${formatWhen(Date.parse(e.at))}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function freshDraft(stock) {
  return {
    at: toLocalInputValue(Date.now()),
    gold: stock?.gold || 0,
    lumber: stock?.lumber || 0,
    steel: stock?.steel || 0,
    note: '',
  };
}
