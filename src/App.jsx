import { useState } from 'react';
import { useProfiles } from './hooks/useProfiles.js';
import ProfileBar from './components/ProfileBar.jsx';
import InventoryGrid from './components/InventoryGrid.jsx';
import Totals from './components/Totals.jsx';
import TargetChecker from './components/TargetChecker.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';

export default function App() {
  const {
    profiles,
    activeProfile,
    setActiveProfile,
    createProfile,
    renameProfile,
    deleteProfile,
    updateCount,
    resetActiveInventory,
  } = useProfiles();

  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
        <header className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold text-slate-100 sm:text-2xl">
            Palmon Speedup Calculator
          </h1>
        </header>

        <ProfileBar
          profiles={profiles}
          activeProfile={activeProfile}
          onSelect={setActiveProfile}
          onCreate={createProfile}
          onRename={renameProfile}
          onDelete={deleteProfile}
        />

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-100">
              Inventory
            </h2>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="rounded bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 ring-1 ring-slate-700 hover:bg-red-700 hover:text-white"
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
          <h2 className="text-base font-semibold text-slate-100">Totals</h2>
          <Totals inventory={activeProfile.inventory} />
        </section>

        <TargetChecker inventory={activeProfile.inventory} />

        <footer className="mt-4 text-center text-xs text-slate-500">
          Saved locally to this browser.
        </footer>
      </div>

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
