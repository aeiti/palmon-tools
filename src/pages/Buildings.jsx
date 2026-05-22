import { useState } from 'react';
import { useProfiles } from '../hooks/useProfiles.js';
import BuildingTracker from '../components/BuildingTracker.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { profileLabel } from '../lib/profile.js';
import {
  MAX_BUILDING_LEVEL,
  buildingsSummary,
  duplicatePalmonKeys,
} from '../lib/buildings.js';

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
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-100 sm:text-2xl">
          Buildings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Track the level and assigned palmon for each building. Each palmon can
          only be assigned to one building. Max level is {MAX_BUILDING_LEVEL}.
        </p>
      </header>

      {profiles.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-800/60 p-3 ring-1 ring-slate-700">
          <label className="text-sm text-slate-300">Profile</label>
          <select
            value={activeProfile.id}
            onChange={(e) => setActiveProfile(e.target.value)}
            className="min-w-0 flex-1 rounded bg-slate-700 px-2 py-1.5 text-sm text-slate-100 ring-1 ring-slate-600 focus:outline-none focus:ring-indigo-400 sm:flex-none"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {profileLabel(p)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-800/60 p-3 text-sm text-slate-300 ring-1 ring-slate-700">
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
          className="rounded bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 ring-1 ring-slate-700 hover:bg-red-700 hover:text-white"
        >
          Reset
        </button>
      </div>

      <BuildingTracker
        buildings={activeProfile.buildings}
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
