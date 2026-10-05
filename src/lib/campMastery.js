// Camp Mastery tracker: per-profile state helpers (empty / normalize), plus
// the pure projection math — measured income rates from a stock log, chest
// pools, and when each remaining mastery step becomes affordable.
//
// Profile shape:
//   mastery: {
//     log: [{ id, at, gold, lumber, steel, chests, note }],  // oldest first
//     completed: { [stepKey]: isoString | null },     // null = done before tracking
//     planningRate: number,                           // per resource, per hour
//   }
//
// `chests` maps each MASTERY_CHESTS key to a count, or null when the reading
// didn't record it (readings logged before chests were tracked).

import {
  MASTERY_CHESTS,
  MASTERY_RESOURCES,
  MASTERY_STEPS,
  MASTERY_STEP_KEYS,
} from './data/campMastery.js';

const HOUR_MS = 3600 * 1000;
const STEP_KEYS = new Set(MASTERY_STEP_KEYS);

// ---- State ------------------------------------------------------------------

export function emptyMastery() {
  return { log: [], completed: {}, planningRate: 0 };
}

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function nonNegativeInt(raw) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function parseTime(raw) {
  if (typeof raw !== 'string' || raw === '') return null;
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : null;
}

// One log entry. Returns null when the timestamp is unusable — an entry
// without a time can't contribute to a rate, so there is nothing to keep.
export function normalizeMasteryEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const t = parseTime(raw.at);
  if (t === null) return null;
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : makeId(),
    at: new Date(t).toISOString(),
    gold: nonNegativeInt(raw.gold),
    lumber: nonNegativeInt(raw.lumber),
    steel: nonNegativeInt(raw.steel),
    chests: normalizeEntryChests(raw.chests),
    note: typeof raw.note === 'string' ? raw.note : '',
  };
}

function normalizeEntryChests(raw) {
  const out = {};
  for (const c of MASTERY_CHESTS) {
    const v = raw && typeof raw === 'object' ? raw[c.key] : null;
    out[c.key] =
      v === null || v === undefined || v === '' ? null : nonNegativeInt(v);
  }
  return out;
}

export function sortLog(log) {
  return [...log].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}

function normalizeCompleted(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [key, value] of Object.entries(raw)) {
    if (!STEP_KEYS.has(key)) continue;
    const t = parseTime(value);
    out[key] = t === null ? null : new Date(t).toISOString();
  }
  return out;
}

// Load-time normalize: drops unusable entries, dedupes by id, sorts by time,
// and drops completion records for step keys that no longer exist.
export function normalizeMastery(raw) {
  if (!raw || typeof raw !== 'object') return emptyMastery();
  const seen = new Set();
  const log = [];
  for (const item of Array.isArray(raw.log) ? raw.log : []) {
    const entry = normalizeMasteryEntry(item);
    if (!entry || seen.has(entry.id)) continue;
    seen.add(entry.id);
    log.push(entry);
  }
  return {
    log: sortLog(log),
    completed: normalizeCompleted(raw.completed),
    planningRate: nonNegativeInt(raw.planningRate),
  };
}

// ---- Steps ------------------------------------------------------------------

// Index of the first step not yet completed; MASTERY_STEPS.length when the
// whole ladder is done.
export function currentStepIndex(completed) {
  const done = completed || {};
  const i = MASTERY_STEPS.findIndex((s) => !(s.key in done));
  return i === -1 ? MASTERY_STEPS.length : i;
}

// "I'm working toward step N": every earlier step becomes completed (keeping
// any purchase date already recorded, otherwise null = before tracking), and
// every step from N onward is cleared.
export function setCurrentStep(completed, stepKey) {
  const target = MASTERY_STEP_KEYS.indexOf(stepKey);
  if (target === -1) return completed || {};
  const out = {};
  MASTERY_STEPS.slice(0, target).forEach((s) => {
    out[s.key] = completed?.[s.key] ?? null;
  });
  return out;
}

// Total cost of steps purchased in the window (fromMs, toMs]. Those
// resources left the stockpile without showing up as a drop in income, so
// a rate measured across the purchase has to add them back.
export function costBoughtBetween(completed, fromMs, toMs) {
  const total = zero();
  for (const s of MASTERY_STEPS) {
    const t = parseTime(completed?.[s.key]);
    if (t === null || t <= fromMs || t > toMs) continue;
    for (const r of MASTERY_RESOURCES) total[r] += s.cost[r];
  }
  return total;
}

// ---- Rates ------------------------------------------------------------------

function zero() {
  return { gold: 0, lumber: 0, steel: 0 };
}

// Per-chest value of each MASTERY_CHESTS entry. `leveledValues` is a row of
// leveled chest values for the player (leveledValuesWithOverrides()).
export function masteryChestValues(leveledValues) {
  const out = {};
  for (const c of MASTERY_CHESTS) {
    out[c.key] = c.leveledTier
      ? Number(leveledValues?.[c.leveledTier]?.gold) || 0
      : c.value;
  }
  return out;
}

// What a set of chest counts is worth: `fixed` per resource (random chests,
// split evenly) and a `flexible` pool (choice chests). Null counts are 0.
export function chestWorth(counts, values) {
  const fixed = zero();
  let flexible = 0;
  for (const c of MASTERY_CHESTS) {
    const worth = (Number(counts?.[c.key]) || 0) * (values?.[c.key] || 0);
    if (c.kind === 'choice') flexible += worth;
    else for (const r of MASTERY_RESOURCES) fixed[r] += worth / MASTERY_RESOURCES.length;
  }
  return { fixed, flexible };
}

// Change in chest worth between two readings, counting only chest types
// both readings recorded. Opening chests lowers it while raising stock, so
// opened chests cancel out instead of reading as income; chests earned
// from events raise it, which is income.
function chestWorthDelta(first, last, values) {
  const delta = { ...zero(), flexible: 0 };
  for (const c of MASTERY_CHESTS) {
    const a = first.chests?.[c.key];
    const b = last.chests?.[c.key];
    if (a === null || a === undefined || b === null || b === undefined) continue;
    const worth = (b - a) * (values?.[c.key] || 0);
    if (c.kind === 'choice') delta.flexible += worth;
    else for (const r of MASTERY_RESOURCES) delta[r] += worth / MASTERY_RESOURCES.length;
  }
  return delta;
}

function rateBetween(first, last, completed, values) {
  const from = Date.parse(first.at);
  const to = Date.parse(last.at);
  const hours = (to - from) / HOUR_MS;
  if (!(hours > 0)) return null;
  const bought = costBoughtBetween(completed, from, to);
  const chests = chestWorthDelta(first, last, values);
  const rate = { flexible: chests.flexible / hours };
  for (const r of MASTERY_RESOURCES) {
    rate[r] = (last[r] - first[r] + bought[r] + chests[r]) / hours;
  }
  return { rate, hours };
}

// Net income per hour, measured from the log: gold / lumber / steel, plus
// `flexible` — choice-chest value gained per hour, which can go to any of
// the three. Pass masteryChestValues() as `values` to count chests.
// - average: first entry → latest entry.
// - recent: the last `window` intervals (window + 1 entries).
// Each is null until there are two entries with distinct times.
export function measureRates(log, completed, window = 3, values = null) {
  const sorted = sortLog(log || []);
  const n = sorted.length;
  if (n < 2) return { average: null, recent: null, hours: 0 };
  const last = sorted[n - 1];
  const avg = rateBetween(sorted[0], last, completed, values);
  const start = sorted[Math.max(0, n - 1 - Math.max(1, window))];
  const recent = rateBetween(start, last, completed, values);
  return {
    average: avg?.rate ?? null,
    recent: recent?.rate ?? null,
    hours: avg?.hours ?? 0,
  };
}

export function uniformRate(perHour) {
  const v = Math.max(0, Number(perHour) || 0);
  return { gold: v, lumber: v, steel: v, flexible: 0 };
}

// ---- Projection -------------------------------------------------------------

// Hours until every `need` is covered, after pointing the `flexible` pool
// wherever it shortens the wait most. `rates` may carry a `flexible` rate:
// choice-chest value earned per hour, which grows the pool over time.
// Returns the hours and the split of the pool at that moment.
//
// The optimal split leaves every resource the pool touches finishing at the
// same moment T, so we solve
//   Σ max(0, need_i − rate_i · T) = flexible + flexibleRate · T
// for T by bisection. A negative flexible rate (choice chests opened faster
// than earned) is folded into the resource rates first, shared in
// proportion to them, so both sides stay monotonic in T.
export function hoursToAfford(need, rates, flexible = 0) {
  const pool = Math.max(0, flexible);
  const base = {};
  for (const r of MASTERY_RESOURCES) base[r] = rates?.[r] || 0;
  let poolRate = rates?.flexible || 0;
  if (poolRate < 0) {
    const positive = MASTERY_RESOURCES.reduce((a, r) => a + Math.max(0, base[r]), 0);
    if (positive > 0) {
      for (const r of MASTERY_RESOURCES) {
        if (base[r] > 0) base[r] += poolRate * (base[r] / positive);
      }
    }
    poolRate = 0;
  }
  const shortAt = (T) => {
    const out = zero();
    for (const r of MASTERY_RESOURCES) {
      const n = Math.max(0, need[r] || 0);
      out[r] = base[r] > 0 ? Math.max(0, n - base[r] * T) : n;
    }
    return out;
  };
  const sum = (o) => MASTERY_RESOURCES.reduce((a, r) => a + o[r], 0);
  const fits = (T) => sum(shortAt(T)) <= pool + poolRate * T;

  if (fits(0)) return { hours: 0, allocation: shortAt(0) };

  let hi = 0;
  for (const r of MASTERY_RESOURCES) {
    if (base[r] > 0) hi = Math.max(hi, (need[r] || 0) / base[r]);
  }
  if (!fits(hi)) {
    if (!(poolRate > 0)) return { hours: Infinity, allocation: shortAt(hi) };
    // Only the growing pool can close the remaining gap.
    hi = Math.max(hi, (sum(shortAt(hi)) - pool) / poolRate);
  }
  let lo = 0;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) hi = mid;
    else lo = mid;
  }
  return { hours: hi, allocation: shortAt(hi) };
}

// For every step from the current one to the top of the ladder: the
// cumulative cost, the remaining shortfall after stock and fixed chests, and
// hours to afford it at each of the given rates (with the flexible pool
// allocated optimally).
//
// `rates` is a map like { average: {gold,…} | null, planning: {gold,…} | null }.
export function projectSteps({ completed, stock, pool, rates }) {
  const start = currentStepIndex(completed);
  const fixed = pool?.fixed || zero();
  const flexible = pool?.flexible || 0;
  const cumulative = zero();
  const rows = [];
  for (let i = start; i < MASTERY_STEPS.length; i++) {
    const s = MASTERY_STEPS[i];
    const shortStock = zero();
    const need = zero();
    for (const r of MASTERY_RESOURCES) {
      cumulative[r] += s.cost[r];
      shortStock[r] = Math.max(0, cumulative[r] - (stock?.[r] || 0));
      need[r] = Math.max(0, shortStock[r] - fixed[r]);
    }
    const hours = {};
    const allocation = {};
    for (const [name, rate] of Object.entries(rates || {})) {
      if (!rate) {
        hours[name] = null;
        allocation[name] = null;
        continue;
      }
      const res = hoursToAfford(need, rate, flexible);
      hours[name] = res.hours;
      allocation[name] = res.allocation;
    }
    rows.push({
      step: s,
      cumulative: { ...cumulative },
      shortStock,
      need,
      affordableNow: hoursToAfford(need, zero(), flexible).hours === 0,
      hours,
      allocation,
    });
  }
  return rows;
}

// The basis a projection starts from: the latest log entry if there is one,
// otherwise the on-hand stockpile as of now. Chest counts come from the
// latest entry, falling back to `otherCounts` (Other Inventory) for any
// chest that entry didn't record.
export function projectionBasis(log, onHand, otherCounts, nowMs) {
  const sorted = sortLog(log || []);
  const last = sorted[sorted.length - 1];
  const chests = {};
  for (const c of MASTERY_CHESTS) {
    const v = last?.chests?.[c.key];
    chests[c.key] =
      v === null || v === undefined ? nonNegativeInt(otherCounts?.[c.key]) : v;
  }
  if (last) {
    return {
      at: Date.parse(last.at),
      stock: { gold: last.gold, lumber: last.lumber, steel: last.steel },
      chests,
    };
  }
  return {
    at: nowMs,
    stock: {
      gold: nonNegativeInt(onHand?.gold),
      lumber: nonNegativeInt(onHand?.lumber),
      steel: nonNegativeInt(onHand?.steel),
    },
    chests,
  };
}
