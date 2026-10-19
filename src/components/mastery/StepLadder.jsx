import { useState } from 'react';
import { MASTERY_RESOURCES } from '../../lib/data/campMastery.js';
import { formatCompact, formatCompactFull } from '../../lib/format.js';
import { Swatch } from './charts/chartKit.jsx';
import { RESOURCE_LABEL } from './charts/chartTheme.js';
import { formatDay, formatDays } from './format.js';

const PREVIEW_ROWS = 5;

// Remaining steps with their cumulative gold / lumber / steel cost (one
// column each) and when each becomes affordable at `rateKey` ('average' or
// 'planning'). Shows the next few steps, with the rest behind a toggle.
export default function StepLadder({ rows, basisAt, rateKey }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? rows : rows.slice(0, PREVIEW_ROWS);

  return (
    <div>
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-400">
            <th className="py-1 pr-2 font-medium sm:pr-3">Step</th>
            {MASTERY_RESOURCES.map((r) => (
              <th key={r} className="py-1 pr-2 text-right font-medium sm:pr-3">
                <span className="inline-flex items-center gap-1">
                  <Swatch resource={r} />
                  {RESOURCE_LABEL[r]}
                </span>
              </th>
            ))}
            <th className="py-1 text-right font-medium">When</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/60">
          {shown.map((row) => {
            const hours = row.hours[rateKey];
            return (
              <tr key={row.step.key}>
                <td className="py-1.5 pr-2 align-top text-slate-200 sm:pr-3">
                  {row.step.label}
                </td>
                {MASTERY_RESOURCES.map((r) => (
                  <td
                    key={r}
                    className="py-1.5 pr-2 text-right align-top tabular-nums text-slate-300 sm:pr-3"
                    title={`${RESOURCE_LABEL[r]} ${formatCompactFull(row.cumulative[r])}`}
                  >
                    {formatCompact(row.cumulative[r])}
                  </td>
                ))}
                <td className="py-1.5 text-right align-top tabular-nums">
                  {hours === null || hours === undefined ? (
                    <span className="text-slate-600">—</span>
                  ) : (
                    <>
                      <span className="text-slate-200">
                        {formatDays(hours)}
                      </span>
                      {Number.isFinite(hours) && hours > 0 && (
                        <span className="block text-xs text-slate-500">
                          {formatDay(basisAt + hours * 3600_000)}
                        </span>
                      )}
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          Cumulative from the step you&apos;re saving for, at the{' '}
          {rateKey === 'average' ? 'measured' : 'planning'} rate, with every
          chest put toward mastery.
        </p>
        {rows.length > PREVIEW_ROWS && (
          <button
            type="button"
            className="btn-secondary px-2.5 py-1 text-xs"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? 'Show fewer' : `Show all ${rows.length}`}
          </button>
        )}
      </div>
    </div>
  );
}
