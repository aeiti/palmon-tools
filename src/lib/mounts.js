// Per-profile mount state helpers: empty value, runtime and load-time
// normalizers. Catalog data (MOUNTS, thresholds, helpers) lives in
// src/lib/data/mounts.js.

import { MAX_MOUNT_LEVEL, MOUNTS } from './data/mounts.js';

const MOUNT_KEYS = new Set(MOUNTS.map((m) => m.key));

function clampLevel(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(MAX_MOUNT_LEVEL, Math.floor(n));
}

function clampPower(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.floor(n);
}

export function emptyMountEntry() {
  return { level: 0, power: 0 };
}

export function emptyMounts() {
  return Object.fromEntries(MOUNTS.map((m) => [m.key, emptyMountEntry()]));
}

// Permissive — returns a clean entry shape from any partial input. Used at
// runtime inside updateMount's fallback so half-typed edits (e.g. {level: 5}
// with no power) don't blow away the existing record.
export function normalizeMountEntry(raw) {
  if (!raw || typeof raw !== 'object') return emptyMountEntry();
  return {
    level: clampLevel(raw.level),
    power: clampPower(raw.power),
  };
}

// Load-time normalizer — drops unknown mount keys, fills missing ones with
// empties, clamps values. Always returns the full 7-key shape so callers
// don't need to guard on a missing mount.
export function normalizeMounts(raw) {
  const base = emptyMounts();
  if (!raw || typeof raw !== 'object') return base;
  for (const key of Object.keys(raw)) {
    if (!MOUNT_KEYS.has(key)) continue;
    base[key] = normalizeMountEntry(raw[key]);
  }
  return base;
}
