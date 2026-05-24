import { Fragment } from 'react';
import {
  BUILDINGS_BY_CATEGORY,
  MAX_BUILDING_LEVEL,
  groupBuildingsForDisplay,
  instanceLabel,
} from '../lib/data/buildings.js';
import { duplicatePalmonKeys } from '../lib/buildings.js';

function BuildingCard({ card, profileBuildings, palmons, onChange, dupes }) {
  const totalCount = card.buildings.reduce((sum, b) => sum + b.count, 0);
  const rows = card.buildings.flatMap((building) =>
    profileBuildings[building.key].map((inst, i) => {
      const name = (inst.palmon || '').trim().toLowerCase();
      const isDupe = Boolean(name) && dupes.has(name);
      const labelText = card.showBuildingLabel
        ? building.label
        : String(i + 1);
      const fullName = instanceLabel(building, i);
      return {
        id: `${building.key}:${i}`,
        building,
        index: i,
        instance: inst,
        isDupe,
        labelText,
        fullName,
      };
    }),
  );

  const gridCols = 'grid-cols-[max-content_3rem_max-content]';

  return (
    <div className="panel">
      <div className="panel-header flex items-center justify-between gap-2 py-1.5">
        <h3 className="truncate">
          {card.label}
          {card.showInstanceCount && totalCount > 1 && (
            <span className="ml-1 text-xs font-normal text-slate-400">
              ×{totalCount}
            </span>
          )}
        </h3>
        {card.seasonal && (
          <span className="badge bg-amber-500/15 text-amber-300 ring-amber-500/30">
            Seasonal
          </span>
        )}
      </div>
      <div
        className={`panel-body grid items-center gap-x-2 gap-y-1 px-3 py-2 ${gridCols}`}
      >
        <span aria-hidden="true" />
        <span className="text-center text-[10px] font-medium uppercase tracking-wide text-slate-500">
          Lvl
        </span>
        <span aria-hidden="true" />
        {rows.map((r) => (
          <Fragment key={r.id}>
            <span
              className="text-sm tabular-nums text-slate-300"
              title={card.showBuildingLabel ? undefined : r.fullName}
            >
              {r.labelText}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_BUILDING_LEVEL}
              value={r.instance.level || ''}
              placeholder="0"
              onChange={(e) =>
                onChange(r.building.key, r.index, 'level', e.target.value)
              }
              onFocus={(e) => e.target.select()}
              aria-label={`${r.fullName} level`}
              className="h-7 w-full rounded-md bg-slate-800 px-1 text-center tabular-nums text-sm leading-none text-slate-100 ring-1 ring-slate-700 transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <select
              value={r.instance.palmon || ''}
              onChange={(e) =>
                onChange(r.building.key, r.index, 'palmon', e.target.value)
              }
              aria-label={`${r.fullName} palmon`}
              title={
                r.isDupe ? 'Already assigned to another building' : undefined
              }
              className={`h-7 rounded-md bg-slate-800 px-1.5 text-sm leading-none text-slate-100 ring-1 transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                r.isDupe ? 'ring-red-500/70' : 'ring-slate-700'
              }`}
            >
              <option value="">Unassigned</option>
              {palmons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function CardList({ defs, profileBuildings, palmons, onChange, dupes }) {
  const cards = groupBuildingsForDisplay(defs);
  return (
    <div className="flex flex-col gap-3">
      {cards.map((card) => (
        <BuildingCard
          key={card.groupKey || card.buildings[0].key}
          card={card}
          profileBuildings={profileBuildings}
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
    <div className="flex flex-col gap-6 sm:block sm:columns-2 sm:gap-x-6">
      {BUILDINGS_BY_CATEGORY.map((category) => (
        <section
          key={category.key}
          className="flex flex-col gap-3 sm:mb-6 sm:break-inside-avoid"
        >
          <h2 className="h-eyebrow">{category.label}</h2>
          {category.subcategories ? (
            <div className="flex flex-col gap-4">
              {category.subcategories.map((sub) => (
                <div key={sub.key} className="flex flex-col gap-2">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {sub.label}
                  </h3>
                  <CardList
                    defs={sub.buildings}
                    profileBuildings={buildings}
                    palmons={palmons}
                    onChange={onChange}
                    dupes={dupes}
                  />
                </div>
              ))}
            </div>
          ) : (
            <CardList
              defs={category.buildings}
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
