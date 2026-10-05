import { useState } from 'react';
import { MASTERY_RESOURCES } from '../../../lib/data/campMastery.js';
import { linearScale, niceTicks, timeTicks } from '../../../lib/chartScale.js';
import { formatCompact } from '../../../lib/format.js';
import { formatDay, formatWhen } from '../format.js';
import { Legend, Tooltip } from './chartKit.jsx';
import {
  AXIS_TEXT,
  GRID,
  RESOURCE_LABEL,
  SERIES_COLOR,
  SURFACE,
  useWidth,
} from './chartTheme.js';

const HEIGHT = 240;
const M = { top: 12, right: 12, bottom: 26, left: 44 };
const SHORT_DATE = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
});

// Stock of each resource at every reading (solid), then the projection for
// the step being saved for (dashed): chests credited at the latest reading,
// then income until every line meets its cost on the affordable date.
export default function StockChart({ log, row, projection }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);

  if (log.length === 0) {
    return (
      <div ref={ref}>
        <p className="text-subtle">Log a reading to start the chart.</p>
      </div>
    );
  }

  const points = log.map((e) => ({ t: Date.parse(e.at), e }));
  const t0 = points[0].t;
  const lastT = points[points.length - 1].t;
  const t1 = Math.max(projection?.endAt ?? lastT, lastT + 3600_000);
  const costs = row ? MASTERY_RESOURCES.map((r) => row.cumulative[r]) : [];
  const yMaxRaw = Math.max(
    ...costs,
    ...points.flatMap((p) => MASTERY_RESOURCES.map((r) => p.e[r])),
  );
  const yTicks = niceTicks(0, yMaxRaw, 4);
  const x = linearScale([t0, t1], [M.left, width - M.right]);
  const y = linearScale([yTicks.min, yTicks.max], [HEIGHT - M.bottom, M.top]);
  const xTicks = timeTicks(t0, t1, Math.max(2, Math.floor(width / 90)));

  // Cost reference lines, merging resources that share a value.
  const costLines = [];
  if (row) {
    for (const r of MASTERY_RESOURCES) {
      const v = row.cumulative[r];
      const same = costLines.find((c) => c.v === v);
      if (same) same.resources.push(r);
      else costLines.push({ v, resources: [r] });
    }
  }

  const onMove = (ev) => {
    const box = ev.currentTarget.getBoundingClientRect();
    const px = ev.clientX - box.left;
    let best = 0;
    for (let i = 1; i < points.length; i++) {
      if (Math.abs(x(points[i].t) - px) < Math.abs(x(points[best].t) - px))
        best = i;
    }
    setHover(best);
  };

  const hp = hover !== null ? points[hover] : null;

  return (
    <div ref={ref} className="flex flex-col gap-2">
      <Legend
        items={[
          ...MASTERY_RESOURCES.map((r) => ({
            key: r,
            resource: r,
            label: RESOURCE_LABEL[r],
          })),
          ...(projection
            ? [{ key: 'proj', dashed: true, label: 'Projected' }]
            : []),
        ]}
      />
      <div className="relative">
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`Stock over time${row ? `, projected to ${row.step.label}` : ''}`}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          {yTicks.ticks.map((v) => (
            <g key={v}>
              <line
                x1={M.left}
                x2={width - M.right}
                y1={y(v)}
                y2={y(v)}
                stroke={GRID}
              />
              <text
                x={M.left - 6}
                y={y(v)}
                dy="0.32em"
                textAnchor="end"
                fontSize="11"
                fill={AXIS_TEXT}
              >
                {formatCompact(v)}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text
              key={t}
              x={x(t)}
              y={HEIGHT - 8}
              textAnchor="middle"
              fontSize="11"
              fill={AXIS_TEXT}
            >
              {SHORT_DATE.format(t)}
            </text>
          ))}

          {costLines.map((c) => (
            <g key={c.v}>
              <line
                x1={M.left}
                x2={width - M.right}
                y1={y(c.v)}
                y2={y(c.v)}
                stroke={AXIS_TEXT}
                strokeOpacity="0.5"
                strokeDasharray="2 4"
              />
              <text
                x={M.left + 4}
                y={y(c.v) - 4}
                fontSize="11"
                fill={AXIS_TEXT}
              >
                {row.step.label}{' '}
                {c.resources
                  .map((r) => RESOURCE_LABEL[r].toLowerCase())
                  .join(' & ')}{' '}
                {formatCompact(c.v)}
              </text>
            </g>
          ))}

          {projection && (
            <g>
              <line
                x1={x(projection.endAt)}
                x2={x(projection.endAt)}
                y1={M.top}
                y2={HEIGHT - M.bottom}
                stroke={AXIS_TEXT}
                strokeOpacity="0.6"
              />
              <text
                x={x(projection.endAt) - 4}
                y={HEIGHT - M.bottom - 6}
                textAnchor="end"
                fontSize="11"
                fill="#e2e8f0"
              >
                Affordable {formatDay(projection.endAt)}
              </text>
              {MASTERY_RESOURCES.map((r) => {
                const l = projection.lines[r];
                return (
                  <g
                    key={r}
                    stroke={SERIES_COLOR[r]}
                    strokeWidth="2"
                    fill="none"
                  >
                    <line
                      x1={x(lastT)}
                      x2={x(lastT)}
                      y1={y(l.start)}
                      y2={y(l.credited)}
                      strokeDasharray="1 3"
                    />
                    <line
                      x1={x(lastT)}
                      x2={x(projection.endAt)}
                      y1={y(l.credited)}
                      y2={y(l.end)}
                      strokeDasharray="5 4"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {MASTERY_RESOURCES.map((r) => (
            <g key={r}>
              <polyline
                points={points.map((p) => `${x(p.t)},${y(p.e[r])}`).join(' ')}
                fill="none"
                stroke={SERIES_COLOR[r]}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {points.map((p, i) => (
                <circle
                  key={p.e.id}
                  cx={x(p.t)}
                  cy={y(p.e[r])}
                  r={hover === i ? 5 : 4}
                  fill={SERIES_COLOR[r]}
                  stroke={SURFACE}
                  strokeWidth="2"
                />
              ))}
            </g>
          ))}

          {hp && (
            <line
              x1={x(hp.t)}
              x2={x(hp.t)}
              y1={M.top}
              y2={HEIGHT - M.bottom}
              stroke={AXIS_TEXT}
              strokeOpacity="0.5"
              pointerEvents="none"
            />
          )}
          <rect
            x={M.left}
            y={M.top}
            width={Math.max(0, width - M.left - M.right)}
            height={HEIGHT - M.top - M.bottom}
            fill="transparent"
          />
        </svg>
        {hp && (
          <Tooltip x={x(hp.t)} y={M.top} width={width}>
            <div className="mb-1 font-medium text-slate-100">
              {formatWhen(hp.t)}
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
                <span className="tabular-nums">{formatCompact(hp.e[r])}</span>
              </div>
            ))}
          </Tooltip>
        )}
      </div>
    </div>
  );
}
