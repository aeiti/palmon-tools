import { useProfiles } from '../hooks/useProfiles.js';
import ChestInventory from '../components/inventory/ChestInventory.jsx';
import ResourceTotals from '../components/inventory/ResourceTotals.jsx';
import ProfilePicker from '../components/ui/ProfilePicker.jsx';
import ResetButton from '../components/ui/ResetButton.jsx';
import SectionCard from '../components/ui/SectionCard.jsx';
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import { ROUTES } from '../routes.js';

export default function Resources() {
  const { activeProfile, updateChestCount, resetActiveChests } = useProfiles();

  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Resource Inventory"
        subtitle="Track unopened chests. Leveled chests scale with your player level."
        backTo={ROUTES.inventory}
      />

      <ProfilePicker />

      <SectionCard title="Resource Totals">
        <ResourceTotals
          chests={activeProfile.chests}
          playerLevel={activeProfile.level}
        />
      </SectionCard>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="h-section">Chests</h2>
          <ResetButton
            onReset={resetActiveChests}
            confirmTitle="Reset chests?"
            confirmMessage={`Set all chest counts for "${activeProfile.name}" back to 0.`}
          />
        </div>
        <ChestInventory
          chests={activeProfile.chests}
          onChange={updateChestCount}
        />
      </section>
    </div>
  );
}
