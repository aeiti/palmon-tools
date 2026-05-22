import { useState } from 'react';
import { useProfiles } from '../hooks/useProfiles.js';
import ChestInventory from '../components/ChestInventory.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { profileLabel } from '../lib/profile.js';

export default function Resources() {
  const {
    profiles,
    activeProfile,
    setActiveProfile,
    updateChestCount,
    resetActiveChests,
  } = useProfiles();

  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-100 sm:text-2xl">
          Resource Inventory
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Track unopened chests. Leveled chests scale with your player level.
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

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-100">Chests</h2>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="rounded bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 ring-1 ring-slate-700 hover:bg-red-700 hover:text-white"
          >
            Reset
          </button>
        </div>
        <ChestInventory
          chests={activeProfile.chests}
          onChange={updateChestCount}
        />
      </section>

      <ConfirmDialog
        open={confirmReset}
        title="Reset chests?"
        message={`Set all chest counts for "${activeProfile.name}" back to 0.`}
        confirmLabel="Reset"
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetActiveChests();
          setConfirmReset(false);
        }}
      />
    </div>
  );
}
