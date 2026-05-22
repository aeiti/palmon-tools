import {
  CHEST_RESOURCES,
  CHEST_TIERS,
  CHEST_TYPES,
} from '../lib/chests.js';

export default function ChestInventory({ chests, onChange }) {
  return (
    <div className="flex flex-col gap-4">
      {CHEST_TYPES.map((type) => (
        <div
          key={type.key}
          className="overflow-x-auto rounded-lg ring-1 ring-slate-700"
        >
          <table className="w-full text-sm">
            <caption className="bg-slate-800/80 px-3 py-2 text-left text-sm font-semibold text-slate-100">
              {type.label}
            </caption>
            <thead className="bg-slate-800/60 text-slate-300">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Tier</th>
                {CHEST_RESOURCES.map((r) => (
                  <th
                    key={r.key}
                    className={`px-2 py-2 text-center font-medium ${r.accent}`}
                  >
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-slate-900/40">
              {CHEST_TIERS.map((tier) => (
                <tr key={tier.key} className="border-t border-slate-800">
                  <td
                    className={`px-3 py-2 font-medium ${tier.accent}`}
                  >
                    {tier.label}
                  </td>
                  {CHEST_RESOURCES.map((resource) => (
                    <td key={resource.key} className="px-1 py-1.5">
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={chests[type.key][tier.key][resource.key]}
                        onChange={(e) =>
                          onChange(
                            type.key,
                            tier.key,
                            resource.key,
                            e.target.value,
                          )
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
      ))}
    </div>
  );
}
