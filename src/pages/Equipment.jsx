import { useProfiles } from '../hooks/useProfiles.js';
import EquipmentInventory from '../components/inventory/EquipmentInventory.jsx';
import ProfilePicker from '../components/ui/ProfilePicker.jsx';
import ResetButton from '../components/ui/ResetButton.jsx';
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import { ROUTES } from '../routes.js';

export default function Equipment() {
  const {
    activeProfile,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    resetActiveEquipment,
  } = useProfiles();

  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Equipment Inventory"
        subtitle="Track each piece of equipment: ascend and enhance levels plus assignment to a Palmon."
        backTo={ROUTES.inventory}
      />

      <ProfilePicker />

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="h-section">Items</h2>
          <ResetButton
            onReset={resetActiveEquipment}
            disabled={(activeProfile.equipment || []).length === 0}
            confirmTitle="Reset equipment?"
            confirmMessage={`Delete every equipment instance for "${activeProfile.name}" and clear all assignments.`}
          />
        </div>
        <EquipmentInventory
          equipment={activeProfile.equipment || []}
          palmons={activeProfile.palmons}
          onAdd={addEquipment}
          onUpdate={updateEquipment}
          onDelete={deleteEquipment}
        />
      </section>
    </div>
  );
}
