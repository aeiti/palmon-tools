import { OTHER_GROUPS } from '../../lib/data/other.js';
import { itemsByGroup } from '../../lib/other.js';

const NUMBER_FORMATTER = new Intl.NumberFormat('en-US');

export default function OtherSummary({ other, customItems = [] }) {
  const groupsWithItems = OTHER_GROUPS.map((group) => {
    const items = itemsByGroup(group.key, customItems).filter(
      (item) => (Number(other?.[item.key]) || 0) > 0,
    );
    return { ...group, items };
  }).filter((g) => g.items.length > 0);

  if (groupsWithItems.length === 0) {
    return <p className="text-sm text-slate-400">No items tracked yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {groupsWithItems.map((group) => (
        <div key={group.key}>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {group.label}
          </div>
          <dl className="mt-1 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
            {group.items.map((item) => (
              <div
                key={item.key}
                className="flex items-baseline justify-between gap-2 border-b border-slate-800/60 py-0.5 text-sm"
              >
                <dt className="text-slate-300">{item.label}</dt>
                <dd className="tabular-nums text-slate-100">
                  {NUMBER_FORMATTER.format(other[item.key])}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
