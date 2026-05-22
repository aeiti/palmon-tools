import { CHEST_TIERS, CHEST_TYPES } from '../lib/chests.js';

export default function ChestInventory({ chests, onChange }) {
  return (
    <div className="overflow-x-auto rounded-lg ring-1 ring-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-800/80 text-slate-300">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Type</th>
            {CHEST_TIERS.map((t) => (
              <th
                key={t.key}
                className={`px-2 py-2 text-center font-medium ${t.accent}`}
              >
                {t.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-slate-900/40">
          {CHEST_TYPES.map((type) => (
            <tr key={type.key} className="border-t border-slate-800">
              <td className="px-3 py-2 font-medium text-slate-200">
                {type.label}
              </td>
              {CHEST_TIERS.map((tier) => (
                <td key={tier.key} className="px-1 py-1.5">
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={chests[type.key][tier.key]}
                    onChange={(e) =>
                      onChange(type.key, tier.key, e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    className="w-full min-w-[3.5rem] rounded bg-slate-800 px-2 py-1 text-center tabular-nums text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-indigo-400"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
