import { MASTERY_RESOURCES } from '../../lib/data/campMastery.js';
import { formatCompact, formatCompactFull } from '../../lib/format.js';
import { Swatch } from './charts/chartKit.jsx';
import { RESOURCE_LABEL, SERIES_COLOR } from './charts/chartTheme.js';

// Per-resource progress toward the step being saved for. Each bar shows
// stock (solid) and what unopened chests add (light), with the income rate
// underneath. `row` is the first entry of projectSteps(); `rates` is
// { average, recent, planning }; `rateKey` picks which one drives the
// projection.
export default function MasteryProgress({ row, basis, pool, rates, rateKey }) {
  const allocation = row.allocation[rateKey];
  const choiceParts = allocation
    ? MASTERY_RESOURCES.filter((r) => allocation[r] >= 1)
    : [];

  return (
    <div className="flex flex-col gap-4">
      {MASTERY_RESOURCES.map((r) => {
        const cost = row.step.cost[r];
        const have = basis.stock[r];
        const withChests = Math.min(cost, have + pool.fixed[r]);
        const pctStock = Math.min(100, (have / cost) * 100);
        const pctChests = Math.min(100, (withChests / cost) * 100);
        const rate = rates[rateKey]?.[r];
        return (
          <div key={r} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-200">
                <Swatch resource={r} />
                {RESOURCE_LABEL[r]}
              </span>
              <span
                className="tabular-nums text-slate-300"
                title={`Stock ${formatCompactFull(have)} · chests ${formatCompactFull(Math.round(pool.fixed[r]))} · cost ${formatCompactFull(cost)}`}
              >
                {formatCompact(have)}{' '}
                <span className="text-slate-500">/ {formatCompact(cost)}</span>
              </span>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-900 ring-1 ring-slate-700">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${pctChests}%`,
                  background: SERIES_COLOR[r],
                  opacity: 0.35,
                }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${pctStock}%`, background: SERIES_COLOR[r] }}
              />
            </div>
            <div className="flex justify-between text-xs tabular-nums text-slate-500">
              <span>
                {rate != null ? `${formatCompact(rate)}/h` : 'no rate yet'}
                {rates.recent && rateKey === 'average' && (
                  <> · recent {formatCompact(rates.recent[r])}/h</>
                )}
              </span>
              {row.need[r] > 0 && (
                <span>need {formatCompact(row.need[r])}</span>
              )}
            </div>
          </div>
        );
      })}

      <p className="text-xs text-slate-500">
        Solid is stock; light adds unopened resource and Supply chests.
      </p>

      {choiceParts.length > 0 && (
        <p className="rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-300 ring-1 ring-slate-800">
          <span className="text-slate-400">Open choice chests as </span>
          {choiceParts
            .map(
              (r) =>
                `${formatCompact(allocation[r])} ${RESOURCE_LABEL[r].toLowerCase()}`,
            )
            .join(' · ')}
          <span className="text-slate-500"> — all three finish together</span>
        </p>
      )}
    </div>
  );
}
