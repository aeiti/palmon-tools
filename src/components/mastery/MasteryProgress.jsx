import { CHEST_RESOURCES } from '../../lib/data/chests.js';
import { MASTERY_RESOURCES, MASTERY_STEPS } from '../../lib/data/campMastery.js';
import { formatCompact, formatCompactFull } from '../../lib/format.js';
import { formatDay, formatDays } from './format.js';

const RESOURCE_META = Object.fromEntries(CHEST_RESOURCES.map((r) => [r.key, r]));

// The step being saved for: per-resource progress, the rate that drives the
// projection, and how to split Awakening Bundles. `row` is the first entry
// of projectSteps(); `rates` is { average, recent, planning }.
export default function MasteryProgress({
  row,
  basis,
  pool,
  rates,
  onBought,
  onSetCurrent,
}) {
  const projectionRate = rates.average ? 'average' : 'planning';
  const hours = row.hours[projectionRate];
  const allocation = row.allocation[projectionRate];
  const choiceParts = allocation
    ? MASTERY_RESOURCES.filter((r) => allocation[r] >= 1)
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="flex flex-col gap-1">
          <span className="h-eyebrow">Saving for</span>
          <select
            className="select"
            value={row.step.key}
            onChange={(e) => onSetCurrent(e.target.value)}
          >
            {MASTERY_STEPS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums text-slate-100">
            {row.affordableNow ? 'Affordable now' : formatDays(hours)}
          </div>
          <div className="text-subtle">
            {row.affordableNow
              ? 'with stock and chests'
              : hours === null
                ? 'log two readings or set a planning rate'
                : `${formatDay(basis.at + hours * 3600_000)} at ${projectionRate} rate`}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {MASTERY_RESOURCES.map((r) => {
          const cost = row.step.cost[r];
          const have = basis.stock[r];
          const withChests = Math.min(cost, have + pool.fixed[r]);
          const pctStock = Math.min(100, (have / cost) * 100);
          const pctChests = Math.min(100, (withChests / cost) * 100);
          const rate = rates[projectionRate]?.[r];
          return (
            <div key={r} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className={`font-medium ${RESOURCE_META[r].accent}`}>
                  {RESOURCE_META[r].label}
                </span>
                <span
                  className="tabular-nums text-slate-300"
                  title={`Stock ${formatCompactFull(have)} · fixed chests ${formatCompactFull(Math.round(pool.fixed[r]))} · cost ${formatCompactFull(cost)}`}
                >
                  {formatCompact(have)} / {formatCompact(cost)}
                  {row.need[r] > 0 && (
                    <span className="text-slate-500">
                      {' '}
                      · need {formatCompact(row.need[r])}
                    </span>
                  )}
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-slate-900 ring-1 ring-slate-700">
                <div
                  className="absolute inset-y-0 left-0 bg-slate-600"
                  style={{ width: `${pctChests}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 bg-indigo-500"
                  style={{ width: `${pctStock}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 tabular-nums">
                {rate != null ? `${formatCompact(rate)}/h net` : 'no rate yet'}
                {rates.recent && rates.average && (
                  <> · recent {formatCompact(rates.recent[r])}/h</>
                )}
              </div>
            </div>
          );
        })}
        <p className="text-xs text-slate-500">
          Blue is stock; grey adds unopened chests from Resource Inventory and
          Supply Chests.
          {rates[projectionRate]?.flexible > 0 &&
            ` Choice chests are coming in at ${formatCompact(rates[projectionRate].flexible)}/h.`}
        </p>
      </div>

      {choiceParts.length > 0 && (
        <p className="text-sm text-slate-300">
          Open choice chests and bundles as:{' '}
          {choiceParts
            .map((r) => `${formatCompact(allocation[r])} ${RESOURCE_META[r].label}`)
            .join(', ')}
          <span className="text-slate-500">
            {' '}
            (of {formatCompact(pool.flexible)}; finishes all three together)
          </span>
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          className="btn-primary"
          onClick={() => onBought(row.step.key)}
        >
          I bought {row.step.label}
        </button>
      </div>
    </div>
  );
}
