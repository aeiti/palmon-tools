// Schema helpers for the per-profile `planner` field: the queue slots the
// user is tracking, the cooldown last-fired timestamps, the hospital fill
// level, and the Duel<->FotP weighting knob. Pure functions only — the
// projection/engine math lives in planner.js, the CRUD wiring in
// useProfiles.js.

// Ten named queue slots: 4 building, 2 research, 4 training. `type` is the
// scoring/speedup type (research queues score as "tech"); `category` is the
// matching Speedup Inventory bucket, so the burn budget can read the counts
// the user already keeps.
export const QUEUE_SLOTS = [
  { key: 'B1', type: 'building', label: 'Build 1' },
  { key: 'B2', type: 'building', label: 'Build 2' },
  { key: 'B3', type: 'building', label: 'Build 3' },
  { key: 'B4', type: 'building', label: 'Build 4' },
  { key: 'R1', type: 'tech', label: 'Research 1' },
  { key: 'R2', type: 'tech', label: 'Research 2' },
  { key: 'T1', type: 'training', label: 'Train 1' },
  { key: 'T2', type: 'training', label: 'Train 2' },
  { key: 'T3', type: 'training', label: 'Train 3' },
  { key: 'T4', type: 'training', label: 'Train 4' },
];

const QUEUE_SLOT_KEYS = new Set(QUEUE_SLOTS.map((s) => s.key));

// Planner speedup type -> Speedup Inventory category key (see data/speedups.js).
export const SPEEDUP_TYPE_TO_CATEGORY = {
  building: 'construction',
  tech: 'research',
  training: 'training',
  healing: 'healing',
  general: 'universal',
};

export const COOLDOWN_KEYS = ['instabuild', 'instant-build', 'instant-research'];
const COOLDOWN_KEY_SET = new Set(COOLDOWN_KEYS);

// Hard game constant (mirrors schedule.json queues.hospital.capacity). Kept
// here too because normalize() runs at load, before schedule.json is fetched.
export const HOSPITAL_CAP = 18000;

const NAME_MAX = 80;

function isValidISO(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function clampInt(value, min, max, fallback = min) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function isQueueSlotKey(key) {
  return QUEUE_SLOT_KEYS.has(key);
}

export function isCooldownKey(key) {
  return COOLDOWN_KEY_SET.has(key);
}

export function emptyQueueItem() {
  return { name: '', completesAt: null };
}

export function emptyQueues() {
  const q = {};
  for (const slot of QUEUE_SLOTS) q[slot.key] = emptyQueueItem();
  return q;
}

export function emptyCooldowns() {
  const c = {};
  for (const key of COOLDOWN_KEYS) c[key] = null;
  return c;
}

export function emptyPlanner() {
  return {
    queues: emptyQueues(),
    cooldowns: emptyCooldowns(),
    hospitalFill: 0,
    weighting: 50, // 0 = full Duel, 50 = balanced, 100 = full FotP
  };
}

// Runtime (permissive) normalizer for a single queue slot: trims/clamps but
// never rejects a partial edit — a half-typed name with no timer is fine.
export function normalizeQueueItem(raw) {
  const name =
    typeof raw?.name === 'string' ? raw.name.trim().slice(0, NAME_MAX) : '';
  const completesAt = isValidISO(raw?.completesAt) ? raw.completesAt : null;
  return { name, completesAt };
}

function normalizeCooldownTs(raw) {
  return isValidISO(raw) ? raw : null;
}

// Load-time normalizer for the whole planner field. Always returns all ten
// slots and all three cooldown keys so consumers can index without guards.
export function normalizePlanner(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const queues = {};
  for (const slot of QUEUE_SLOTS) {
    queues[slot.key] = normalizeQueueItem(src.queues?.[slot.key]);
  }
  const cooldowns = {};
  for (const key of COOLDOWN_KEYS) {
    cooldowns[key] = normalizeCooldownTs(src.cooldowns?.[key]);
  }
  return {
    queues,
    cooldowns,
    hospitalFill: clampInt(src.hospitalFill, 0, HOSPITAL_CAP, 0),
    weighting: clampInt(src.weighting, 0, 100, 50),
  };
}
