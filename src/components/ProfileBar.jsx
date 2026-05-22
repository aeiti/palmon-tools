import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog.jsx';

export default function ProfileBar({
  profiles,
  activeProfile,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCreate = () => {
    const name = window.prompt('Profile name:', '');
    if (name && name.trim()) onCreate(name);
  };

  const handleRename = () => {
    const name = window.prompt('Rename profile:', activeProfile.name);
    if (name && name.trim()) onRename(activeProfile.id, name);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-800/60 p-3 ring-1 ring-slate-700">
      <label className="text-sm text-slate-300">Profile</label>
      <select
        value={activeProfile.id}
        onChange={(e) => onSelect(e.target.value)}
        className="min-w-0 flex-1 rounded bg-slate-700 px-2 py-1.5 text-sm text-slate-100 ring-1 ring-slate-600 focus:outline-none focus:ring-indigo-400 sm:flex-none"
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleCreate}
        className="rounded bg-indigo-600 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
      >
        New
      </button>
      <button
        type="button"
        onClick={handleRename}
        className="rounded bg-slate-700 px-2.5 py-1.5 text-sm font-medium text-slate-100 hover:bg-slate-600"
      >
        Rename
      </button>
      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        disabled={profiles.length <= 1}
        className="rounded bg-slate-700 px-2.5 py-1.5 text-sm font-medium text-slate-100 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-slate-700"
      >
        Delete
      </button>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete profile?"
        message={`This will permanently remove "${activeProfile.name}" and its inventory.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          onDelete(activeProfile.id);
          setConfirmDelete(false);
        }}
      />
    </div>
  );
}
