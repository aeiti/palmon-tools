import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles.js';
import InventoryGrid from '../components/inventory/InventoryGrid.jsx';
import Totals from '../components/speedups/Totals.jsx';
import TargetChecker from '../components/speedups/TargetChecker.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { ROUTES } from '../routes.js';
import { profileLabel } from '../lib/profile.js';

export default function Speedups() {
  const {
    profiles,
    activeProfile,
    setActiveProfile,
    updateCount,
    resetActiveInventory,
  } = useProfiles();

  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="h-page">Speedup Inventory</h1>
          <p className="mt-1 text-subtle">
            {activeProfile.ign ? (
              <>
                Signed in as{' '}
                <span className="font-medium text-slate-200">
                  {activeProfile.ign}
                </span>
                . Saved locally to this browser.
              </>
            ) : (
              'Saved locally to this browser.'
            )}
          </p>
        </div>
        <Link to={ROUTES.inventory} className="btn-secondary">
          <span aria-hidden="true">←</span> Back
        </Link>
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
          <h2 className="h-section">Inventory</h2>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
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

      <section className="flex flex-col gap-2">
        <h2 className="h-section">Totals</h2>
        <Totals inventory={activeProfile.inventory} />
      </section>

      <TargetChecker inventory={activeProfile.inventory} />

      <ConfirmDialog
        open={confirmReset}
        title="Reset inventory?"
        message={`Set all counts for "${activeProfile.name}" back to 0.`}
        confirmLabel="Reset"
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetActiveInventory();
          setConfirmReset(false);
        }}
      />
    </div>
  );
}
