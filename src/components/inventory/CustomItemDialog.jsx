import { useState } from 'react';
import { OTHER_GROUPS } from '../../lib/data/other.js';

// Wrapper only mounts the form when open, so each open initializes useState
// from `initial` directly — no useEffect needed to keep the form fields in
// sync with props.
export default function CustomItemDialog({ open, initial, onCancel, onSave }) {
  if (!open) return null;
  return (
    <CustomItemDialogForm
      initial={initial}
      onCancel={onCancel}
      onSave={onSave}
    />
  );
}

function CustomItemDialogForm({ initial, onCancel, onSave }) {
  const [label, setLabel] = useState(initial?.label || '');
  const [group, setGroup] = useState(initial?.group || OTHER_GROUPS[0].key);

  const trimmed = label.trim();
  const isEdit = Boolean(initial?.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!trimmed) return;
    onSave({ label: trimmed, group });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg bg-slate-800 p-5 shadow-2xl ring-1 ring-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-100">
          {isEdit ? 'Edit custom item' : 'Add custom item'}
        </h2>

        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-300">Name</span>
            <input
              type="text"
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Item name"
              maxLength={80}
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-300">Group</span>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="select"
            >
              {OTHER_GROUPS.map((g) => (
                <option key={g.key} value={g.key}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={!trimmed} className="btn-primary">
            {isEdit ? 'Save' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
}
