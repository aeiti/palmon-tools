// "Other Inventory" state helpers — custom items, empty/normalize, totals.
// Catalog data lives in src/lib/data/other.js.

import { OTHER_GROUPS, OTHER_ITEMS } from './data/other.js';

const OTHER_ITEM_KEYS = new Set(OTHER_ITEMS.map((i) => i.key));
const OTHER_GROUP_KEYS = new Set(OTHER_GROUPS.map((g) => g.key));

// Used by normalizeCustomOther when a custom item references a group key
// that no longer exists (e.g. the legacy `skill-evolution` group, which
// got split into `skillfruit` and `evolution-items` during a catalog
// restructure). Pinning to `utility` is more useful than falling through
// to OTHER_GROUPS[0] — orphan custom items end up in the visible
// catch-all group rather than the first user-facing group, and the user
// can re-pick a group from the UI.
const CUSTOM_FALLBACK_GROUP = 'utility';

const CUSTOM_PREFIX = 'custom:';

export function customItemKey(id) {
  return `${CUSTOM_PREFIX}${id}`;
}

export function isCustomItemKey(key) {
  return typeof key === 'string' && key.startsWith(CUSTOM_PREFIX);
}

export function customIdFromKey(key) {
  return isCustomItemKey(key) ? key.slice(CUSTOM_PREFIX.length) : null;
}

export function emptyCustomOther() {
  return [];
}

export function normalizeCustomOther(list) {
  if (!Array.isArray(list)) return [];
  const seenIds = new Set();
  const out = [];
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue;
    const id = typeof raw.id === 'string' && raw.id ? raw.id : null;
    const label =
      typeof raw.label === 'string' ? raw.label.trim().slice(0, 80) : '';
    const group = OTHER_GROUP_KEYS.has(raw.group)
      ? raw.group
      : CUSTOM_FALLBACK_GROUP;
    if (!id || !label || seenIds.has(id)) continue;
    seenIds.add(id);
    out.push({ id, label, group });
  }
  return out;
}

function customKeySet(customItems) {
  return new Set((customItems || []).map((c) => customItemKey(c.id)));
}

export function emptyOther(customItems = []) {
  const base = OTHER_ITEMS.reduce((acc, item) => {
    acc[item.key] = 0;
    return acc;
  }, {});
  for (const c of customItems) base[customItemKey(c.id)] = 0;
  return base;
}

export function normalizeOther(other, customItems = []) {
  const base = emptyOther(customItems);
  if (!other || typeof other !== 'object') return base;
  const customKeys = customKeySet(customItems);
  for (const key of Object.keys(other)) {
    if (!OTHER_ITEM_KEYS.has(key) && !customKeys.has(key)) continue;
    const raw = Number(other[key]);
    base[key] = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
  }
  return base;
}

function customItemsForGroup(groupKey, customItems = []) {
  return (customItems || [])
    .filter((c) => c.group === groupKey)
    .map((c) => ({
      key: customItemKey(c.id),
      label: c.label,
      group: c.group,
      custom: true,
      id: c.id,
    }));
}

export function itemsByGroup(groupKey, customItems = []) {
  return [
    ...OTHER_ITEMS.filter((i) => i.group === groupKey),
    ...customItemsForGroup(groupKey, customItems),
  ];
}

export function groupTotal(other, groupKey, customItems = []) {
  if (!other) return 0;
  return itemsByGroup(groupKey, customItems).reduce(
    (sum, item) => sum + (Number(other[item.key]) || 0),
    0,
  );
}

const REFUND_SUFFIX = '-refund';

// A handful of built-in items come in a base + refund pair (e.g. Epic
// Skillfruit + Epic Skillfruit (Refund), Earth Energy + Earth Energy
// (Refund), Mount Feed + Mount Feed (Refund)). The refund variant is the
// same resource returned from a refund — players plan against the
// combined count. Pairing is convention-based: a refund item's key is
// `<base>-refund` and the base key exists in OTHER_ITEMS.
export function baseKeyForRefund(refundKey) {
  if (typeof refundKey !== 'string' || !refundKey.endsWith(REFUND_SUFFIX)) {
    return null;
  }
  const baseKey = refundKey.slice(0, -REFUND_SUFFIX.length);
  return OTHER_ITEM_KEYS.has(baseKey) ? baseKey : null;
}

export function refundKeyForBase(baseKey) {
  if (typeof baseKey !== 'string') return null;
  const refundKey = `${baseKey}${REFUND_SUFFIX}`;
  return OTHER_ITEM_KEYS.has(refundKey) ? refundKey : null;
}

export function pairTotal(other, baseKey) {
  if (!other) return 0;
  const refundKey = refundKeyForBase(baseKey);
  if (!refundKey) return 0;
  const base = Number(other[baseKey]) || 0;
  const refund = Number(other[refundKey]) || 0;
  return base + refund;
}

export function hasAnyOther(other, customItems = []) {
  if (!other) return false;
  if (OTHER_ITEMS.some((item) => (Number(other[item.key]) || 0) > 0)) {
    return true;
  }
  return (customItems || []).some(
    (c) => (Number(other[customItemKey(c.id)]) || 0) > 0,
  );
}
