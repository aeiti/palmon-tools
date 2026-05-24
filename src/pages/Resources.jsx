import { useProfiles } from '../hooks/useProfiles.js';
import ChestInventory from '../components/inventory/ChestInventory.jsx';
import OnHandResources from '../components/inventory/OnHandResources.jsx';
import ResourceTotals from '../components/inventory/ResourceTotals.jsx';
import ProfilePicker from '../components/ui/ProfilePicker.jsx';
import ResetButton from '../components/ui/ResetButton.jsx';
import SectionCard from '../components/ui/SectionCard.jsx';
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import { ROUTES } from '../routes.js';

export default function Resources() {
  const {
    activeProfile,
    updateChestCount,
    resetActiveChests,
    updateOnHand,
    resetActiveOnHand,
  } = useProfiles();

  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Resource Inventory"
        subtitle="Track your on-hand resources plus unopened chests. Leveled chests scale with your player level."
        backTo={ROUTES.inventory}
      />

      <ProfilePicker />

      <SectionCard title="Resource Totals">
        <ResourceTotals
          chests={activeProfile.chests}
          playerLevel={activeProfile.level}
          onHand={activeProfile.onHand}
        />
      </SectionCard>

      <SectionCard
        title="On-hand"
        actions={
          <ResetButton
            onReset={resetActiveOnHand}
            confirmTitle="Reset on-hand resources?"
            confirmMessage={`Set on-hand XP, Electricity, Gold, Lumber, and Steel for "${activeProfile.name}" back to 0.`}
          />
        }
      >
        <OnHandResources
          onHand={activeProfile.onHand}
          onChange={updateOnHand}
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
