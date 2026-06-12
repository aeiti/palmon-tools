import { Link } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles.js';
import ChestInventory from '../components/inventory/ChestInventory.jsx';
import EquipmentInventory from '../components/inventory/EquipmentInventory.jsx';
import InventoryGrid from '../components/inventory/InventoryGrid.jsx';
import OtherInventory from '../components/inventory/OtherInventory.jsx';
import ProfilePicker from '../components/ui/ProfilePicker.jsx';
import ResetButton from '../components/ui/ResetButton.jsx';
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import { ROUTES } from '../routes.js';

export default function Inventory() {
  const {
    activeProfile,
    updateCount,
    resetActiveInventory,
    updateChestCount,
    resetActiveChests,
    updateOtherCount,
    resetActiveOther,
    addCustomOther,
    updateCustomOther,
    removeCustomOther,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    resetActiveEquipment,
  } = useProfiles();

  const sections = [
    {
      key: 'equipment',
      title: 'Equipment Inventory',
      to: ROUTES.inventoryEquipment,
      reset: {
        run: resetActiveEquipment,
        title: 'Reset equipment?',
        message: `Delete every equipment instance for "${activeProfile.name}" and clear all assignments.`,
      },
      editor: (
        <EquipmentInventory
          equipment={activeProfile.equipment || []}
          palmons={activeProfile.palmons}
          onAdd={addEquipment}
          onUpdate={updateEquipment}
          onDelete={deleteEquipment}
        />
      ),
    },
    {
      key: 'other',
      title: 'Other Inventory',
      to: ROUTES.inventoryOther,
      reset: {
        run: resetActiveOther,
        title: 'Reset other inventory?',
        message: `Set all other item counts for "${activeProfile.name}" back to 0.`,
      },
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
      to: ROUTES.inventoryResources,
      reset: {
        run: resetActiveChests,
        title: 'Reset chests?',
        message: `Set all chest counts for "${activeProfile.name}" back to 0.`,
      },
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
      to: ROUTES.inventorySpeedups,
      reset: {
        run: resetActiveInventory,
        title: 'Reset speedups?',
        message: `Set all speedup counts for "${activeProfile.name}" back to 0.`,
      },
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
      <ToolPageHeader
        title="Inventory"
        subtitle="Track everything in your bag: miscellaneous items, resource chests, and speedups."
      />

      <ProfilePicker />

      {sections.map(({ key, title, to, reset, editor }) => (
        <section key={key} className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="h-section">{title}</h2>
            <div className="flex items-center gap-2">
              <Link to={to} className="btn-secondary text-xs">
                Edit
              </Link>
              <ResetButton
                onReset={reset.run}
                confirmTitle={reset.title}
                confirmMessage={reset.message}
              />
            </div>
          </div>
          {editor}
        </section>
      ))}
    </div>
  );
}
