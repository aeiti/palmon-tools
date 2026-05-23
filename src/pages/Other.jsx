import { useState } from 'react';
import { useProfiles } from '../hooks/useProfiles.js';
import OtherInventory from '../components/OtherInventory.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { profileLabel } from '../lib/profile.js';

export default function Other() {
  const {
    profiles,
    activeProfile,
    setActiveProfile,
    updateOtherCount,
    resetActiveOther,
  } = useProfiles();

  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="h-page">Other Inventory</h1>
        <p className="mt-1 text-subtle">
          Track miscellaneous items like Skillfruit, Evolution Stones, Opus
          Pearls, and more.
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
          onChange={updateOtherCount}
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
