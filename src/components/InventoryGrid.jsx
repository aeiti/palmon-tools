import { CATEGORIES, DENOMINATIONS } from '../lib/speedups.js';

export default function InventoryGrid({ inventory, onChange }) {
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-800/80 text-slate-300">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Category</th>
            {DENOMINATIONS.map((d) => (
              <th
                key={d.key}
                className="px-2 py-2 text-center font-medium tabular-nums"
              >
                {d.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="panel-body">
          {CATEGORIES.map((c) => (
            <tr key={c.key} className="border-t border-slate-800">
              <td className="px-3 py-2 font-medium text-slate-200">
                {c.label}
              </td>
              {DENOMINATIONS.map((d) => (
                <td key={d.key} className="px-1 py-1.5">
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={inventory[c.key][d.key]}
                    onChange={(e) => onChange(c.key, d.key, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="input-cell"
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
