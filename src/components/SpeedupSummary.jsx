import { CATEGORIES } from '../lib/data/speedups.js';
import {
  categoryTotalMinutes,
  categoryTotalWithUniversal,
} from '../lib/speedups.js';
import { formatDHM } from '../lib/time.js';

export default function SpeedupSummary({ inventory }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-400">
            <th className="py-1 pr-2 text-left font-medium">Category</th>
            <th className="px-2 py-1 text-right font-medium">Owned</th>
            <th className="px-2 py-1 text-right font-medium">+ Universal</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((c) => {
            const own = categoryTotalMinutes(inventory[c.key]);
            const withU = categoryTotalWithUniversal(inventory, c.key);
            return (
              <tr key={c.key} className="border-t border-slate-800">
                <td className="py-1.5 pr-2 font-medium text-slate-300">
                  {c.label}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-slate-100">
                  {formatDHM(own)}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-slate-100">
                  {c.key === 'universal' ? (
                    <span className="text-slate-500">—</span>
                  ) : (
                    formatDHM(withU)
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
