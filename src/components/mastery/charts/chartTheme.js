import { useCallback, useRef, useState } from 'react';
import { CHEST_RESOURCES } from '../../../lib/data/chests.js';

// Shared pieces for the Camp Mastery charts.
//
// Series colours are validated as a set against the card surface (#1a2232,
// dark): worst all-pairs CVD ΔE 8.4, normal-vision ΔE 19.8, all ≥ 3:1. They
// identify gold / lumber / steel on marks and swatches only — text stays in
// the slate text tokens.
export const SERIES_COLOR = {
  gold: '#c98500',
  lumber: '#199e70',
  steel: '#3987e5',
};

export const RESOURCE_LABEL = Object.fromEntries(
  CHEST_RESOURCES.map((r) => [r.key, r.label]),
);

export const AXIS_TEXT = '#94a3b8'; // slate-400
export const GRID = 'rgba(51, 65, 85, 0.6)'; // slate-700/60
export const SURFACE = '#1a2232';

// Width of a container in CSS pixels, so the SVG can be drawn at 1:1 and
// text stays legible on phones. Returns a callback ref: the observer
// re-attaches whenever the measured element changes (e.g. an empty state
// swapping for the chart).
export function useWidth(fallback = 600) {
  const [width, setWidth] = useState(fallback);
  const observer = useRef(null);
  const ref = useCallback((el) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      if (w > 0) setWidth(w);
    });
    ro.observe(el);
    observer.current = ro;
  }, []);
  return [ref, width];
}

// Rounded-top bar from the baseline: 4px radius on the data end only, the
// baseline end square. Handles negative values (bar grows downward).
export function barPath(x, w, yBase, yVal) {
  const h = Math.abs(yBase - yVal);
  const r = Math.min(4, w / 2, h);
  if (yVal <= yBase) {
    return `M${x},${yBase}V${yVal + r}Q${x},${yVal} ${x + r},${yVal}H${x + w - r}Q${x + w},${yVal} ${x + w},${yVal + r}V${yBase}Z`;
  }
  return `M${x},${yBase}V${yVal - r}Q${x},${yVal} ${x + r},${yVal}H${x + w - r}Q${x + w},${yVal} ${x + w},${yVal - r}V${yBase}Z`;
}
