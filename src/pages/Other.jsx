import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles.js';
import OtherInventory from '../components/inventory/OtherInventory.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { ROUTES } from '../routes.js';
import { profileLabel } from '../lib/profile.js';

export default function Other() {
  const {
    profiles,
    activeProfile,
    setActiveProfile,
    updateOtherCount,
    resetActiveOther,
    addCustomOther,
    updateCustomOther,
    removeCustomOther,
  } = useProfiles();

  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="h-page">Other Inventory</h1>
          <p className="mt-1 text-subtle">
            Track miscellaneous items like Skillfruit, Evolution Stones, Opus
            Pearls, and more.
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
          <h2 className="h-section">Items</h2>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="btn-ghost"
          >
            Reset
          </button>
        </div>
        <OtherInventory
          other={activeProfile.other}
          customItems={activeProfile.customOther}
          onChange={updateOtherCount}
          onAddCustom={addCustomOther}
          onUpdateCustom={updateCustomOther}
          onRemoveCustom={removeCustomOther}
        />
      </section>

      <ConfirmDialog
        open={confirmReset}
        title="Reset other inventory?"
        message={`Set all other item counts for "${activeProfile.name}" back to 0.`}
        confirmLabel="Reset"
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetActiveOther();
          setConfirmReset(false);
        }}
      />
    </div>
  );
}
