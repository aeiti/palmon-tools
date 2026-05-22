import { OTHER_GROUPS, itemsByGroup } from '../lib/other.js';

export default function OtherInventory({ other, onChange }) {
  return (
    <div className="flex flex-col gap-4">
      {OTHER_GROUPS.map((group) => {
        const items = itemsByGroup(group.key);
        if (items.length === 0) return null;
        return (
          <div
            key={group.key}
            className="overflow-x-auto rounded-lg ring-1 ring-slate-700"
          >
            <table className="w-full text-sm">
              <caption className="bg-slate-800/80 px-3 py-2 text-left text-sm font-semibold text-slate-100">
                {group.label}
              </caption>
              <thead className="bg-slate-800/60 text-slate-300">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Item</th>
                  <th className="px-2 py-2 text-center font-medium">Owned</th>
                </tr>
              </thead>
              <tbody className="bg-slate-900/40">
                {items.map((item) => (
                  <tr key={item.key} className="border-t border-slate-800">
                    <td className="px-3 py-2 font-medium text-slate-200">
                      {item.label}
                    </td>
                    <td className="px-1 py-1.5">
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={other[item.key] ?? 0}
                        onChange={(e) => onChange(item.key, e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className="w-full min-w-[4rem] rounded bg-slate-800 px-2 py-1 text-center tabular-nums text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-indigo-400"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
