// Camp Mastery tracker: per-profile state helpers (empty / normalize), plus
// the pure projection math — measured income rates from a stock log, chest
// pools, and when each remaining mastery step becomes affordable.
//
// Profile shape:
//   mastery: {
//     log: [{ id, at, gold, lumber, steel, note }],  // sorted oldest first
//     completed: { [stepKey]: isoString | null },     // null = done before tracking
//     planningRate: number,                           // per resource, per hour
//   }

import {
  MASTERY_BUNDLES,
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
    note: typeof raw.note === 'string' ? raw.note : '',
  };
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

function rateBetween(first, last, completed) {
  const from = Date.parse(first.at);
  const to = Date.parse(last.at);
  const hours = (to - from) / HOUR_MS;
  if (!(hours > 0)) return null;
  const bought = costBoughtBetween(completed, from, to);
  const rate = zero();
  for (const r of MASTERY_RESOURCES) {
    rate[r] = (last[r] - first[r] + bought[r]) / hours;
  }
  return { rate, hours };
}

// Net income per hour per resource, measured from the log.
// - average: first entry → latest entry.
// - recent: the last `window` intervals (window + 1 entries).
// Each is null until there are two entries with distinct times.
export function measureRates(log, completed, window = 3) {
  const sorted = sortLog(log || []);
  const n = sorted.length;
  if (n < 2) return { average: null, recent: null, hours: 0 };
  const last = sorted[n - 1];
  const avg = rateBetween(sorted[0], last, completed);
  const start = sorted[Math.max(0, n - 1 - Math.max(1, window))];
  const recent = rateBetween(start, last, completed);
  return {
    average: avg?.rate ?? null,
    recent: recent?.rate ?? null,
    hours: avg?.hours ?? 0,
  };
}

export function uniformRate(perHour) {
  const v = Math.max(0, Number(perHour) || 0);
  return { gold: v, lumber: v, steel: v };
}

// ---- Chests -----------------------------------------------------------------

// Splits chest value into what is already tied to a resource (`fixed`) and a
// pool the player can point at any of the three (`flexible`).
// - resourceChestTotals: Resource Inventory's opened-chest totals.
// - otherCounts: profile.other, for the two mastery bundle items.
export function masteryChestPool(resourceChestTotals, otherCounts) {
  const fixed = zero();
  for (const r of MASTERY_RESOURCES) {
    fixed[r] = Math.max(0, Number(resourceChestTotals?.[r]) || 0);
  }
  const supply = nonNegativeInt(otherCounts?.[MASTERY_BUNDLES.supply.otherKey]);
  const perResource = (supply * MASTERY_BUNDLES.supply.value) / MASTERY_RESOURCES.length;
  for (const r of MASTERY_RESOURCES) fixed[r] += perResource;
  const awakening = nonNegativeInt(
    otherCounts?.[MASTERY_BUNDLES.awakening.otherKey],
  );
  return { fixed, flexible: awakening * MASTERY_BUNDLES.awakening.value };
}

// Turns a resource allocation of the flexible pool into whole bundle counts
// that never exceed `available`: floor each share, then hand leftover
// bundles to the largest remainders. Rounding each share up instead can ask
// for more bundles than the player has.
export function splitBundles(allocation, bundleValue, available) {
  const out = { gold: 0, lumber: 0, steel: 0 };
  if (!allocation || !(bundleValue > 0)) return out;
  const exact = MASTERY_RESOURCES.map((r) => ({
    r,
    x: Math.max(0, allocation[r] || 0) / bundleValue,
  }));
  const want = Math.min(
    Math.max(0, Math.floor(available) || 0),
    Math.ceil(exact.reduce((a, e) => a + e.x, 0) - 1e-9),
  );
  let used = 0;
  for (const e of exact) {
    out[e.r] = Math.floor(e.x);
    used += out[e.r];
  }
  const byRemainder = [...exact].sort(
    (a, b) => (b.x - Math.floor(b.x)) - (a.x - Math.floor(a.x)),
  );
  for (const e of byRemainder) {
    if (used >= want) break;
    if (e.x - Math.floor(e.x) <= 1e-9) continue;
    out[e.r] += 1;
    used += 1;
  }
  return out;
}

// ---- Projection -------------------------------------------------------------

// Hours until every `need` is covered by income at `rates`, after pointing
// the `flexible` pool wherever it shortens the wait most. Returns the hours
// and the split of the pool. The optimal split leaves every resource the
// pool touches finishing at the same moment T, so we solve
//   Σ max(0, need_i − rate_i · T) = flexible
// for T by bisection. A resource with no positive income can only be covered
// by the pool; if the pool can't cover those, hours is Infinity.
export function hoursToAfford(need, rates, flexible = 0) {
  const pool = Math.max(0, flexible);
  const shortAt = (T) => {
    const out = zero();
    for (const r of MASTERY_RESOURCES) {
      const n = Math.max(0, need[r] || 0);
      const rate = rates?.[r] || 0;
      out[r] = rate > 0 ? Math.max(0, n - rate * T) : n;
    }
    return out;
  };
  const sum = (o) => MASTERY_RESOURCES.reduce((a, r) => a + o[r], 0);

  const atZero = shortAt(0);
  if (sum(atZero) <= pool) return { hours: 0, allocation: atZero };

  let hi = 0;
  for (const r of MASTERY_RESOURCES) {
    const rate = rates?.[r] || 0;
    if (rate > 0) hi = Math.max(hi, (need[r] || 0) / rate);
  }
  const atHi = shortAt(hi);
  if (sum(atHi) > pool) {
    // Zero-income shortfalls exceed the pool: never affordable.
    return { hours: Infinity, allocation: atHi };
  }
  let lo = 0;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (sum(shortAt(mid)) > pool) lo = mid;
    else hi = mid;
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
// otherwise the on-hand stockpile as of now.
export function projectionBasis(log, onHand, nowMs) {
  const sorted = sortLog(log || []);
  const last = sorted[sorted.length - 1];
  if (last) {
    return {
      at: Date.parse(last.at),
      stock: { gold: last.gold, lumber: last.lumber, steel: last.steel },
    };
  }
  return {
    at: nowMs,
    stock: {
      gold: nonNegativeInt(onHand?.gold),
      lumber: nonNegativeInt(onHand?.lumber),
      steel: nonNegativeInt(onHand?.steel),
    },
  };
}
