// Pure projection helpers for the Queue Planner. Everything here is a pure
// function of (schedule, instant) so it can be unit-tested without a clock or
// a DOM. `schedule` is the parsed public/schedule.json object; `now`/`from`
// are always JS Date instants (absolute time), never wall-clock strings.
//
// Time model: the game runs on a FIXED UTC-2 offset (Atlantic/South_Georgia,
// no DST), so server-local wall-clock fields are recovered by shifting the
// absolute instant by the offset and reading UTC fields — no Intl timezone
// database needed, and the result is deterministic for tests.

function mod(n, m) {
  return ((n % m) + m) % m;
}

// Server-local calendar fields for an instant, using the fixed UTC-2 offset.
export function serverParts(schedule, date) {
  const offset = schedule.gameClock.utcOffsetHours;
  const shifted = new Date(date.getTime() + offset * 3600 * 1000);
  return {
    weekday: shifted.getUTCDay(), // 0 = Sunday .. 6 = Saturday
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

// --- Guild Duel ---------------------------------------------------------

export function duelDayForWeekday(schedule, weekday) {
  return schedule.duel.days.find((d) => d.weekday === weekday) ?? null;
}

// The Duel theme in effect at `date` (server-local weekday). Sunday is the
// off day. Returns the day entry from schedule.duel.days (or null).
export function duelThemeAt(schedule, date) {
  const { weekday } = serverParts(schedule, date);
  return duelDayForWeekday(schedule, weekday);
}

// --- Front of the Pack rotation ----------------------------------------

function anchorMs(schedule) {
  return Date.parse(schedule.fotp.anchor.day1DateTime);
}

function slotMs(schedule) {
  return schedule.fotp.rotation.slotHours * 3600 * 1000;
}

function anchorStageIndex(schedule) {
  return schedule.fotp.rotation.order.indexOf(
    schedule.fotp.anchor.day1StartStage,
  );
}

// Integer index of the 4h slot containing `date`, measured from the anchor.
// Negative before the anchor, which is fine — the rotation is periodic.
export function fotpSlotIndexAt(schedule, date) {
  return Math.floor((date.getTime() - anchorMs(schedule)) / slotMs(schedule));
}

// The stage key for a given absolute slot index.
export function fotpStageForSlotIndex(schedule, index) {
  const { order } = schedule.fotp.rotation;
  return order[mod(anchorStageIndex(schedule) + index, order.length)];
}

// Full slot descriptor for a given absolute slot index.
export function fotpSlotByIndex(schedule, index) {
  const start = new Date(anchorMs(schedule) + index * slotMs(schedule));
  const end = new Date(start.getTime() + slotMs(schedule));
  const stageKey = fotpStageForSlotIndex(schedule, index);
  return {
    index,
    stageKey,
    stage: schedule.fotp.stages[stageKey],
    start,
    end,
  };
}

// The FotP slot active at `date`.
export function fotpSlotAt(schedule, date) {
  return fotpSlotByIndex(schedule, fotpSlotIndexAt(schedule, date));
}

// The next `count` slots starting with the one containing `from` (inclusive).
export function fotpSlots(schedule, from, count) {
  const startIndex = fotpSlotIndexAt(schedule, from);
  return Array.from({ length: count }, (_, i) =>
    fotpSlotByIndex(schedule, startIndex + i),
  );
}

// Whether the current FotP anchor has expired at `date` (guardrail: past this
// the rotation is stale and needs a re-anchor screenshot).
export function anchorExpired(schedule, date) {
  const expires = schedule.fotp.anchor.expires;
  return expires ? date.getTime() >= Date.parse(expires) : false;
}

// --- Double-dip windows -------------------------------------------------

// A double-dip is a FotP stage slot whose scoring tag also scores under that
// day's Duel theme (e.g. an Upgrade Buildings slot landing on a Tue/Fri/Sat).
// Enumerates every slot over `horizonDays` from `from` and keeps the ones
// whose stage tags intersect the coincident Duel day's tags.
export function doubleDipWindows(schedule, from, horizonDays) {
  const slotCount = horizonDays * schedule.fotp.rotation.slotsPerDay;
  const windows = [];
  for (const slot of fotpSlots(schedule, from, slotCount)) {
    const duelDay = duelThemeAt(schedule, slot.start);
    if (!duelDay || duelDay.off) continue;
    const stageTags = slot.stage?.tags ?? [];
    const shared = stageTags.filter((t) => duelDay.tags.includes(t));
    if (shared.length === 0) continue;
    windows.push({
      start: slot.start,
      end: slot.end,
      slotIndex: slot.index,
      stageKey: slot.stageKey,
      stageLabel: slot.stage?.label ?? slot.stageKey,
      stageSource: slot.stage?.source ?? 'estimated',
      duelKey: duelDay.key,
      duelTheme: duelDay.theme,
      tags: shared,
    });
  }
  return windows;
}

// --- Now-strip convenience ---------------------------------------------

// Snapshot of "what's live right now": current FotP slot + current Duel theme,
// plus the anchor-expiry flag. Everything the now-strip needs in one call.
export function nowStrip(schedule, now) {
  return {
    fotp: fotpSlotAt(schedule, now),
    duel: duelThemeAt(schedule, now),
    anchorExpired: anchorExpired(schedule, now),
  };
}

// --- Queue timing -------------------------------------------------------

// Whole minutes of active timer left on a queue item (0 if empty/done).
export function queueRemainingMinutes(item, now) {
  if (!item?.completesAt) return 0;
  const diffMs = Date.parse(item.completesAt) - now.getTime();
  return diffMs > 0 ? Math.floor(diffMs / 60000) : 0;
}

// --- Cooldown scheduler -------------------------------------------------

// Instabuild (camp order) wants to land on building-scoring Duel days; the
// Tue -> Thu -> Sat phase puts 2 of 3 pops on scoring days. Class skills (free
// time-shaving that destroys burnable minutes) want dead days (Sun/Mon).
const INSTABUILD_TARGET_WEEKDAYS = [2, 4, 6]; // Tue, Thu, Sat
const CLASS_SKILL_TARGET_WEEKDAYS = [0, 1]; // Sun, Mon
const COOLDOWN_TARGET_HOUR = 8; // server-local hour to aim a pop at

// Build an absolute instant from server-local wall-clock fields (fixed offset).
function serverWallToInstant(schedule, y, month, day, hour, minute = 0) {
  const offset = schedule.gameClock.utcOffsetHours;
  return new Date(Date.UTC(y, month, day, hour, minute, 0) - offset * 3600 * 1000);
}

// Earliest instant at/after `from` whose server-local weekday is in `weekdays`
// and whose server-local time is `hour`:00.
export function nextServerWeekdayAtHour(schedule, from, weekdays, hour) {
  const offset = schedule.gameClock.utcOffsetHours;
  const shifted = new Date(from.getTime() + offset * 3600 * 1000);
  const y = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth();
  const day = shifted.getUTCDate();
  for (let i = 0; i < 8; i += 1) {
    const cand = serverWallToInstant(schedule, y, month, day + i, hour);
    if (
      cand.getTime() >= from.getTime() &&
      weekdays.includes(serverParts(schedule, cand).weekday)
    ) {
      return cand;
    }
  }
  return null;
}

function targetWeekdaysFor(cooldownKey) {
  return cooldownKey === 'instabuild'
    ? INSTABUILD_TARGET_WEEKDAYS
    : CLASS_SKILL_TARGET_WEEKDAYS;
}

// Per-cooldown status: when it's ready, when to fire it next under its phase
// policy, and whether it's ready-but-should-hold.
export function cooldownSchedule(schedule, plannerState, now) {
  const fired = plannerState?.cooldowns ?? {};
  return schedule.cooldowns.map((cd) => {
    const lastFired = fired[cd.key] ? new Date(Date.parse(fired[cd.key])) : null;
    const readyAt = lastFired
      ? new Date(lastFired.getTime() + cd.cooldownHours * 3600 * 1000)
      : null;
    const ready = !readyAt || readyAt.getTime() <= now.getTime();
    const availableFrom = readyAt && readyAt > now ? readyAt : now;
    const nextFire = nextServerWeekdayAtHour(
      schedule,
      availableFrom,
      targetWeekdaysFor(cd.key),
      COOLDOWN_TARGET_HOUR,
    );
    const hold = ready && nextFire != null && nextFire.getTime() > now.getTime();
    return {
      key: cd.key,
      label: cd.label,
      source: cd.source,
      effect: cd.effect,
      scores: cd.scores,
      cooldownHours: cd.cooldownHours,
      lastFired,
      readyAt,
      ready,
      nextFire,
      hold,
    };
  });
}

// --- Speedup budget (reads the existing Speedup Inventory) --------------

// Minutes available per planner speedup type, from the profile's Speedup
// Inventory. General (Universal) is added to each specific type because a
// general speedup scores as whatever type it's spent on.
export function speedupBudget(inventory, typeToCategory, categoryTotalMinutes) {
  const out = {};
  const generalMin = categoryTotalMinutes(inventory?.[typeToCategory.general]);
  for (const type of Object.keys(typeToCategory)) {
    if (type === 'general') {
      out.general = generalMin;
      continue;
    }
    const specific = categoryTotalMinutes(inventory?.[typeToCategory[type]]);
    out[type] = { specific, withGeneral: specific + generalMin };
  }
  return out;
}

// --- Warnings -----------------------------------------------------------

// Non-burn warnings computable in P1a: hospital headroom and a stale FotP
// anchor. (Queue-depth / burn-cannibalization warnings arrive with the burn
// planner.) Cooldown holds surface through cooldownSchedule().
export function plannerWarnings(schedule, plannerState, now) {
  const warnings = [];
  const cap = schedule.queues?.hospital?.capacity ?? Infinity;
  const fill = plannerState?.hospitalFill ?? 0;
  if (Number.isFinite(cap) && fill >= cap * 0.9) {
    warnings.push({
      key: 'hospital',
      level: fill >= cap ? 'danger' : 'warn',
      message:
        fill >= cap
          ? `Hospital at capacity (${fill}/${cap}) — further casualties become permanent deaths. Heal down before fighting.`
          : `Hospital at ${fill}/${cap} — nearing the cap. Heal down before fighting; overflow becomes permanent deaths.`,
    });
  }
  if (anchorExpired(schedule, now)) {
    warnings.push({
      key: 'anchor',
      level: 'warn',
      message:
        'FotP event anchor has expired — the rotation may be stale. Re-anchor from an in-game calendar screenshot.',
    });
  }
  return warnings;
}
