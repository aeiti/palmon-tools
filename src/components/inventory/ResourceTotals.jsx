import { CHEST_RESOURCES } from '../../lib/data/chests.js';
import {
  formatResourceAmount,
  formatResourceAmountFull,
  normalizeOnHand,
  totalResourcesFromChests,
} from '../../lib/resourceTotals.js';

export default function ResourceTotals({
  chests,
  playerLevel,
  onHand,
  leveledOverrides,
}) {
  const chestTotals = totalResourcesFromChests(
    chests,
    playerLevel,
    leveledOverrides,
  );
  const handTotals = normalizeOnHand(onHand);
  const levelLabel =
    Number.isFinite(playerLevel) && playerLevel > 0
      ? `level ${playerLevel}`
      : 'level 30 (default)';

  return (
    <div className="flex flex-col gap-2">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5">
        {CHEST_RESOURCES.map((r) => {
          const chest = chestTotals[r.key];
          const hand = handTotals[r.key];
          const total = chest + hand;
          // Multi-line title gives a hover breakdown without taking up grid space.
          const tooltip = [
            `Total: ${formatResourceAmountFull(total)}`,
            `On-hand: ${formatResourceAmountFull(hand)}`,
            `From chests: ${formatResourceAmountFull(chest)}`,
          ].join('\n');
          return (
            <div
              key={r.key}
              className="flex flex-col rounded-md bg-slate-900/60 px-3 py-2 ring-1 ring-slate-800"
            >
              <dt className={`text-xs font-medium ${r.accent}`}>{r.label}</dt>
              <dd
                className="mt-0.5 text-base font-semibold tabular-nums text-slate-100"
                title={tooltip}
              >
                {formatResourceAmount(total)}
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="self-end text-xs text-slate-500">
        Includes on-hand stockpile; leveled chests valued at {levelLabel}
      </p>
    </div>
  );
}
