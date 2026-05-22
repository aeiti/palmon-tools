import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles.js';
import ProfileDetailsDialog from '../components/ProfileDetailsDialog.jsx';
import {
  formatProfileValue,
  formatServer,
  hasProfileDetails,
  profileLabel,
} from '../lib/profile.js';

const FIELDS = [
  {
    key: 'ign',
    label: 'In-game name',
    format: formatProfileValue,
    emptyText: 'username',
  },
  { key: 'server', label: 'Server', format: formatServer, emptyText: 'Not set' },
  { key: 'guild', label: 'Guild', format: formatProfileValue, emptyText: 'Not set' },
  { key: 'level', label: 'Player level', format: formatProfileValue, emptyText: 'Not set' },
  { key: 'power', label: 'Power', format: formatProfileValue, emptyText: 'Not set' },
];

function Row({ label, display, emptyText }) {
  const empty = display === '';
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-slate-800 py-2 last:border-b-0">
      <dt className="text-sm text-slate-400">{label}</dt>
      <dd
        className={
          empty
            ? 'text-sm italic text-slate-500'
            : 'text-sm font-medium text-slate-100'
        }
      >
        {empty ? emptyText : display}
      </dd>
    </div>
  );
}

export default function Profile() {
  const {
    profiles,
    activeProfile,
    setActiveProfile,
    updateProfileDetails,
  } = useProfiles();
  const [editOpen, setEditOpen] = useState(false);

  const hasDetails = hasProfileDetails(activeProfile);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 sm:text-2xl">
            Profile
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Your in-game info, saved locally to this browser.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Edit
        </button>
      </header>

      {profiles.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-800/60 p-3 ring-1 ring-slate-700">
          <label className="text-sm text-slate-300">Viewing</label>
          <select
            value={activeProfile.id}
            onChange={(e) => setActiveProfile(e.target.value)}
            className="min-w-0 flex-1 rounded bg-slate-700 px-2 py-1.5 text-sm text-slate-100 ring-1 ring-slate-600 focus:outline-none focus:ring-indigo-400 sm:flex-none"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {profileLabel(p)}
              </option>
            ))}
          </select>
        </div>
      )}

      <section className="rounded-lg bg-slate-800/60 p-4 ring-1 ring-slate-700">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          {profileLabel(activeProfile)}
        </h2>
        <dl className="mt-3">
          {FIELDS.map(({ key, label, format, emptyText }) => (
            <Row
              key={key}
              label={label}
              display={format(activeProfile[key])}
              emptyText={emptyText}
            />
          ))}
        </dl>
        {!hasDetails && (
          <p className="mt-4 text-xs text-slate-400">
            None of the fields are filled in yet — click{' '}
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="text-indigo-300 underline hover:text-indigo-200"
            >
              Edit
            </button>{' '}
            to add your in-game info.
          </p>
        )}
      </section>

      <p className="text-xs text-slate-500">
        Profiles also let you keep separate speedup inventories — manage them on
        the{' '}
        <Link to="/speedups" className="text-indigo-300 underline hover:text-indigo-200">
          Speedups
        </Link>{' '}
        page.
      </p>

      <ProfileDetailsDialog
        open={editOpen}
        profile={activeProfile}
        onCancel={() => setEditOpen(false)}
        onSave={(values) => {
          updateProfileDetails(activeProfile.id, values);
          setEditOpen(false);
        }}
      />
    </div>
  );
}
