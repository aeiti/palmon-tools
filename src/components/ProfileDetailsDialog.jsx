import { useState } from 'react';
import { formatProfileValue, formatServer } from '../lib/profile.js';

const FIELDS = [
  { key: 'ign', label: 'In-game name', placeholder: 'username', inputMode: 'text' },
  { key: 'server', label: 'Server', placeholder: '#111', inputMode: 'numeric' },
  { key: 'guild', label: 'Guild', placeholder: 'Void', inputMode: 'text' },
  { key: 'level', label: 'Player level', placeholder: '30', inputMode: 'numeric' },
  { key: 'power', label: 'Power', placeholder: '12,500,000', inputMode: 'numeric' },
];

function ProfileDetailsForm({ profile, onCancel, onSave }) {
  const [values, setValues] = useState(() => ({
    ign: profile.ign || '',
    server: formatServer(profile.server),
    guild: profile.guild || '',
    level: formatProfileValue(profile.level),
    power: formatProfileValue(profile.power),
  }));

  const handleChange = (key) => (e) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-lg bg-slate-800 p-5 shadow-xl ring-1 ring-slate-700"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-lg font-semibold text-slate-100">
        Edit profile details
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Saved locally to this browser.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {FIELDS.map(({ key, label, placeholder, inputMode }) => (
          <label key={key} className="flex flex-col gap-1 text-sm">
            <span className="text-slate-300">{label}</span>
            <input
              type="text"
              inputMode={inputMode}
              value={values[key] ?? ''}
              onChange={handleChange(key)}
              placeholder={placeholder}
              className="rounded bg-slate-700 px-2 py-1.5 text-sm text-slate-100 ring-1 ring-slate-600 focus:outline-none focus:ring-indigo-400"
            />
          </label>
        ))}
      </div>

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
          className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Save
        </button>
      </div>
    </form>
  );
}

export default function ProfileDetailsDialog({ open, profile, onCancel, onSave }) {
  if (!open || !profile) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
    >
      <ProfileDetailsForm
        key={profile.id}
        profile={profile}
        onCancel={onCancel}
        onSave={onSave}
      />
    </div>
  );
}
