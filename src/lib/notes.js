// Per-profile notes: small free-form journal entries categorized by
// subject (player / event / item / palmon / building / other) with an
// optional link to a catalog entity. Stored on profile.notes as an array.

import { PALMON_SPECIES_BY_KEY } from './data/palmon.js';
import { BUILDINGS } from './data/buildings.js';

export const NOTE_CATEGORIES = [
  { key: 'player', label: 'Player' },
  { key: 'event', label: 'Event' },
  { key: 'item', label: 'Item' },
  { key: 'palmon', label: 'Palmon' },
  { key: 'building', label: 'Building' },
  { key: 'other', label: 'Other' },
];

const CATEGORY_KEYS = new Set(NOTE_CATEGORIES.map((c) => c.key));

export const NOTE_LINK_TYPES = [
  { key: 'palmon', label: 'Palmon' },
  { key: 'building', label: 'Building' },
];

const BUILDINGS_BY_KEY = BUILDINGS.reduce((acc, b) => {
  acc[b.key] = b;
  return acc;
}, {});

function makeId() {
  return `nt_${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

export function emptyNote() {
  const ts = nowIso();
  return {
    id: makeId(),
    title: '',
    body: '',
    category: 'other',
    link: null,
    createdAt: ts,
    updatedAt: ts,
  };
}

function normalizeLink(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.type === 'palmon') {
    return typeof raw.key === 'string' && PALMON_SPECIES_BY_KEY[raw.key]
      ? { type: 'palmon', key: raw.key }
      : null;
  }
  if (raw.type === 'building') {
    return typeof raw.key === 'string' && BUILDINGS_BY_KEY[raw.key]
      ? { type: 'building', key: raw.key }
      : null;
  }
  return null;
}

function normalizeIso(value, fallback) {
  if (typeof value === 'string') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return fallback;
}

export function normalizeNote(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  const body = typeof raw.body === 'string' ? raw.body : '';
  // Drop entirely-empty notes — no title, no body. These can pile up if
  // the user clicks Add and then navigates away.
  if (!title && !body) return null;
  const category =
    typeof raw.category === 'string' && CATEGORY_KEYS.has(raw.category)
      ? raw.category
      : 'other';
  const fallbackTs = nowIso();
  const createdAt = normalizeIso(raw.createdAt, fallbackTs);
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : makeId(),
    title,
    body,
    category,
    link: normalizeLink(raw.link),
    createdAt,
    updatedAt: normalizeIso(raw.updatedAt, createdAt),
  };
}

export function normalizeNotes(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const norm = normalizeNote(item);
    if (!norm) continue;
    if (seen.has(norm.id)) norm.id = makeId();
    seen.add(norm.id);
    out.push(norm);
  }
  return out;
}

export function noteLinkLabel(link) {
  if (!link) return '';
  if (link.type === 'palmon') {
    return PALMON_SPECIES_BY_KEY[link.key]?.name || '';
  }
  if (link.type === 'building') {
    return BUILDINGS_BY_KEY[link.key]?.label || '';
  }
  return '';
}

export function noteLinkOptionsFor(type) {
  if (type === 'palmon') {
    return Object.values(PALMON_SPECIES_BY_KEY)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => ({ value: s.key, label: s.name }));
  }
  if (type === 'building') {
    return BUILDINGS.slice()
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((b) => ({ value: b.key, label: b.label }));
  }
  return [];
}
