import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import ProfilePicker from '../components/ui/ProfilePicker.jsx';
import ResetButton from '../components/ui/ResetButton.jsx';
import { useProfiles } from '../hooks/useProfiles.js';
import { ROUTES } from '../routes.js';
import { formatDHM } from '../lib/time.js';
import { categoryTotalMinutes } from '../lib/speedups.js';
import {
  HOSPITAL_CAP,
  QUEUE_SLOTS,
  SPEEDUP_TYPE_TO_CATEGORY,
} from '../lib/plannerState.js';
import {
  cooldownSchedule,
  doubleDipWindows,
  fotpSlotAt,
  nowStrip,
  plannerWarnings,
  queueRemainingMinutes,
  speedupBudget,
} from '../lib/planner.js';

// P1a: reads schedule.json + the profile's planner state and renders the
// "what's live now" strip, the double-dip calendar (P0), any warnings, the
// ten queue slots, the cooldown timelines, the hospital gauge, and the
// (read-only) speedup budget drawn from Speedup Inventory. The back-scheduler
// and burn planner (which turn all this into a dated recommendation stream)
// land in P1b.

const DOUBLE_DIP_HORIZON_DAYS = 7;

const QUEUE_GROUPS = [
  { kind: 'building', label: 'Building', keys: ['B1', 'B2', 'B3', 'B4'] },
  { kind: 'research', label: 'Research', keys: ['R1', 'R2'] },
  { kind: 'training', label: 'Training', keys: ['T1', 'T2', 'T3', 'T4'] },
];

const BUDGET_TYPES = [
  { key: 'building', label: 'Building' },
  { key: 'tech', label: 'Tech' },
  { key: 'training', label: 'Training' },
  { key: 'healing', label: 'Healing' },
];

const dayFmt = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});
const timeFmt = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});
const dateTimeFmt = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

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
  const { activeProfile, resetActivePlanner } = useProfiles();
  const planner = activeProfile.planner;

  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Planner"
        subtitle="When to start queues, burn speedups, and pop cooldowns — timed around the Guild Duel week and the Front of the Pack rotation. Times shown in your local timezone."
        actions={
          <ResetButton
            label="Reset planner"
            onReset={resetActivePlanner}
            confirmTitle="Reset planner?"
            confirmMessage="Clears all queue entries, cooldown timestamps, and the hospital fill for this profile. Your Speedup Inventory is not affected."
          />
        }
      />

      <ProfilePicker />

      {status === 'loading' && <p className="text-subtle">Loading schedule…</p>}

      {status === 'error' && (
        <div className="card ring-rose-500/40">
          <p className="text-sm text-rose-300">
            Couldn’t load the schedule ({String(error?.message ?? error)}).
          </p>
        </div>
      )}

      {status === 'ready' && (
        <>
          <WarningsPanel schedule={schedule} planner={planner} now={now} />
          <NowStrip schedule={schedule} now={now} />
          <QueuesPanel />
          <CooldownsPanel schedule={schedule} planner={planner} now={now} />
          <HospitalPanel schedule={schedule} planner={planner} />
          <BudgetPanel inventory={activeProfile.inventory} />
          <DoubleDipCalendar schedule={schedule} now={now} />
        </>
      )}
    </div>
  );
}

const WARN_STYLES = {
  danger: 'ring-rose-500/40 text-rose-300',
  warn: 'ring-amber-500/40 text-amber-300',
  info: 'ring-sky-500/40 text-sky-300',
};

function WarningsPanel({ schedule, planner, now }) {
  const warnings = plannerWarnings(schedule, planner, now);
  if (warnings.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {warnings.map((w) => (
        <div key={w.key} className={`card ${WARN_STYLES[w.level] ?? ''}`}>
          <p className="text-sm">{w.message}</p>
        </div>
      ))}
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
              : duel?.tags?.length
                ? `Scores: ${duel.tags.join(', ')}`
                : 'No queue-relevant scoring'}
          </span>
        </div>
      </div>
    </section>
  );
}

function QueuesPanel() {
  const now = useNow();
  const { activeProfile, updatePlannerQueue, clearPlannerQueueSlot } =
    useProfiles();
  const queues = activeProfile.planner.queues;

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="h-section">Queues</h2>
        <p className="text-subtle">
          Enter each active queue’s item and remaining time (read off the game
          UI). Timers count down live and feed the double-dip and burn planning.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {QUEUE_GROUPS.map((group) => (
          <section key={group.kind} className="panel">
            <header className="panel-header">{group.label}</header>
            <ul className="panel-body divide-y divide-slate-800/80">
              {group.keys.map((key) => {
                const slot = QUEUE_SLOTS.find((s) => s.key === key);
                return (
                  <QueueSlotRow
                    key={key}
                    slot={slot}
                    item={queues[key]}
                    now={now}
                    onUpdate={updatePlannerQueue}
                    onClear={clearPlannerQueueSlot}
                  />
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}

function QueueSlotRow({ slot, item, now, onUpdate, onClear }) {
  const [d, setD] = useState('');
  const [h, setH] = useState('');
  const [m, setM] = useState('');
  const remaining = queueRemainingMinutes(item, now);
  const active = Boolean(item.completesAt) && remaining > 0;

  const commit = () => {
    const mins =
      (Number(d) || 0) * 1440 + (Number(h) || 0) * 60 + (Number(m) || 0);
    if (mins <= 0) return;
    onUpdate(slot.key, {
      completesAt: new Date(Date.now() + mins * 60000).toISOString(),
    });
    setD('');
    setH('');
    setM('');
  };

  return (
    <li className="flex flex-col gap-2 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="w-8 shrink-0 text-xs font-semibold text-slate-400 tabular-nums">
          {slot.key}
        </span>
        <input
          type="text"
          value={item.name}
          onChange={(e) => onUpdate(slot.key, { name: e.target.value })}
          placeholder="Item (e.g. Barracks Lv 12)"
          aria-label={`${slot.label} item name`}
          className="input-inline min-w-0 flex-1"
        />
        {active && (
          <button
            type="button"
            onClick={() => onClear(slot.key)}
            className="btn-ghost shrink-0"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 pl-10">
        {active ? (
          <span className="text-sm text-slate-300">
            <span className="font-semibold tabular-nums">
              {formatDHM(remaining)}
            </span>{' '}
            left · done {dateTimeFmt.format(new Date(item.completesAt))}
          </span>
        ) : (
          <span className="text-subtle">No timer set</span>
        )}
        <span className="flex items-center gap-1 sm:ml-auto">
          <DhmInput value={d} onChange={setD} unit="d" label={slot.label} />
          <DhmInput value={h} onChange={setH} unit="h" label={slot.label} />
          <DhmInput value={m} onChange={setM} unit="m" label={slot.label} />
          <button type="button" onClick={commit} className="btn-secondary">
            {active ? 'Update' : 'Set'}
          </button>
        </span>
      </div>
    </li>
  );
}

function DhmInput({ value, onChange, unit, label }) {
  return (
    <span className="flex items-center gap-0.5">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label} ${unit}`}
        className="input-compact w-12"
      />
      <span className="text-xs text-slate-500">{unit}</span>
    </span>
  );
}

function CooldownsPanel({ schedule, planner, now }) {
  const { updatePlannerCooldown } = useProfiles();
  const rows = cooldownSchedule(schedule, planner, now);

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="h-section">Cooldowns</h2>
        <p className="text-subtle">
          Manual-fire abilities. Tap “Fire now” when you pop one — the schedule
          recomputes from that timestamp.
        </p>
      </div>

      <div className="panel">
        <ul className="panel-body divide-y divide-slate-800/80">
          {rows.map((cd) => (
            <li key={cd.key} className="flex flex-col gap-1 px-3 py-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-sm font-semibold text-slate-100">
                  {cd.label}
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    {cd.source} · {cd.effect}
                    {cd.scores ? ' · scores' : ''}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updatePlannerCooldown(cd.key, new Date().toISOString())
                    }
                    className="btn-secondary"
                  >
                    Fire now
                  </button>
                  {cd.lastFired && (
                    <button
                      type="button"
                      onClick={() => updatePlannerCooldown(cd.key, null)}
                      className="btn-ghost"
                    >
                      Clear
                    </button>
                  )}
                </span>
              </div>
              <span className="text-sm text-slate-400">
                <CooldownStatus cd={cd} now={now} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CooldownStatus({ cd, now }) {
  if (!cd.ready && cd.readyAt) {
    const mins = (cd.readyAt.getTime() - now.getTime()) / 60000;
    return (
      <>
        Ready in{' '}
        <span className="font-semibold tabular-nums">{formatDHM(mins)}</span> (
        {dateTimeFmt.format(cd.readyAt)})
        {cd.nextFire && <> · aim for {dateTimeFmt.format(cd.nextFire)}</>}
      </>
    );
  }
  if (cd.hold && cd.nextFire) {
    return (
      <span className="text-amber-300">
        Ready now · hold until {dateTimeFmt.format(cd.nextFire)}
      </span>
    );
  }
  return <span className="text-emerald-300">Ready now — pop it</span>;
}

function HospitalPanel({ schedule, planner }) {
  const { updatePlannerHospital } = useProfiles();
  const cap = schedule.queues?.hospital?.capacity ?? HOSPITAL_CAP;
  const fill = planner.hospitalFill ?? 0;
  const pct = Math.min(100, Math.round((fill / cap) * 100));

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="h-section">Hospital</h2>
        <p className="text-subtle">
          Injuries fill one queue up to {cap.toLocaleString()} — overflow
          becomes permanent deaths. Hold injuries as Fri/Sat healing-burn fodder
          only while headroom covers planned combat.
        </p>
      </div>

      <div className="card flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-300" htmlFor="hospital-fill">
          Current injuries
        </label>
        <input
          id="hospital-fill"
          type="number"
          min="0"
          max={cap}
          value={fill}
          onChange={(e) => updatePlannerHospital(e.target.value)}
          className="input w-28 tabular-nums"
        />
        <span className="text-subtle tabular-nums">
          {pct}% of {cap.toLocaleString()} ·{' '}
          {(cap - fill).toLocaleString()} headroom
        </span>
        <div className="h-2 w-full overflow-hidden rounded bg-slate-700">
          <div
            className={`h-full ${pct >= 90 ? 'bg-rose-500' : 'bg-indigo-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </section>
  );
}

function BudgetPanel({ inventory }) {
  const budget = speedupBudget(
    inventory,
    SPEEDUP_TYPE_TO_CATEGORY,
    categoryTotalMinutes,
  );

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="h-section">Speedup budget</h2>
        <p className="text-subtle">
          Drawn from your{' '}
          <Link to={ROUTES.inventorySpeedups} className="link-inline">
            Speedup Inventory
          </Link>
          . General (Universal) speedups count as whatever type they’re spent
          on, so they’re added to every row and spent last.
        </p>
      </div>

      <div className="panel">
        <div className="panel-body divide-y divide-slate-800/80">
          {BUDGET_TYPES.map((t) => (
            <div
              key={t.key}
              className="flex items-baseline justify-between gap-4 px-3 py-2"
            >
              <span className="text-sm font-semibold text-slate-100">
                {t.label}
              </span>
              <span className="text-sm text-slate-300 tabular-nums">
                {formatDHM(budget[t.key].specific)}
                <span className="text-slate-500">
                  {' '}
                  (+general → {formatDHM(budget[t.key].withGeneral)})
                </span>
              </span>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 px-3 py-2">
            <span className="text-sm font-semibold text-slate-100">
              General
            </span>
            <span className="text-sm text-slate-300 tabular-nums">
              {formatDHM(budget.general)}
            </span>
          </div>
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
