import { CATEGORIES } from '../lib/data/speedups.js';
import {
  categoryTotalMinutes,
  categoryTotalWithUniversal,
} from '../lib/speedups.js';
import { formatDHM, formatDecimalHours } from '../lib/time.js';

export default function Totals({ inventory }) {
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-800/80 text-slate-300">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Category</th>
            <th className="px-3 py-2 text-right font-medium">Owned</th>
            <th className="px-3 py-2 text-right font-medium">+ Universal</th>
          </tr>
        </thead>
        <tbody className="panel-body">
          {CATEGORIES.map((c) => {
            const own = categoryTotalMinutes(inventory[c.key]);
            const withU = categoryTotalWithUniversal(inventory, c.key);
            return (
              <tr key={c.key} className="border-t border-slate-800">
                <td className="px-3 py-2 font-medium text-slate-200">
                  {c.label}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-100">
                  <div>{formatDHM(own)}</div>
                  <div className="text-xs text-slate-400">
                    {formatDecimalHours(own)}
                  </div>
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-100">
                  {c.key === 'universal' ? (
                    <span className="text-slate-500">—</span>
                  ) : (
                    <>
                      <div>{formatDHM(withU)}</div>
                      <div className="text-xs text-slate-400">
                        {formatDecimalHours(withU)}
                      </div>
                    </>
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
