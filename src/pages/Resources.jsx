import { useProfiles } from '../hooks/useProfiles.js';
import ResourceSnapshot from '../components/inventory/ResourceSnapshot.jsx';
import ResourceTotals from '../components/inventory/ResourceTotals.jsx';
import ProfilePicker from '../components/ui/ProfilePicker.jsx';
import SectionCard from '../components/ui/SectionCard.jsx';
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import { ROUTES } from '../routes.js';

export default function Resources() {
  const profiles = useProfiles();
  const { activeProfile } = profiles;
  const { log } = activeProfile.mastery;
  const lastLoggedAt =
    log.length > 0 ? Date.parse(log[log.length - 1].at) : null;

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
          leveledOverrides={activeProfile.leveledChestOverrides}
        />
      </SectionCard>

      <ResourceSnapshot
        profile={activeProfile}
        actions={profiles}
        lastLoggedAt={lastLoggedAt}
      />
    </div>
  );
}
