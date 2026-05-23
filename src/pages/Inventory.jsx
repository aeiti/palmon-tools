import { useState } from 'react';
import { useProfiles } from '../hooks/useProfiles.js';
import ChestInventory from '../components/ChestInventory.jsx';
import InventoryGrid from '../components/InventoryGrid.jsx';
import OtherInventory from '../components/OtherInventory.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { profileLabel } from '../lib/profile.js';

export default function Inventory() {
  const {
    profiles,
    activeProfile,
    setActiveProfile,
    updateCount,
    resetActiveInventory,
    updateChestCount,
    resetActiveChests,
    updateOtherCount,
    resetActiveOther,
  } = useProfiles();

  const [confirmReset, setConfirmReset] = useState(null);

  const resets = {
    other: {
      title: 'Reset other inventory?',
      message: `Set all other item counts for "${activeProfile.name}" back to 0.`,
      run: resetActiveOther,
    },
    resources: {
      title: 'Reset chests?',
      message: `Set all chest counts for "${activeProfile.name}" back to 0.`,
      run: resetActiveChests,
    },
    speedups: {
      title: 'Reset speedups?',
      message: `Set all speedup counts for "${activeProfile.name}" back to 0.`,
      run: resetActiveInventory,
    },
  };

  const current = confirmReset ? resets[confirmReset] : null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="h-page">Inventory</h1>
        <p className="mt-1 text-subtle">
          Track everything in your bag: miscellaneous items, resource chests,
          and speedups.
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

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="h-section">Other</h2>
          <button
            type="button"
            onClick={() => setConfirmReset('other')}
            className="btn-ghost"
          >
            Reset
          </button>
        </div>
        <OtherInventory
          other={activeProfile.other}
          onChange={updateOtherCount}
        />
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="h-section">Resources</h2>
          <button
            type="button"
            onClick={() => setConfirmReset('resources')}
            className="btn-ghost"
          >
            Reset
          </button>
        </div>
        <ChestInventory
          chests={activeProfile.chests}
          onChange={updateChestCount}
        />
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="h-section">Speedups</h2>
          <button
            type="button"
            onClick={() => setConfirmReset('speedups')}
            className="btn-ghost"
          >
            Reset
          </button>
        </div>
        <InventoryGrid
          inventory={activeProfile.inventory}
          onChange={updateCount}
        />
      </section>

      <ConfirmDialog
        open={Boolean(current)}
        title={current?.title || ''}
        message={current?.message || ''}
        confirmLabel="Reset"
        danger
        onCancel={() => setConfirmReset(null)}
        onConfirm={() => {
          current?.run();
          setConfirmReset(null);
        }}
      />
    </div>
  );
}
