import { useState } from 'react';
import {
  NON_UNIVERSAL_CATEGORIES,
  categoryTotalWithUniversal,
} from '../lib/speedups.js';
import { dhmToMinutes, formatDHM } from '../lib/time.js';

export default function TargetChecker({ inventory }) {
  const [category, setCategory] = useState(NON_UNIVERSAL_CATEGORIES[0].key);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const targetMin = dhmToMinutes({ days, hours, minutes });
  const availableMin = categoryTotalWithUniversal(inventory, category);
  const diff = availableMin - targetMin;
  const enough = diff >= 0;
  const hasTarget = targetMin > 0;

  const inputClass =
    'w-full rounded bg-slate-800 px-2 py-1.5 text-center tabular-nums text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-indigo-400';

  return (
    <div className="rounded-lg bg-slate-800/40 p-4 ring-1 ring-slate-700">
      <h2 className="text-base font-semibold text-slate-100">Target check</h2>
      <p className="mt-1 text-xs text-slate-400">
        Enter the time you need and pick the category. Universal speedups are
        included.
      </p>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs font-medium text-slate-300">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded bg-slate-800 px-2 py-1.5 text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-indigo-400"
          >
            {NON_UNIVERSAL_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid flex-1 grid-cols-3 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-300">Days</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              onFocus={(e) => e.target.select()}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-300">Hours</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              onFocus={(e) => e.target.select()}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-300">Minutes</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              onFocus={(e) => e.target.select()}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded bg-slate-900/60 p-3">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Target
          </div>
          <div className="mt-0.5 tabular-nums text-slate-100">
            {formatDHM(targetMin)}
          </div>
        </div>
        <div className="rounded bg-slate-900/60 p-3">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Available
          </div>
          <div className="mt-0.5 tabular-nums text-slate-100">
            {formatDHM(availableMin)}
          </div>
        </div>
        <div
          className={`rounded p-3 ${
            !hasTarget
              ? 'bg-slate-900/60'
              : enough
                ? 'bg-emerald-900/40 ring-1 ring-emerald-700'
                : 'bg-red-900/40 ring-1 ring-red-700'
          }`}
        >
          <div className="text-xs uppercase tracking-wide text-slate-400">
            {!hasTarget
              ? 'Status'
              : enough
                ? 'Surplus'
                : 'Short by'}
          </div>
          <div
            className={`mt-0.5 tabular-nums ${
              !hasTarget
                ? 'text-slate-300'
                : enough
                  ? 'text-emerald-200'
                  : 'text-red-200'
            }`}
          >
            {!hasTarget ? 'Enter a target' : formatDHM(Math.abs(diff))}
          </div>
        </div>
      </div>
    </div>
  );
}
