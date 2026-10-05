import { CHEST_RESOURCES } from '../../lib/data/chests.js';
import { MASTERY_RESOURCES } from '../../lib/data/campMastery.js';
import { formatCompact, formatCompactFull } from '../../lib/format.js';
import { formatDay, formatDays } from './format.js';

const RESOURCE_META = Object.fromEntries(CHEST_RESOURCES.map((r) => [r.key, r]));

// Every remaining step with its cumulative gold / lumber / steel cost and
// when it becomes affordable at the measured and the planning rate.
export default function StepLadder({ rows, basisAt }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-400">
            <th className="py-1 pr-3 align-bottom font-medium">Step</th>
            <th className="py-1 pr-3 text-right font-medium">
              {MASTERY_RESOURCES.map((r) => (
                <span key={r} className={`block ${RESOURCE_META[r].accent}`}>
                  {RESOURCE_META[r].label}
                </span>
              ))}
            </th>
            <th className="py-1 pr-3 text-right align-bottom font-medium">
              Measured
            </th>
            <th className="py-1 text-right align-bottom font-medium">Planning</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/60">
          {rows.map((row) => (
            <tr key={row.step.key}>
              <td className="py-1.5 pr-3 align-top text-slate-200">
                {row.step.label}
              </td>
              <td className="py-1.5 pr-3 text-right tabular-nums">
                {MASTERY_RESOURCES.map((r) => (
                  <span
                    key={r}
                    className={`block ${RESOURCE_META[r].accent}`}
                    title={`${RESOURCE_META[r].label} ${formatCompactFull(row.cumulative[r])}`}
                  >
                    {formatCompact(row.cumulative[r])}
                    <span className="sr-only"> {RESOURCE_META[r].label}</span>
                  </span>
                ))}
              </td>
              <Eta hours={row.hours.average} basisAt={basisAt} />
              <Eta hours={row.hours.planning} basisAt={basisAt} last />
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-slate-500">
        Totals are cumulative from the step you are saving for. Times assume
        all chests and bundles go toward mastery.
      </p>
    </div>
  );
}

function Eta({ hours, basisAt, last = false }) {
  const pad = last ? '' : 'pr-3';
  if (hours === null || hours === undefined) {
    return (
      <td className={`py-1.5 ${pad} text-right align-top text-slate-600`}>—</td>
    );
  }
  return (
    <td className={`py-1.5 ${pad} text-right align-top tabular-nums`}>
      <span className="text-slate-200">{formatDays(hours)}</span>
      {Number.isFinite(hours) && hours > 0 && (
        <span className="block text-xs text-slate-500">
          {formatDay(basisAt + hours * 3600_000)}
        </span>
      )}
    </td>
  );
}
