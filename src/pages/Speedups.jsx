import { useProfiles } from '../hooks/useProfiles.js';
import InventoryGrid from '../components/inventory/InventoryGrid.jsx';
import Totals from '../components/speedups/Totals.jsx';
import TargetChecker from '../components/speedups/TargetChecker.jsx';
import ProfilePicker from '../components/ui/ProfilePicker.jsx';
import ResetButton from '../components/ui/ResetButton.jsx';
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import { ROUTES } from '../routes.js';

export default function Speedups() {
  const { activeProfile, updateCount, resetActiveInventory } = useProfiles();

  const subtitle = activeProfile.ign ? (
    <>
      Signed in as{' '}
      <span className="font-medium text-slate-200">{activeProfile.ign}</span>.
      Saved locally to this browser.
    </>
  ) : (
    'Saved locally to this browser.'
  );

  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Speedup Inventory"
        subtitle={subtitle}
        backTo={ROUTES.inventory}
      />

      <ProfilePicker />

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="h-section">Inventory</h2>
          <ResetButton
            onReset={resetActiveInventory}
            confirmTitle="Reset inventory?"
            confirmMessage={`Set all counts for "${activeProfile.name}" back to 0.`}
          />
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
    </div>
  );
}
