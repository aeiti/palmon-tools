import { CHEST_TIERS, CHEST_TYPES, tierTypeTotal } from '../lib/chests.js';

export default function ChestSummary({ chests }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-400">
            <th className="py-1 pr-2 text-left font-medium"></th>
            {CHEST_TIERS.map((t) => (
              <th
                key={t.key}
                className={`px-2 py-1 text-center font-medium ${t.accent}`}
              >
                {t.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CHEST_TYPES.map((type) => (
            <tr key={type.key} className="border-t border-slate-800">
              <td className="py-1.5 pr-2 font-medium text-slate-300">
                {type.label}
              </td>
              {CHEST_TIERS.map((tier) => (
                <td
                  key={tier.key}
                  className="px-2 py-1.5 text-center tabular-nums text-slate-100"
                >
                  {tierTypeTotal(chests, type.key, tier.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
