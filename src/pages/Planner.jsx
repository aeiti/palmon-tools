import { useEffect, useMemo, useState } from 'react';
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import { formatDHM } from '../lib/time.js';
import {
  doubleDipWindows,
  fotpSlotAt,
  nowStrip,
} from '../lib/planner.js';

// P0 skeleton: reads the shared schedule.json and renders the two immediately
// useful views — a "right now" strip (live FotP stage + Duel theme) and a
// double-dip calendar (upcoming FotP slots that also score under the Duel
// theme of the day). The planner core (queue entry, burn planner, cooldown
// scheduler) lands in P1.

const DOUBLE_DIP_HORIZON_DAYS = 7;

function useNow(intervalMs = 60000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function useSchedule() {
  const [state, setState] = useState({ status: 'loading', schedule: null });
  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}schedule.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((schedule) => {
        if (!cancelled) setState({ status: 'ready', schedule });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', error });
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

const dayFmt = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});
const timeFmt = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});

function EstimatedBadge() {
  return (
    <span
      className="badge bg-amber-500/15 text-amber-300 ring-amber-500/40"
      title="Rates for this stage are placeholders awaiting an in-game screenshot."
    >
      est.
    </span>
  );
}

export default function Planner() {
  const now = useNow();
  const { status, schedule, error } = useSchedule();

  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Planner"
        subtitle="When to start queues, burn speedups, and pop cooldowns — timed around the Guild Duel week and the Front of the Pack rotation. Times shown in your local timezone."
      />

      {status === 'loading' && (
        <p className="text-subtle">Loading schedule…</p>
      )}

      {status === 'error' && (
        <div className="card ring-rose-500/40">
          <p className="text-sm text-rose-300">
            Couldn’t load the schedule ({String(error?.message ?? error)}).
          </p>
        </div>
      )}

      {status === 'ready' && (
        <>
          <NowStrip schedule={schedule} now={now} />
          <DoubleDipCalendar schedule={schedule} now={now} />
        </>
      )}
    </div>
  );
}

function NowStrip({ schedule, now }) {
  const { fotp, duel, anchorExpired } = nowStrip(schedule, now);
  const nextSlot = fotpSlotAt(schedule, fotp.end);
  const remainingMin = (fotp.end.getTime() - now.getTime()) / 60000;

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="h-section">Right now</h2>
        <p className="text-subtle">
          {schedule.fotp.anchor.eventName} event · game clock{' '}
          {schedule.gameClock.timezone} (UTC{schedule.gameClock.utcOffsetHours})
        </p>
      </div>

      {anchorExpired && (
        <div className="card ring-amber-500/40">
          <p className="text-sm text-amber-300">
            ⚠️ The FotP event anchor has expired — the rotation below may be
            stale. Re-anchor from an in-game calendar screenshot.
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card flex flex-col gap-1">
          <span className="h-eyebrow">Front of the Pack</span>
          <span className="flex items-center gap-2 text-lg font-semibold text-slate-100">
            {fotp.stage?.label ?? fotp.stageKey}
            {fotp.stage?.source === 'estimated' && <EstimatedBadge />}
          </span>
          <span className="text-subtle">
            {formatDHM(remainingMin)} left · next: {nextSlot.stage?.label}
          </span>
        </div>

        <div className="card flex flex-col gap-1">
          <span className="h-eyebrow">Guild Duel</span>
          <span className="text-lg font-semibold text-slate-100">
            {duel?.theme ?? '—'}
          </span>
          <span className="text-subtle">
            {duel?.off
              ? 'Rest day — no Duel scoring'
              : (duel?.tags?.length
                  ? `Scores: ${duel.tags.join(', ')}`
                  : 'No queue-relevant scoring')}
          </span>
        </div>
      </div>
    </section>
  );
}

function DoubleDipCalendar({ schedule, now }) {
  const groups = useMemo(() => {
    const windows = doubleDipWindows(schedule, now, DOUBLE_DIP_HORIZON_DAYS);
    const byDay = new Map();
    for (const w of windows) {
      const key = dayFmt.format(w.start);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(w);
    }
    return [...byDay.entries()];
  }, [schedule, now]);

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="h-section">Double-dip windows</h2>
        <p className="text-subtle">
          Upcoming FotP slots (next {DOUBLE_DIP_HORIZON_DAYS} days) that also
          score under that day’s Duel theme — the best moments to burn.
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="text-subtle">
          No double-dip windows in the next {DOUBLE_DIP_HORIZON_DAYS} days.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map(([day, windows]) => (
            <section key={day} className="panel">
              <header className="panel-header">{day}</header>
              <ul className="panel-body divide-y divide-slate-800/80">
                {windows.map((w) => (
                  <li
                    key={w.slotIndex}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-3 py-2"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                      {timeFmt.format(w.start)}–{timeFmt.format(w.end)}
                      <span className="font-normal text-slate-300">
                        {w.stageLabel}
                      </span>
                      {w.stageSource === 'estimated' && <EstimatedBadge />}
                    </span>
                    <span className="text-sm text-slate-400">
                      {w.duelTheme} · {w.tags.join(', ')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
