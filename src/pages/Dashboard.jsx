import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles.js';
import ProfileDetailsDialog from '../components/profile/ProfileDetailsDialog.jsx';
import ProfileDeleteDialog from '../components/profile/ProfileDeleteDialog.jsx';
import ChestSummary from '../components/inventory/ChestSummary.jsx';
import OnHandResources from '../components/inventory/OnHandResources.jsx';
import ResourceTotals from '../components/inventory/ResourceTotals.jsx';
import SpeedupSummary from '../components/speedups/SpeedupSummary.jsx';
import OtherSummary from '../components/inventory/OtherSummary.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import ProfilePicker from '../components/ui/ProfilePicker.jsx';
import SectionCard from '../components/ui/SectionCard.jsx';
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import { ROUTES } from '../routes.js';
import { SECTIONS, toolsInSection } from '../tools.js';
import { buildExport, parseImport } from '../lib/storage.js';
import {
  formatProfileValue,
  formatServer,
  hasProfileDetails,
  profileLabel,
} from '../lib/profile.js';
import { hasAnyChests } from '../lib/chests.js';
import { hasAnySpeedups } from '../lib/speedups.js';
import { hasAnyOther } from '../lib/other.js';
import { hasAnyOnHand } from '../lib/resourceTotals.js';

const tools = toolsInSection(SECTIONS.PROFILE);

const PROFILE_FIELDS = [
  { key: 'ign', label: 'In-game name', format: formatProfileValue },
  { key: 'server', label: 'Server', format: formatServer },
  { key: 'guild', label: 'Guild', format: formatProfileValue },
  { key: 'level', label: 'Player level', format: formatProfileValue },
  { key: 'power', label: 'Power', format: formatProfileValue },
];

function ProfileFieldRow({ label, display }) {
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

function EditLink({ to }) {
  return (
    <Link to={to} className="btn-secondary text-xs">
      Edit
    </Link>
  );
}

export default function Dashboard() {
  const {
    profiles,
    activeProfile,
    createProfile,
    renameProfile,
    updateProfileDetails,
    deleteProfile,
    replaceAllProfiles,
    updateOnHand,
  } = useProfiles();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState(null);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  const canDelete = profiles.length > 1;
  const hasDetails = hasProfileDetails(activeProfile);
  const showOther = hasAnyOther(activeProfile.other, activeProfile.customOther);
  const showChests = hasAnyChests(activeProfile.chests);
  const showSpeedups = hasAnySpeedups(activeProfile.inventory);
  // Resource Totals card is interesting any time there's *something* to total —
  // on-hand or chests. On-hand inputs themselves are always editable below.
  const showResourceTotals = showChests || hasAnyOnHand(activeProfile.onHand);

  const handleCreate = () => {
    const name = window.prompt('Profile name:', '');
    if (name && name.trim()) createProfile(name);
  };

  const handleRename = () => {
    const name = window.prompt('Rename profile:', activeProfile.name);
    if (name && name.trim()) renameProfile(activeProfile.id, name);
  };

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

  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Dashboard"
        subtitle="Your in-game info and a snapshot of every tracker, saved locally to this browser."
        actions={
          <>
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
          </>
        }
      />

      <ProfilePicker label="Viewing" />

      <SectionCard title={profileLabel(activeProfile)}>
        <dl>
          {PROFILE_FIELDS.map(({ key, label, format }) => (
            <ProfileFieldRow
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
      </SectionCard>

      {showOther && (
        <SectionCard
          title="Other Inventory"
          actions={<EditLink to={ROUTES.inventoryOther} />}
        >
          <OtherSummary
            other={activeProfile.other}
            customItems={activeProfile.customOther}
          />
        </SectionCard>
      )}

      <SectionCard
        title="On-hand"
        actions={<EditLink to={ROUTES.inventoryResources} />}
      >
        <OnHandResources
          onHand={activeProfile.onHand}
          onChange={updateOnHand}
        />
      </SectionCard>

      {showResourceTotals && (
        <SectionCard
          title="Resource Totals"
          actions={<EditLink to={ROUTES.inventoryResources} />}
        >
          <ResourceTotals
            chests={activeProfile.chests}
            playerLevel={activeProfile.level}
            onHand={activeProfile.onHand}
          />
        </SectionCard>
      )}

      {showChests && (
        <SectionCard
          title="Resource Inventory"
          actions={<EditLink to={ROUTES.inventoryResources} />}
        >
          <ChestSummary chests={activeProfile.chests} />
        </SectionCard>
      )}

      {showSpeedups && (
        <SectionCard
          title="Speedup Inventory"
          actions={<EditLink to={ROUTES.inventorySpeedups} />}
        >
          <SpeedupSummary inventory={activeProfile.inventory} />
        </SectionCard>
      )}

      <section>
        <h2 className="h-eyebrow mb-2">Tools</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {tools.map((t) =>
            t.available === false ? (
              <div
                key={t.key}
                className="block cursor-not-allowed rounded-lg bg-slate-800/30 p-4 opacity-60 ring-1 ring-slate-800"
              >
                <div className="text-base font-semibold text-slate-300">
                  {t.label}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    (coming soon)
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{t.description}</p>
              </div>
            ) : (
              <Link
                key={t.key}
                to={t.path}
                className="card transition-all hover:-translate-y-0.5 hover:bg-slate-800/80 hover:shadow-md hover:ring-indigo-400/70"
              >
                <div className="text-base font-semibold text-slate-100">
                  {t.label}
                </div>
                <p className="mt-1 text-sm text-slate-400">{t.description}</p>
              </Link>
            ),
          )}
        </div>
      </section>

      <SectionCard title="Backup">
        <p className="text-sm text-slate-400">
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
      </SectionCard>

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
