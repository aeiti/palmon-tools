import { CHEST_RESOURCES } from '../lib/chests.js';
import {
  formatResourceAmount,
  formatResourceAmountFull,
  totalResourcesFromChests,
} from '../lib/chestValues.js';

export default function ResourceTotals({ chests, playerLevel }) {
  const totals = totalResourcesFromChests(chests, playerLevel);
  const levelLabel = Number.isFinite(playerLevel) && playerLevel > 0
    ? `level ${playerLevel}`
    : 'level 30 (default)';

  return (
    <section className="card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="h-section">Resource Totals</h2>
        <span className="text-xs text-slate-500">
          Leveled chests valued at {levelLabel}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5">
        {CHEST_RESOURCES.map((r) => (
          <div
            key={r.key}
            className="flex flex-col rounded-md bg-slate-900/60 px-3 py-2 ring-1 ring-slate-800"
          >
            <dt className={`text-xs font-medium ${r.accent}`}>{r.label}</dt>
            <dd
              className="mt-0.5 text-base font-semibold tabular-nums text-slate-100"
              title={formatResourceAmountFull(totals[r.key])}
            >
              {formatResourceAmount(totals[r.key])}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
