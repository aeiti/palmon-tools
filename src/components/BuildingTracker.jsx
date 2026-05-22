import {
  BUILDINGS,
  MAX_BUILDING_LEVEL,
  duplicatePalmonKeys,
  instanceLabel,
} from '../lib/buildings.js';

export default function BuildingTracker({ buildings, onChange }) {
  const dupes = duplicatePalmonKeys(buildings);

  return (
    <div className="flex flex-col gap-3">
      {BUILDINGS.map((building) => (
        <div
          key={building.key}
          className="rounded-lg ring-1 ring-slate-700"
        >
          <div className="flex items-center justify-between gap-2 bg-slate-800/80 px-3 py-2">
            <h3 className="text-sm font-semibold text-slate-100">
              {building.label}
              {building.count > 1 && (
                <span className="ml-1 text-xs font-normal text-slate-400">
                  ×{building.count}
                </span>
              )}
            </h3>
            {building.seasonal && (
              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-300 ring-1 ring-amber-500/30">
                Seasonal
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-800 bg-slate-900/40">
            {buildings[building.key].map((inst, i) => {
              const name = (inst.palmon || '').trim().toLowerCase();
              const isDupe = name && dupes.has(name);
              return (
                <div
                  key={i}
                  className="flex flex-wrap items-center gap-2 px-3 py-2"
                >
                  <span className="min-w-[6.5rem] text-sm text-slate-300">
                    {instanceLabel(building, i)}
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-slate-400">
                    Level
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max={MAX_BUILDING_LEVEL}
                      value={inst.level || ''}
                      placeholder="0"
                      onChange={(e) =>
                        onChange(building.key, i, 'level', e.target.value)
                      }
                      onFocus={(e) => e.target.select()}
                      className="w-16 rounded bg-slate-800 px-2 py-1 text-center tabular-nums text-sm text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-indigo-400"
                    />
                  </label>
                  <label className="flex flex-1 items-center gap-1.5 text-xs text-slate-400">
                    Palmon
                    <input
                      type="text"
                      value={inst.palmon || ''}
                      placeholder="Unassigned"
                      onChange={(e) =>
                        onChange(building.key, i, 'palmon', e.target.value)
                      }
                      className={`min-w-0 flex-1 rounded bg-slate-800 px-2 py-1 text-sm text-slate-100 ring-1 focus:outline-none focus:ring-indigo-400 ${
                        isDupe
                          ? 'ring-red-500/70'
                          : 'ring-slate-700'
                      }`}
                    />
                  </label>
                  {isDupe && (
                    <span className="text-[11px] text-red-300">
                      Assigned elsewhere
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
