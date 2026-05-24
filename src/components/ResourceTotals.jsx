import { CHEST_RESOURCES } from '../lib/chests.js';
import {
  formatResourceAmount,
  formatResourceAmountFull,
  totalResourcesFromChests,
} from '../lib/resourceTotals.js';

export default function ResourceTotals({ chests, playerLevel }) {
  const totals = totalResourcesFromChests(chests, playerLevel);
  const levelLabel =
    Number.isFinite(playerLevel) && playerLevel > 0
      ? `level ${playerLevel}`
      : 'level 30 (default)';

  return (
    <div className="flex flex-col gap-2">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5">
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
      <p className="self-end text-xs text-slate-500">
        Leveled chests valued at {levelLabel}
      </p>
    </div>
  );
}
