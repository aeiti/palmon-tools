import { useState } from 'react';
import { OTHER_GROUPS } from '../lib/data/other.js';
import { itemsByGroup } from '../lib/other.js';
import CardColumns from './ui/CardColumns.jsx';
import ConfirmDialog from './ui/ConfirmDialog.jsx';
import CustomItemDialog from './CustomItemDialog.jsx';

function ItemRow({ item, count, onChange, onEdit, onDelete }) {
  return (
    <div className="group flex items-center justify-between gap-2 border-t border-slate-800 px-3 py-1.5">
      <label
        htmlFor={`other-${item.key}`}
        className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-sm text-slate-200"
      >
        {item.label}
      </label>
      {item.custom && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.label}`}
            className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="currentColor"
            >
              <path d="M11.293 1.293a1 1 0 0 1 1.414 0l2 2a1 1 0 0 1 0 1.414L5.414 13.5 1.5 14.5l1-3.914 8.793-9.293zM10.5 3.5 12.5 5.5"></path>
              <path d="M10.5 3.5 12.5 5.5" stroke="currentColor" strokeWidth="0.5" fill="none"></path>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            aria-label={`Delete ${item.label}`}
            className="rounded p-1 text-slate-500 transition-colors hover:bg-red-900/50 hover:text-red-300"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="currentColor"
            >
              <path d="M6 2h4l.5 1H13v1H3V3h2.5L6 2zM4 5h8l-.6 9.1a1 1 0 0 1-1 .9H5.6a1 1 0 0 1-1-.9L4 5z"></path>
            </svg>
          </button>
        </div>
      )}
      <input
        id={`other-${item.key}`}
        type="number"
        inputMode="numeric"
        min="0"
        value={count ?? 0}
        onChange={(e) => onChange(item.key, e.target.value)}
        onFocus={(e) => e.target.select()}
        className="h-7 w-20 rounded-md bg-slate-800 px-1.5 text-center tabular-nums text-sm leading-none text-slate-100 ring-1 ring-slate-700 transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );
}

export default function OtherInventory({
  other,
  customItems = [],
  onChange,
  onAddCustom,
  onUpdateCustom,
  onRemoveCustom,
}) {
  const [dialogState, setDialogState] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const cards = OTHER_GROUPS.map((group) => {
    const groupItems = itemsByGroup(group.key, customItems);
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
              onEdit={(it) =>
                setDialogState({ id: it.id, label: it.label, group: it.group })
              }
              onDelete={(it) => setPendingDelete(it)}
            />
          ))}
        </div>
      ),
    };
  }).filter((card) => card.weight > 0);

  const canManage = Boolean(onAddCustom);

  return (
    <div className="flex flex-col gap-3">
      {canManage && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setDialogState({})}
            className="btn-secondary text-xs"
          >
            + Add custom item
          </button>
        </div>
      )}
      <CardColumns items={cards} />

      {canManage && (
        <>
          <CustomItemDialog
            open={Boolean(dialogState)}
            initial={dialogState}
            onCancel={() => setDialogState(null)}
            onSave={(values) => {
              if (dialogState?.id) {
                onUpdateCustom(dialogState.id, values);
              } else {
                onAddCustom(values);
              }
              setDialogState(null);
            }}
          />
          <ConfirmDialog
            open={Boolean(pendingDelete)}
            title="Delete custom item?"
            message={
              pendingDelete
                ? `Remove "${pendingDelete.label}" and clear its count.`
                : ''
            }
            confirmLabel="Delete"
            danger
            onCancel={() => setPendingDelete(null)}
            onConfirm={() => {
              if (pendingDelete) onRemoveCustom(pendingDelete.id);
              setPendingDelete(null);
            }}
          />
        </>
      )}
    </div>
  );
}
