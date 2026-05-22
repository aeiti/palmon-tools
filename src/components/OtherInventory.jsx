import { OTHER_GROUPS, itemsByGroup } from '../lib/other.js';

export default function OtherInventory({ other, onChange }) {
  const groups = OTHER_GROUPS.map((g) => ({
    ...g,
    items: itemsByGroup(g.key),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-3 sm:block sm:columns-2 sm:gap-x-4">
      {groups.map((group) => (
        <section
          key={group.key}
          className="rounded-lg ring-1 ring-slate-700 sm:mb-4 sm:break-inside-avoid"
        >
          <h3 className="bg-slate-800/80 px-3 py-2 text-sm font-semibold text-slate-100">
            {group.label}
          </h3>
          <div className="flex flex-col bg-slate-900/40">
            {group.items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-2 border-t border-slate-800 px-3 py-1.5"
              >
                <label
                  htmlFor={`other-${item.key}`}
                  className="text-sm text-slate-200"
                >
                  {item.label}
                </label>
                <input
                  id={`other-${item.key}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={other[item.key] ?? 0}
                  onChange={(e) => onChange(item.key, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="h-7 w-20 rounded bg-slate-800 px-1.5 text-center tabular-nums text-sm leading-none text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-indigo-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
