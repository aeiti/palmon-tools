import { useEffect, useState } from 'react';

const FIELDS = [
  { key: 'ign', label: 'In-game name', placeholder: 'e.g. AdamTheBrave' },
  { key: 'server', label: 'Server', placeholder: 'e.g. #111' },
  { key: 'guild', label: 'Guild', placeholder: 'e.g. Void' },
  { key: 'level', label: 'Player level', placeholder: 'e.g. 30' },
  { key: 'power', label: 'Power', placeholder: 'e.g. 12,500,000' },
];

export default function ProfileDetailsDialog({ open, profile, onCancel, onSave }) {
  const [values, setValues] = useState({});

  useEffect(() => {
    if (open && profile) {
      setValues({
        ign: profile.ign || '',
        server: profile.server || '',
        guild: profile.guild || '',
        level: profile.level || '',
        power: profile.power || '',
      });
    }
  }, [open, profile]);

  if (!open) return null;

  const handleChange = (key) => (e) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(values);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
    >
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
          {FIELDS.map(({ key, label, placeholder }) => (
            <label key={key} className="flex flex-col gap-1 text-sm">
              <span className="text-slate-300">{label}</span>
              <input
                type="text"
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
    </div>
  );
}
