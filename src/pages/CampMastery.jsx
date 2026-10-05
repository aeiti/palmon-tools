import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles.js';
import ResourceSnapshot from '../components/inventory/ResourceSnapshot.jsx';
import MasteryProgress from '../components/mastery/MasteryProgress.jsx';
import MasterySettings from '../components/mastery/MasterySettings.jsx';
import StepLadder from '../components/mastery/StepLadder.jsx';
import StockLog from '../components/mastery/StockLog.jsx';
import IncomeChart from '../components/mastery/charts/IncomeChart.jsx';
import StepTimeline from '../components/mastery/charts/StepTimeline.jsx';
import StockChart from '../components/mastery/charts/StockChart.jsx';
import {
  formatDay,
  formatDays,
  formatWhen,
} from '../components/mastery/format.js';
import ProfilePicker from '../components/ui/ProfilePicker.jsx';
import SectionCard from '../components/ui/SectionCard.jsx';
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import {
  chestWorth,
  masteryChestValues,
  measureRates,
  projectionBasis,
  projectSteps,
  readingIntervals,
  stockProjection,
  uniformRate,
} from '../lib/campMastery.js';
import { MASTERY_RESOURCES } from '../lib/data/campMastery.js';
import {
  leveledValuesWithOverrides,
  totalResourcesFromChests,
} from '../lib/resourceTotals.js';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'readings', label: 'Readings' },
  { key: 'steps', label: 'Steps' },
];

export default function CampMastery() {
  const profiles = useProfiles();
  const {
    activeProfile,
    updateMasteryLogEntry,
    deleteMasteryLogEntry,
    setMasteryCurrentStep,
    markMasteryStepBought,
    updateMasteryPlanningRate,
    resetActiveMastery,
  } = profiles;

  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === params.get('tab'))
    ? params.get('tab')
    : 'overview';
  const setTab = (key) =>
    setParams(key === 'overview' ? {} : { tab: key }, { replace: true });
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Only used when the log is empty; a page-load timestamp is close enough.
  const [openedAt] = useState(() => Date.now());

  const { mastery, onHand, other } = activeProfile;
  const chestValues = masteryChestValues(
    leveledValuesWithOverrides(
      activeProfile.level,
      activeProfile.leveledChestOverrides,
    ),
  );
  const basis = projectionBasis(mastery.log, onHand, other, openedAt);
  const measured = measureRates(mastery.log, mastery.completed, 3, chestValues);
  const rates = {
    average: measured.average,
    recent: measured.recent,
    planning:
      mastery.planningRate > 0 ? uniformRate(mastery.planningRate) : null,
  };
  const rateKey = rates.average ? 'average' : 'planning';
  // Fixed: resource chests plus random mastery chests. Flexible: choice
  // chests and bundles from the latest reading.
  const resourceChests = totalResourcesFromChests(
    activeProfile.chests,
    activeProfile.level,
    activeProfile.leveledChestOverrides,
  );
  const worth = chestWorth(basis.chests, chestValues);
  const pool = { fixed: {}, flexible: worth.flexible };
  for (const r of MASTERY_RESOURCES) {
    pool.fixed[r] = worth.fixed[r] + resourceChests[r];
  }
  const rows = projectSteps({
    completed: mastery.completed,
    stock: basis.stock,
    pool,
    rates: { average: rates.average, planning: rates.planning },
  });
  const current = rows[0] ?? null;
  const hours = current ? current.hours[rateKey] : null;
  const projection = current
    ? stockProjection(current, basis, pool, rates[rateKey], hours)
    : null;

  const startLogging = () => {
    setTab('readings');
    // Let the Readings tab render, then bring its log bar into view.
    setTimeout(() => {
      document
        .getElementById('mastery-tabs')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Camp Mastery"
        subtitle="Log your gold, lumber and steel over time to measure your income and see when you can afford each Camp Mastery step."
      />

      <ProfilePicker />

      <section className="card flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div>
            <div className="h-eyebrow">Saving for</div>
            <div className="text-lg font-semibold text-slate-100">
              {current ? current.step.label : 'All steps done'}
            </div>
          </div>
          {current && (
            <div className="sm:text-right">
              <div className="text-3xl font-semibold tabular-nums text-slate-100">
                {current.affordableNow ? 'Now' : formatDays(hours)}
              </div>
              <div className="text-subtle">
                {current.affordableNow
                  ? 'Affordable with stock and chests'
                  : hours === null
                    ? 'Log two readings or set a planning rate'
                    : `Affordable ${formatDay(basis.at + hours * 3600_000)}`}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-primary" onClick={startLogging}>
            Log reading
          </button>
          {current && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => markMasteryStepBought(current.step.key)}
            >
              I bought {current.step.label}
            </button>
          )}
          <button
            type="button"
            className="btn-secondary ml-auto"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((v) => !v)}
          >
            Settings
          </button>
        </div>
        <p className="text-xs text-slate-500">
          {mastery.log.length > 0
            ? `Last reading ${formatWhen(basis.at)}`
            : 'No readings yet'}
          {measured.hours > 0 &&
            ` · rate measured over ${measured.hours.toFixed(1)} h`}
          {rateKey === 'planning' && rates.planning && ' · using planning rate'}
        </p>
        {settingsOpen && (
          <div className="border-t border-slate-700/60 pt-4">
            <MasterySettings
              key={current?.step.key ?? 'done'}
              profileName={activeProfile.name}
              planningRate={mastery.planningRate}
              currentKey={current?.step.key ?? ''}
              onPlanningRate={updateMasteryPlanningRate}
              onSetCurrent={setMasteryCurrentStep}
              onReset={resetActiveMastery}
            />
          </div>
        )}
      </section>

      <div
        id="mastery-tabs"
        role="tablist"
        aria-label="Camp Mastery sections"
        className="flex scroll-mt-28 gap-1 rounded-lg bg-slate-800/60 p-1 ring-1 ring-slate-700/80"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={[
              'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              tab === t.key
                ? 'bg-slate-700 text-slate-100'
                : 'text-slate-400 hover:text-slate-200',
            ].join(' ')}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {current && (
            <SectionCard title={`Progress to ${current.step.label}`}>
              <MasteryProgress
                row={current}
                basis={basis}
                pool={pool}
                rates={rates}
                rateKey={rateKey}
              />
            </SectionCard>
          )}
          <SectionCard title="Stock over time">
            <StockChart
              log={mastery.log}
              row={current}
              projection={projection}
            />
          </SectionCard>
          <SectionCard title="Income per hour">
            <IncomeChart
              intervals={readingIntervals(
                mastery.log,
                mastery.completed,
                chestValues,
              )}
            />
          </SectionCard>
        </>
      )}

      {tab === 'readings' && (
        <>
          <ResourceSnapshot
            profile={activeProfile}
            actions={profiles}
            lastLoggedAt={mastery.log.length > 0 ? basis.at : null}
          />
          <SectionCard title="Reading log">
            <StockLog
              key={activeProfile.id}
              log={mastery.log}
              onUpdate={updateMasteryLogEntry}
              onDelete={deleteMasteryLogEntry}
            />
          </SectionCard>
        </>
      )}

      {tab === 'steps' &&
        (rows.length === 0 ? (
          <p className="text-subtle">Every mastery step is complete.</p>
        ) : (
          <>
            <SectionCard title="Timeline">
              <StepTimeline rows={rows} basisAt={basis.at} rateKey={rateKey} />
            </SectionCard>
            <SectionCard title="Remaining steps">
              <StepLadder rows={rows} basisAt={basis.at} rateKey={rateKey} />
            </SectionCard>
          </>
        ))}
    </div>
  );
}
