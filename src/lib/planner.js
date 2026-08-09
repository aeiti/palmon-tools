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
