import { useState } from 'react';
import { useProfiles } from '../hooks/useProfiles.js';
import BuildingTracker from '../components/BuildingTracker.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { profileLabel } from '../lib/profile.js';
import { MAX_BUILDING_LEVEL } from '../lib/data/buildings.js';
import { buildingsSummary, duplicatePalmonKeys } from '../lib/buildings.js';
import { palmonOptions } from '../lib/palmon.js';

export default function Buildings() {
  const {
    profiles,
    activeProfile,
    setActiveProfile,
    updateBuildingInstance,
    resetActiveBuildings,
  } = useProfiles();

  const [confirmReset, setConfirmReset] = useState(false);
  const summary = buildingsSummary(activeProfile.buildings);
  const dupeCount = duplicatePalmonKeys(activeProfile.buildings).size;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="h-page">Buildings</h1>
        <p className="mt-1 text-subtle">
          Track the level and assigned palmon for each building. Each palmon can
          only be assigned to one building. Max level is {MAX_BUILDING_LEVEL}.
        </p>
      </header>

      {profiles.length > 1 && (
        <div className="toolbar">
          <label className="text-sm text-slate-300">Profile</label>
          <select
            value={activeProfile.id}
            onChange={(e) => setActiveProfile(e.target.value)}
            className="select min-w-0 flex-1 sm:flex-none"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {profileLabel(p)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="toolbar justify-between text-sm text-slate-300">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>
            <span className="text-slate-400">Tracked:</span>{' '}
            <span className="tabular-nums text-slate-100">
              {summary.filled} / {summary.total}
            </span>
          </span>
          {dupeCount > 0 && (
            <span className="text-red-300">
              {dupeCount} duplicate palmon{dupeCount === 1 ? '' : 's'}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="btn-ghost"
        >
          Reset
        </button>
      </div>

      <BuildingTracker
        buildings={activeProfile.buildings}
        palmons={palmonOptions(activeProfile.palmons)}
        onChange={updateBuildingInstance}
      />

      <ConfirmDialog
        open={confirmReset}
        title="Reset buildings?"
        message={`Clear all building levels and palmon assignments for "${activeProfile.name}".`}
        confirmLabel="Reset"
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetActiveBuildings();
          setConfirmReset(false);
        }}
      />
    </div>
  );
}
