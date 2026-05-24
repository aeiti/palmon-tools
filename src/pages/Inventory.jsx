import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles.js';
import ChestInventory from '../components/ChestInventory.jsx';
import InventoryGrid from '../components/InventoryGrid.jsx';
import OtherInventory from '../components/OtherInventory.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
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
    addCustomOther,
    updateCustomOther,
    removeCustomOther,
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

  const sections = [
    {
      key: 'other',
      title: 'Other Inventory',
      to: '/inventory/other',
      resetKey: 'other',
      editor: (
        <OtherInventory
          other={activeProfile.other}
          customItems={activeProfile.customOther}
          onChange={updateOtherCount}
          onAddCustom={addCustomOther}
          onUpdateCustom={updateCustomOther}
          onRemoveCustom={removeCustomOther}
        />
      ),
    },
    {
      key: 'resources',
      title: 'Resource Inventory',
      to: '/inventory/resources',
      resetKey: 'resources',
      editor: (
        <ChestInventory
          chests={activeProfile.chests}
          onChange={updateChestCount}
        />
      ),
    },
    {
      key: 'speedups',
      title: 'Speedup Inventory',
      to: '/inventory/speedups',
      resetKey: 'speedups',
      editor: (
        <InventoryGrid
          inventory={activeProfile.inventory}
          onChange={updateCount}
        />
      ),
    },
  ];

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

      {sections.map(({ key, title, to, resetKey, editor }) => (
        <section key={key} className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="h-section">{title}</h2>
            <div className="flex items-center gap-2">
              <Link to={to} className="btn-secondary text-xs">
                Edit
              </Link>
              <button
                type="button"
                onClick={() => setConfirmReset(resetKey)}
                className="btn-ghost"
              >
                Reset
              </button>
            </div>
          </div>
          {editor}
        </section>
      ))}

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
