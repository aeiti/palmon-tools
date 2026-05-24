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
      className="w-full max-w-sm rounded-lg bg-slate-800 p-5 shadow-2xl ring-1 ring-slate-700"
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
          className="input focus:ring-red-400"
        />
      </label>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={!matches} className="btn-danger">
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
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
