import { useProfiles } from '../hooks/useProfiles.js';
import BuildingTracker from '../components/buildings/BuildingTracker.jsx';
import ProfilePicker from '../components/ui/ProfilePicker.jsx';
import ResetButton from '../components/ui/ResetButton.jsx';
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import { MAX_BUILDING_LEVEL } from '../lib/data/buildings.js';
import { buildingsSummary, duplicatePalmonKeys } from '../lib/buildings.js';
import { palmonOptions } from '../lib/palmon.js';

export default function Buildings() {
  const { activeProfile, updateBuildingInstance, resetActiveBuildings } =
    useProfiles();

  const summary = buildingsSummary(activeProfile.buildings);
  const dupeCount = duplicatePalmonKeys(activeProfile.buildings).size;

  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Buildings"
        subtitle={`Track the level and assigned palmon for each building. Each palmon can only be assigned to one building. Max level is ${MAX_BUILDING_LEVEL}.`}
      />

      <ProfilePicker />

      <div className="toolbar justify-between text-sm text-slate-300">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>
            <span className="text-slate-400">Tracked:</span>{' '}
            <span className="tabular-nums text-slate-100">
              {summary.filled} / {summary.total}
            </span>
          </span>
          {dupeCount > 0 && (
            <span className="text-red-300">
              {dupeCount} duplicate palmon{dupeCount === 1 ? '' : 's'}
            </span>
          )}
        </div>
        <ResetButton
          onReset={resetActiveBuildings}
          confirmTitle="Reset buildings?"
          confirmMessage={`Clear all building levels and palmon assignments for "${activeProfile.name}".`}
        />
      </div>

      <BuildingTracker
        buildings={activeProfile.buildings}
        palmons={palmonOptions(activeProfile.palmons)}
        onChange={updateBuildingInstance}
      />
    </div>
  );
}
