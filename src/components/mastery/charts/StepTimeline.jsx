import { useState } from 'react';
import { linearScale, timeTicks } from '../../../lib/chartScale.js';
import { formatDay, formatDays } from '../format.js';
import { Tooltip } from './chartKit.jsx';
import { AXIS_TEXT, GRID, SURFACE, useWidth } from './chartTheme.js';

const HEIGHT = 100;
const AXIS_Y = 46;
const PAD_X = 16;
const SHORT_DATE = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  year: '2-digit',
});
const DOT = '#e2e8f0'; // slate-200: one series, no identity colour needed

// The remaining steps on a calendar: one dot per step at the date it
// becomes affordable. Mastery ranks (31 … 35) are labelled; every dot has
// a tooltip. Steps that are never reached at this rate are left off.
export default function StepTimeline({ rows, basisAt, rateKey }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);

  const dated = rows
    .map((row) => ({ row, hours: row.hours[rateKey] }))
    .filter(
      (d) =>
        d.hours !== null && d.hours !== undefined && Number.isFinite(d.hours),
    )
    .map((d) => ({ ...d, t: basisAt + d.hours * 3600_000 }));

  if (dated.length === 0) {
    return (
      <div ref={ref}>
        <p className="text-subtle">Needs a measured or planning rate.</p>
      </div>
    );
  }

  const t0 = Math.min(basisAt, dated[0].t);
  const t1 = Math.max(dated[dated.length - 1].t, t0 + 86_400_000);
  const x = linearScale([t0, t1], [PAD_X, width - PAD_X]);
  const ticks = timeTicks(t0, t1, Math.max(2, Math.floor(width / 80)));
  const isRank = (key) => !key.includes('-');
  const hd = hover !== null ? dated[hover] : null;

  // Mastery ranks are labelled above the axis, skipping any that would sit
  // within MIN_GAP px of the previous one (the dot and tooltip remain). The
  // current step is labelled below, so it never competes with them.
  const MIN_GAP = 28;
  const labelled = new Set();
  let lastX = -Infinity;
  dated.forEach((d, i) => {
    if (!isRank(d.row.step.key)) return;
    const px = x(d.t);
    if (px - lastX < MIN_GAP) return;
    labelled.add(i);
    lastX = px;
  });

  return (
    <div ref={ref} className="relative">
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label="When each remaining step becomes affordable"
      >
        <line
          x1={PAD_X}
          x2={width - PAD_X}
          y1={AXIS_Y}
          y2={AXIS_Y}
          stroke={GRID}
          strokeWidth="2"
        />
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={x(t)}
              x2={x(t)}
              y1={AXIS_Y + 4}
              y2={AXIS_Y + 8}
              stroke={AXIS_TEXT}
            />
            <text
              x={x(t)}
              y={HEIGHT - 6}
              textAnchor="middle"
              fontSize="11"
              fill={AXIS_TEXT}
            >
              {SHORT_DATE.format(t)}
            </text>
          </g>
        ))}
        {dated.map((d, i) => (
          <g
            key={d.row.step.key}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
          >
            <circle cx={x(d.t)} cy={AXIS_Y} r="12" fill="transparent" />
            <circle
              cx={x(d.t)}
              cy={AXIS_Y}
              r={isRank(d.row.step.key) || i === 0 ? 5 : 3.5}
              fill={DOT}
              fillOpacity={isRank(d.row.step.key) || i === 0 ? 1 : 0.6}
              stroke={SURFACE}
              strokeWidth="2"
            />
            {labelled.has(i) && (
              <text
                x={x(d.t)}
                y={AXIS_Y - 12}
                textAnchor="middle"
                fontSize="11"
                fill="#e2e8f0"
              >
                M{Number(d.row.step.key) - 30}
              </text>
            )}
            {i === 0 && (
              <text
                x={x(d.t)}
                y={AXIS_Y + 22}
                textAnchor="start"
                fontSize="11"
                fontWeight="600"
                fill="#e2e8f0"
              >
                Next: {d.row.step.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      {hd && (
        <Tooltip x={x(hd.t)} y={AXIS_Y + 8} width={width}>
          <div className="font-medium text-slate-100">{hd.row.step.label}</div>
          <div className="text-slate-300">
            {formatDay(hd.t)} · {formatDays(hd.hours)}
          </div>
        </Tooltip>
      )}
      <p className="mt-1 text-xs text-slate-500">
        M1–M5 mark Mastery ranks 31–35. At the{' '}
        {rateKey === 'average' ? 'measured' : 'planning'} rate.
      </p>
    </div>
  );
}
