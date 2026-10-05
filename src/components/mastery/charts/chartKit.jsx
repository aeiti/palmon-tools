import { AXIS_TEXT, SERIES_COLOR } from './chartTheme.js';

// Small presentational pieces shared by the Camp Mastery charts.

export function Swatch({ resource, dashed = false }) {
  return dashed ? (
    <svg width="14" height="8" aria-hidden="true" className="inline-block">
      <line
        x1="0"
        y1="4"
        x2="14"
        y2="4"
        stroke={AXIS_TEXT}
        strokeWidth="2"
        strokeDasharray="3 2"
      />
    </svg>
  ) : (
    <span
      aria-hidden="true"
      className="inline-block h-2.5 w-2.5 rounded-sm"
      style={{ background: SERIES_COLOR[resource] }}
    />
  );
}

export function Legend({ items }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
      {items.map((it) => (
        <span key={it.key} className="inline-flex items-center gap-1.5">
          <Swatch resource={it.resource} dashed={it.dashed} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

// Floating tooltip positioned inside a `relative` chart wrapper. Flips to
// the left of the pointer when it would overflow the right edge.
export function Tooltip({ x, y, width, children }) {
  const flip = x > width - 170;
  return (
    <div
      className="pointer-events-none absolute z-10 min-w-36 rounded-md bg-slate-900/95 px-2.5 py-2 text-xs text-slate-200 shadow-lg ring-1 ring-slate-700"
      style={{
        top: Math.max(0, y - 10),
        left: flip ? undefined : x + 12,
        right: flip ? width - x + 12 : undefined,
      }}
    >
      {children}
    </div>
  );
}
