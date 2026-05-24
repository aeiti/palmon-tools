import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles.js';
import ProfileDetailsDialog from '../components/ProfileDetailsDialog.jsx';
import ProfileDeleteDialog from '../components/ProfileDeleteDialog.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { ROUTES } from '../routes.js';
import { buildExport, parseImport } from '../lib/storage.js';
import {
  formatProfileValue,
  formatServer,
  hasProfileDetails,
  profileLabel,
} from '../lib/profile.js';

const FIELDS = [
  { key: 'ign', label: 'In-game name', format: formatProfileValue },
  { key: 'server', label: 'Server', format: formatServer },
  { key: 'guild', label: 'Guild', format: formatProfileValue },
  { key: 'level', label: 'Player level', format: formatProfileValue },
  { key: 'power', label: 'Power', format: formatProfileValue },
];

function Row({ label, display }) {
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
        {empty ? 'Not set' : display}
      </dd>
    </div>
  );
}

export default function Profile() {
  const {
    profiles,
    activeProfile,
    setActiveProfile,
    createProfile,
    renameProfile,
    updateProfileDetails,
    deleteProfile,
    replaceAllProfiles,
  } = useProfiles();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState(null);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);
  const canDelete = profiles.length > 1;

  const handleExport = () => {
    const payload = buildExport({
      activeProfileId: activeProfile.id,
      profiles,
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `palmon-tools-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    setImportError('');
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const state = parseImport(text);
      setPendingImport(state);
    } catch (err) {
      setImportError(err.message || 'Could not read that file.');
    }
  };

  const confirmImport = () => {
    if (pendingImport) replaceAllProfiles(pendingImport);
    setPendingImport(null);
  };

  const pendingProfileCount = Array.isArray(pendingImport?.profiles)
    ? pendingImport.profiles.length
    : 0;

  const handleCreate = () => {
    const name = window.prompt('Profile name:', '');
    if (name && name.trim()) createProfile(name);
  };

  const handleRename = () => {
    const name = window.prompt('Rename profile:', activeProfile.name);
    if (name && name.trim()) renameProfile(activeProfile.id, name);
  };

  const hasDetails = hasProfileDetails(activeProfile);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h-page">Profile</h1>
          <p className="mt-1 text-subtle">
            Your in-game info, saved locally to this browser.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleCreate} className="btn-primary">
            New
          </button>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="btn-secondary"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleRename}
            className="btn-secondary"
          >
            Rename
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            disabled={!canDelete}
            title={
              canDelete
                ? undefined
                : 'Create another profile first before deleting this one.'
            }
            className="btn-secondary hover:bg-red-600 hover:text-white disabled:hover:bg-slate-700 disabled:hover:text-slate-100"
          >
            Delete
          </button>
        </div>
      </header>

      {profiles.length > 1 && (
        <div className="toolbar">
          <label className="text-sm text-slate-300">Viewing</label>
          <select
            value={activeProfile.id}
            onChange={(e) => setActiveProfile(e.target.value)}
            className="select min-w-0 flex-1 sm:flex-none"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {profileLabel(p)}
              </option>
            ))}
          </select>
        </div>
      )}

      <section className="card">
        <h2 className="h-section">{profileLabel(activeProfile)}</h2>
        <dl className="mt-3">
          {FIELDS.map(({ key, label, format }) => (
            <Row
              key={key}
              label={label}
              display={format(activeProfile[key])}
            />
          ))}
        </dl>
        {!hasDetails && (
          <p className="mt-4 text-xs text-slate-400">
            None of the fields are filled in yet — click{' '}
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="link-inline"
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
        <Link to={ROUTES.inventorySpeedups} className="link-inline">
          Speedups
        </Link>{' '}
        page.
      </p>

      <section className="card">
        <h2 className="h-section">Backup</h2>
        <p className="mt-2 text-sm text-slate-400">
          Save all of your profiles to a file, or restore from one you saved
          earlier. Importing replaces every profile in this browser.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={handleExport} className="btn-secondary">
            Export data
          </button>
          <button
            type="button"
            onClick={handleImportClick}
            className="btn-secondary"
          >
            Import data
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
        {importError && (
          <p className="mt-3 text-sm text-red-400">{importError}</p>
        )}
      </section>

      <ProfileDetailsDialog
        open={editOpen}
        profile={activeProfile}
        onCancel={() => setEditOpen(false)}
        onSave={(values) => {
          updateProfileDetails(activeProfile.id, values);
          setEditOpen(false);
        }}
      />

      <ProfileDeleteDialog
        open={deleteOpen}
        profile={activeProfile}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteProfile(activeProfile.id);
          setDeleteOpen(false);
        }}
      />

      <ConfirmDialog
        open={pendingImport !== null}
        title="Replace all profiles?"
        message={`This will replace your ${profiles.length} current profile${
          profiles.length === 1 ? '' : 's'
        } with ${pendingProfileCount} from the backup file. This can't be undone.`}
        confirmLabel="Replace"
        cancelLabel="Cancel"
        danger
        onCancel={() => setPendingImport(null)}
        onConfirm={confirmImport}
      />
    </div>
  );
}
