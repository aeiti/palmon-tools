import { useState } from 'react';

function ProfileDeleteForm({ profile, onCancel, onConfirm }) {
  const [typed, setTyped] = useState('');
  const expected = profile.name;
  const matches = typed.trim() === expected;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (matches) onConfirm();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-lg bg-slate-800 p-5 shadow-xl ring-1 ring-slate-700"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-lg font-semibold text-slate-100">Delete profile?</h2>
      <p className="mt-2 text-sm text-slate-300">
        This will permanently remove{' '}
        <span className="font-semibold text-slate-100">{expected}</span> and
        its speedup inventory. This cannot be undone.
      </p>
      <label className="mt-4 flex flex-col gap-1 text-sm">
        <span className="text-slate-300">
          Type <span className="font-mono text-slate-100">{expected}</span> to
          confirm
        </span>
        <input
          type="text"
          autoFocus
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={expected}
          className="rounded bg-slate-700 px-2 py-1.5 text-sm text-slate-100 ring-1 ring-slate-600 focus:outline-none focus:ring-red-400"
        />
      </label>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-100 hover:bg-slate-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!matches}
          className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-red-600"
        >
          Delete profile
        </button>
      </div>
    </form>
  );
}

export default function ProfileDeleteDialog({ open, profile, onCancel, onConfirm }) {
  if (!open || !profile) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
    >
      <ProfileDeleteForm
        key={profile.id}
        profile={profile}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </div>
  );
}
