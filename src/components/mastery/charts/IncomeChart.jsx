import { useState } from 'react';
import { MASTERY_RESOURCES } from '../../../lib/data/campMastery.js';
import { linearScale, niceTicks } from '../../../lib/chartScale.js';
import { formatCompact } from '../../../lib/format.js';
import { formatWhen } from '../format.js';
import { Legend, Tooltip } from './chartKit.jsx';
import {
  AXIS_TEXT,
  GRID,
  RESOURCE_LABEL,
  SERIES_COLOR,
  barPath,
  useWidth,
} from './chartTheme.js';

const HEIGHT = 200;
const M = { top: 12, right: 8, bottom: 26, left: 44 };
const MAX_INTERVALS = 12;
const SHORT_DATE = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
});

// Net income per hour for each gap between readings (the latest 12), one
// bar per resource. Shows whether the rate is rising or falling, which a
// single average hides.
export default function IncomeChart({ intervals }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);

  if (intervals.length === 0) {
    return (
      <div ref={ref}>
        <p className="text-subtle">Needs two readings.</p>
      </div>
    );
  }

  const shown = intervals.slice(-MAX_INTERVALS);
  const values = shown.flatMap((iv) =>
    MASTERY_RESOURCES.map((r) => iv.rate[r]),
  );
  const yTicks = niceTicks(Math.min(0, ...values), Math.max(0, ...values), 4);
  const y = linearScale([yTicks.min, yTicks.max], [HEIGHT - M.bottom, M.top]);
  const plotW = width - M.left - M.right;
  const groupW = plotW / shown.length;
  const pad = Math.min(16, groupW * 0.25);
  const barW = Math.max(2, (groupW - pad - 2 * 2) / 3);
  const labelEvery = Math.max(
    1,
    Math.ceil(shown.length / Math.floor(plotW / 56)),
  );

  return (
    <div ref={ref} className="flex flex-col gap-2">
      <Legend
        items={MASTERY_RESOURCES.map((r) => ({
          key: r,
          resource: r,
          label: RESOURCE_LABEL[r],
        }))}
      />
      <div className="relative">
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label="Net income per hour between readings"
        >
          {yTicks.ticks.map((v) => (
            <g key={v}>
              <line
                x1={M.left}
                x2={width - M.right}
                y1={y(v)}
                y2={y(v)}
                stroke={v === 0 ? AXIS_TEXT : GRID}
                strokeOpacity={v === 0 ? 0.6 : 1}
              />
              <text
                x={M.left - 6}
                y={y(v)}
                dy="0.32em"
                textAnchor="end"
                fontSize="11"
                fill={AXIS_TEXT}
              >
                {formatCompact(v)}/h
              </text>
            </g>
          ))}
          {shown.map((iv, i) => {
            const gx = M.left + i * groupW + pad / 2;
            return (
              <g
                key={iv.to}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              >
                <rect
                  x={M.left + i * groupW}
                  y={M.top}
                  width={groupW}
                  height={HEIGHT - M.top - M.bottom}
                  fill={hover === i ? 'rgba(148,163,184,0.08)' : 'transparent'}
                />
                {MASTERY_RESOURCES.map((r, j) => (
                  <path
                    key={r}
                    d={barPath(gx + j * (barW + 2), barW, y(0), y(iv.rate[r]))}
                    fill={SERIES_COLOR[r]}
                  />
                ))}
                {i % labelEvery === 0 && (
                  <text
                    x={M.left + (i + 0.5) * groupW}
                    y={HEIGHT - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fill={AXIS_TEXT}
                  >
                    {SHORT_DATE.format(iv.to)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <Tooltip x={M.left + (hover + 0.5) * groupW} y={M.top} width={width}>
            <div className="mb-1 font-medium text-slate-100">
              {formatWhen(shown[hover].from)} → {formatWhen(shown[hover].to)}
            </div>
            <div className="mb-1 text-slate-400">
              {shown[hover].hours.toFixed(1)} h
            </div>
            {MASTERY_RESOURCES.map((r) => (
              <div key={r} className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-sm"
                    style={{ background: SERIES_COLOR[r] }}
                  />
                  {RESOURCE_LABEL[r]}
                </span>
                <span className="tabular-nums">
                  {formatCompact(shown[hover].rate[r])}/h
                </span>
              </div>
            ))}
          </Tooltip>
        )}
      </div>
      <p className="text-xs text-slate-500">
        Bars dated by the later reading. Choice chests earned are not shown
        here; they count toward the projection.
      </p>
    </div>
  );
}
