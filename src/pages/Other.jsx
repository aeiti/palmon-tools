import { useProfiles } from '../hooks/useProfiles.js';
import OtherInventory from '../components/inventory/OtherInventory.jsx';
import ProfilePicker from '../components/ui/ProfilePicker.jsx';
import ResetButton from '../components/ui/ResetButton.jsx';
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import { ROUTES } from '../routes.js';

export default function Other() {
  const {
    activeProfile,
    updateOtherCount,
    resetActiveOther,
    addCustomOther,
    updateCustomOther,
    removeCustomOther,
  } = useProfiles();

  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Other Inventory"
        subtitle="Track miscellaneous items like Skillfruit, Evolution Essence, Opus Pearls, and more."
        backTo={ROUTES.inventory}
      />

      <ProfilePicker />

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="h-section">Items</h2>
          <ResetButton
            onReset={resetActiveOther}
            confirmTitle="Reset other inventory?"
            confirmMessage={`Set all other item counts for "${activeProfile.name}" back to 0.`}
          />
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
    </div>
  );
}
