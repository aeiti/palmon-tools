import { Fragment } from 'react';
import {
  BUILDINGS_BY_CATEGORY,
  MAX_BUILDING_LEVEL,
  duplicatePalmonKeys,
  groupBuildingsForDisplay,
  instanceLabel,
} from '../lib/buildings.js';

function BuildingCard({ card, profileBuildings, palmons, onChange, dupes }) {
  const totalCount = card.buildings.reduce((sum, b) => sum + b.count, 0);
  const rows = card.buildings.flatMap((building) =>
    profileBuildings[building.key].map((inst, i) => {
      const name = (inst.palmon || '').trim().toLowerCase();
      const isDupe = Boolean(name) && dupes.has(name);
      const labelText = card.showBuildingLabel
        ? building.label
        : instanceLabel(building, i);
      return {
        id: `${building.key}:${i}`,
        building,
        index: i,
        instance: inst,
        isDupe,
        labelText,
      };
    }),
  );

  const gridCols = 'grid-cols-[minmax(0,1fr)_3rem_max-content]';

  return (
    <div className="rounded-lg ring-1 ring-slate-700">
      <div className="flex items-center justify-between gap-2 bg-slate-800/80 px-3 py-1.5">
        <h3 className="truncate text-sm font-semibold text-slate-100">
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
      <div
        className={`grid items-center gap-x-2 gap-y-1 bg-slate-900/40 px-3 py-2 ${gridCols}`}
      >
        <span aria-hidden="true" />
        <span className="text-center text-[10px] font-medium uppercase tracking-wide text-slate-500">
          Lvl
        </span>
        <span aria-hidden="true" />
        {rows.map((r) => (
          <Fragment key={r.id}>
            <span className="truncate text-sm text-slate-300">
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
              aria-label={`${r.labelText} level`}
              className="h-7 w-full rounded bg-slate-800 px-1 text-center tabular-nums text-sm leading-none text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-indigo-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <select
              value={r.instance.palmon || ''}
              onChange={(e) =>
                onChange(r.building.key, r.index, 'palmon', e.target.value)
              }
              aria-label={`${r.labelText} palmon`}
              title={
                r.isDupe ? 'Already assigned to another building' : undefined
              }
              className={`h-7 rounded bg-slate-800 px-1.5 text-sm leading-none text-slate-100 ring-1 focus:outline-none focus:ring-indigo-400 ${
                r.isDupe ? 'ring-red-500/70' : 'ring-slate-700'
              }`}
            >
              <option value="">Unassigned</option>
              {palmons.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function CardGrid({ defs, profileBuildings, palmons, onChange, dupes }) {
  const cards = groupBuildingsForDisplay(defs);
  return (
    <div className="grid items-start gap-3 sm:grid-cols-2">
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
                  <CardGrid
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
            <CardGrid
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
