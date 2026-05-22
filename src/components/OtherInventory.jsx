import { OTHER_GROUPS, itemsByGroup } from '../lib/other.js';
import CardColumns from './CardColumns.jsx';

function ItemRow({ item, count, onChange }) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-slate-800 px-3 py-1.5">
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
        value={count ?? 0}
        onChange={(e) => onChange(item.key, e.target.value)}
        onFocus={(e) => e.target.select()}
        className="h-7 w-20 rounded bg-slate-800 px-1.5 text-center tabular-nums text-sm leading-none text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-indigo-400"
      />
    </div>
  );
}

export default function OtherInventory({ other, onChange }) {
  const cards = OTHER_GROUPS.map((group) => {
    const groupItems = itemsByGroup(group.key);
    return {
      key: group.key,
      label: group.label,
      weight: groupItems.length,
      content: (
        <div className="flex flex-col">
          {groupItems.map((item) => (
            <ItemRow
              key={item.key}
              item={item}
              count={other[item.key]}
              onChange={onChange}
            />
          ))}
        </div>
      ),
    };
  }).filter((card) => card.weight > 0);

  return <CardColumns items={cards} />;
}
