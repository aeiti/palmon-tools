import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles.js';
import MasteryProgress from '../components/mastery/MasteryProgress.jsx';
import StepLadder from '../components/mastery/StepLadder.jsx';
import StockLog from '../components/mastery/StockLog.jsx';
import { formatWhen } from '../components/mastery/format.js';
import CompactInput from '../components/ui/CompactInput.jsx';
import ProfilePicker from '../components/ui/ProfilePicker.jsx';
import ResetButton from '../components/ui/ResetButton.jsx';
import SectionCard from '../components/ui/SectionCard.jsx';
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import {
  chestWorth,
  masteryChestValues,
  measureRates,
  projectionBasis,
  projectSteps,
  uniformRate,
} from '../lib/campMastery.js';
import { MASTERY_RESOURCES } from '../lib/data/campMastery.js';
import {
  leveledValuesWithOverrides,
  totalResourcesFromChests,
} from '../lib/resourceTotals.js';
import { ROUTES } from '../routes.js';

export default function CampMastery() {
  const {
    activeProfile,
    addMasteryLogEntry,
    updateMasteryLogEntry,
    deleteMasteryLogEntry,
    setMasteryCurrentStep,
    markMasteryStepBought,
    updateMasteryPlanningRate,
    resetActiveMastery,
  } = useProfiles();

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
    planning: mastery.planningRate > 0 ? uniformRate(mastery.planningRate) : null,
  };
  // Fixed: resource chests from Resource Inventory plus random mastery
  // chests. Flexible: choice chests and bundles from the latest reading.
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

  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Camp Mastery"
        subtitle="Log your gold, lumber and steel over time to measure your income and see when you can afford each Camp Mastery step."
      />

      <ProfilePicker />

      <SectionCard
        title="Progress"
        actions={
          <ResetButton
            onReset={resetActiveMastery}
            confirmTitle="Reset Camp Mastery?"
            confirmMessage={`Delete every stock reading, step record and the planning rate for "${activeProfile.name}".`}
          />
        }
      >
        {rows.length === 0 ? (
          <p className="text-subtle">Every mastery step is complete.</p>
        ) : (
          <MasteryProgress
            row={rows[0]}
            basis={basis}
            pool={pool}
            rates={rates}
            onBought={markMasteryStepBought}
            onSetCurrent={setMasteryCurrentStep}
          />
        )}
        <p className="mt-3 text-xs text-slate-500">
          {mastery.log.length > 0
            ? `Projected from your reading on ${formatWhen(basis.at)}`
            : 'Projected from on-hand stock'}
          {measured.hours > 0 &&
            ` · rate measured over ${measured.hours.toFixed(1)} h`}
          . After buying a step, log a fresh reading.
        </p>
      </SectionCard>

      <SectionCard title="Stock log">
        <StockLog
          key={activeProfile.id}
          log={mastery.log}
          prefill={{ ...basis.stock, chests: basis.chests }}
          onAdd={addMasteryLogEntry}
          onUpdate={updateMasteryLogEntry}
          onDelete={deleteMasteryLogEntry}
        />
      </SectionCard>

      {rows.length > 0 && (
        <SectionCard title="Remaining steps">
          <StepLadder rows={rows} basisAt={basis.at} />
        </SectionCard>
      )}

      <SectionCard title="Settings">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-400">
              Planning rate (per resource, per hour)
            </span>
            <CompactInput
              value={mastery.planningRate}
              onChange={updateMasteryPlanningRate}
              className="input-compact"
              ariaLabel="Planning rate per hour"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          The planning rate is a conservative fallback for when the log is too
          short. Choice chests are valued like leveled chests of the same tier
          at your level; Awakening Bundles as 5M of whichever resource you
          need; Supply Chests as ~300K split evenly (unconfirmed). Other chests
          come from{' '}
          <Link to={ROUTES.inventoryResources} className="link-inline">
            Resource Inventory
          </Link>
          .
        </p>
      </SectionCard>
    </div>
  );
}
