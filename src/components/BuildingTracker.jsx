import {
  BUILDINGS_BY_CATEGORY,
  MAX_BUILDING_LEVEL,
  duplicatePalmonKeys,
  groupBuildingsForDisplay,
  instanceLabel,
} from '../lib/buildings.js';

function BuildingRow({ building, index, instance, isDupe, palmons, onChange, label }) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2">
      <span className="min-w-[6.5rem] text-sm text-slate-300">{label}</span>
      <label className="flex items-center gap-1.5 text-xs text-slate-400">
        Level
        <input
          type="number"
          inputMode="numeric"
          min="0"
          max={MAX_BUILDING_LEVEL}
          value={instance.level || ''}
          placeholder="0"
          onChange={(e) => onChange(building.key, index, 'level', e.target.value)}
          onFocus={(e) => e.target.select()}
          className="w-16 rounded bg-slate-800 px-2 py-1 text-center tabular-nums text-sm text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-indigo-400"
        />
      </label>
      <label className="flex flex-1 items-center gap-1.5 text-xs text-slate-400">
        Palmon
        <select
          value={instance.palmon || ''}
          onChange={(e) => onChange(building.key, index, 'palmon', e.target.value)}
          className={`min-w-0 flex-1 rounded bg-slate-800 px-2 py-1 text-sm text-slate-100 ring-1 focus:outline-none focus:ring-indigo-400 ${
            isDupe ? 'ring-red-500/70' : 'ring-slate-700'
          }`}
        >
          <option value="">Unassigned</option>
          {palmons.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      {isDupe && (
        <span className="text-[11px] text-red-300">Assigned elsewhere</span>
      )}
    </div>
  );
}

function BuildingCard({ card, buildings, palmons, onChange, dupes }) {
  const totalCount = card.buildings.reduce((sum, b) => sum + b.count, 0);
  return (
    <div className="rounded-lg ring-1 ring-slate-700">
      <div className="flex items-center justify-between gap-2 bg-slate-800/80 px-3 py-2">
        <h3 className="text-sm font-semibold text-slate-100">
          {card.label}
          {card.showInstanceCount && totalCount > 1 && (
            <span className="ml-1 text-xs font-normal text-slate-400">
              ×{totalCount}
            </span>
          )}
        </h3>
        {card.seasonal && (
          <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-300 ring-1 ring-amber-500/30">
            Seasonal
          </span>
        )}
      </div>
      <div className="divide-y divide-slate-800 bg-slate-900/40">
        {card.buildings.flatMap((building) =>
          buildings[building.key].map((inst, i) => {
            const name = (inst.palmon || '').trim().toLowerCase();
            const isDupe = name && dupes.has(name);
            const label = card.showBuildingLabel
              ? building.label
              : instanceLabel(building, i);
            return (
              <BuildingRow
                key={`${building.key}:${i}`}
                building={building}
                index={i}
                instance={inst}
                isDupe={isDupe}
                palmons={palmons}
                onChange={onChange}
                label={label}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}

function BuildingList({ buildings: defs, profileBuildings, palmons, onChange, dupes }) {
  const cards = groupBuildingsForDisplay(defs);
  return (
    <div className="flex flex-col gap-3">
      {cards.map((card) => (
        <BuildingCard
          key={card.groupKey || card.buildings[0].key}
          card={card}
          buildings={profileBuildings}
          palmons={palmons}
          onChange={onChange}
          dupes={dupes}
        />
      ))}
    </div>
  );
}

export default function BuildingTracker({ buildings, palmons = [], onChange }) {
  const dupes = duplicatePalmonKeys(buildings);

  return (
    <div className="flex flex-col gap-6">
      {BUILDINGS_BY_CATEGORY.map((category) => (
        <section key={category.key} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            {category.label}
          </h2>
          {category.subcategories ? (
            <div className="flex flex-col gap-4">
              {category.subcategories.map((sub) => (
                <div key={sub.key} className="flex flex-col gap-2">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {sub.label}
                  </h3>
                  <BuildingList
                    buildings={sub.buildings}
                    profileBuildings={buildings}
                    palmons={palmons}
                    onChange={onChange}
                    dupes={dupes}
                  />
                </div>
              ))}
            </div>
          ) : (
            <BuildingList
              buildings={category.buildings}
              profileBuildings={buildings}
              palmons={palmons}
              onChange={onChange}
              dupes={dupes}
            />
          )}
        </section>
      ))}
    </div>
  );
}
