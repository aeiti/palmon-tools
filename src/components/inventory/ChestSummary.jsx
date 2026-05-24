import { useState } from 'react';
import {
  CHEST_RESOURCES,
  CHEST_TIERS,
  CHEST_TYPES,
} from '../../lib/data/chests.js';
import { resourceTierTotal, tierTypeTotal } from '../../lib/chests.js';
import { formatCompact, formatCompactFull } from '../../lib/format.js';

const VIEWS = [
  { key: 'by-resource', label: 'By resource' },
  { key: 'total', label: 'Total' },
];

function toggleClass(active) {
  return [
    'rounded px-2 py-0.5 text-xs font-medium transition-colors',
    active
      ? 'bg-indigo-600 text-white'
      : 'text-slate-300 hover:bg-slate-700 hover:text-white',
  ].join(' ');
}

function TotalView({ chests }) {
  return (
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
            {CHEST_TIERS.map((tier) => {
              const supported = type.tiers.includes(tier.key);
              const count = supported
                ? tierTypeTotal(chests, type.key, tier.key)
                : 0;
              return (
                <td
                  key={tier.key}
                  className="px-2 py-1.5 text-center tabular-nums text-slate-100"
                  title={supported ? formatCompactFull(count) : undefined}
                >
                  {supported ? (
                    formatCompact(count)
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ByResourceView({ chests }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-slate-400">
          <th className="py-1 pr-2 text-left font-medium"></th>
          {CHEST_RESOURCES.map((r) => (
            <th
              key={r.key}
              className={`px-2 py-1 text-center font-medium ${r.accent}`}
            >
              {r.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {CHEST_TIERS.map((tier) => (
          <tr key={tier.key} className="border-t border-slate-800">
            <td className={`py-1.5 pr-2 font-medium ${tier.accent}`}>
              {tier.label}
            </td>
            {CHEST_RESOURCES.map((resource) => {
              const count = resourceTierTotal(chests, tier.key, resource.key);
              return (
                <td
                  key={resource.key}
                  className="px-2 py-1.5 text-center tabular-nums text-slate-100"
                  title={formatCompactFull(count)}
                >
                  {formatCompact(count)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ChestSummary({ chests }) {
  const [view, setView] = useState('by-resource');

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1 self-end rounded bg-slate-900/60 p-0.5 ring-1 ring-slate-700">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setView(v.key)}
            className={toggleClass(view === v.key)}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        {view === 'total' ? (
          <TotalView chests={chests} />
        ) : (
          <ByResourceView chests={chests} />
        )}
      </div>
    </div>
  );
}
