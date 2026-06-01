import { useMemo, useState } from 'react';
import { useProfiles } from '../hooks/useProfiles.js';
import ProfilePicker from '../components/ui/ProfilePicker.jsx';
import ResetButton from '../components/ui/ResetButton.jsx';
import SelectField from '../components/ui/SelectField.jsx';
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import {
  NOTE_CATEGORIES,
  NOTE_LINK_TYPES,
  noteLinkLabel,
  noteLinkOptionsFor,
} from '../lib/notes.js';

const CATEGORY_BY_KEY = NOTE_CATEGORIES.reduce((acc, c) => {
  acc[c.key] = c;
  return acc;
}, {});

const CATEGORY_OPTIONS = NOTE_CATEGORIES.map((c) => ({
  value: c.key,
  label: c.label,
}));

const CATEGORY_FILTER_OPTIONS = [
  { value: '', label: 'All categories' },
  ...CATEGORY_OPTIONS,
];

const LINK_TYPE_OPTIONS = [
  { value: '', label: 'None' },
  ...NOTE_LINK_TYPES.map((t) => ({ value: t.key, label: t.label })),
];

function formatTimestamp(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function CategoryBadge({ category }) {
  const meta = CATEGORY_BY_KEY[category];
  if (!meta) return null;
  return <span className="badge bg-slate-700 text-slate-300">{meta.label}</span>;
}

function LinkChip({ link }) {
  const label = noteLinkLabel(link);
  if (!label) return null;
  return (
    <span className="badge bg-indigo-500/15 text-indigo-300 ring-indigo-500/30">
      → {label}
    </span>
  );
}

function NoteCard({ note, expanded, onToggle, onChange, onDelete }) {
  const linkType = note.link?.type || '';
  const linkKey = note.link?.key || '';
  const linkOptions = useMemo(
    () => noteLinkOptionsFor(linkType),
    [linkType],
  );

  function handleLinkTypeChange(nextType) {
    if (!nextType) {
      onChange(note.id, { link: null });
      return;
    }
    // Reset target when switching type — old key won't match new domain.
    const opts = noteLinkOptionsFor(nextType);
    onChange(note.id, {
      link: { type: nextType, key: opts[0]?.value || '' },
    });
  }

  function handleLinkKeyChange(nextKey) {
    if (!linkType) return;
    onChange(note.id, {
      link: nextKey ? { type: linkType, key: nextKey } : null,
    });
  }

  const headerTitle = note.title || 'Untitled note';
  const snippet = note.body.split('\n')[0].slice(0, 140);

  return (
    <div className="panel">
      <button
        type="button"
        onClick={() => onToggle(note.id)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left bg-slate-800/80 transition-colors hover:bg-slate-800"
        aria-expanded={expanded}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-100">
              {headerTitle}
            </span>
            <CategoryBadge category={note.category} />
            <LinkChip link={note.link} />
          </div>
          {!expanded && snippet && (
            <span className="truncate text-xs text-slate-400">{snippet}</span>
          )}
        </div>
        <span className="shrink-0 text-xs text-slate-500 tabular-nums">
          {formatTimestamp(note.updatedAt)}
        </span>
      </button>

      {expanded && (
        <div className="panel-body flex flex-col gap-3 px-3 py-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Title
            </span>
            <input
              type="text"
              value={note.title}
              onChange={(e) => onChange(note.id, { title: e.target.value })}
              placeholder="Untitled note"
              className="select-compact"
            />
          </label>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <SelectField
              label="Category"
              value={note.category}
              onChange={(v) => onChange(note.id, { category: v })}
              options={CATEGORY_OPTIONS}
            />
            <SelectField
              label="Link to"
              value={linkType}
              onChange={handleLinkTypeChange}
              options={LINK_TYPE_OPTIONS}
            />
            {linkType && (
              <SelectField
                label={linkType === 'palmon' ? 'Palmon' : 'Building'}
                value={linkKey}
                onChange={handleLinkKeyChange}
                options={linkOptions}
              />
            )}
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Body
            </span>
            <textarea
              value={note.body}
              onChange={(e) => onChange(note.id, { body: e.target.value })}
              placeholder="Anything you want to remember…"
              rows={6}
              className="select-compact resize-y"
            />
          </label>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Created {formatTimestamp(note.createdAt)}
              {note.updatedAt !== note.createdAt && (
                <> · Updated {formatTimestamp(note.updatedAt)}</>
              )}
            </span>
            <button
              type="button"
              onClick={() => onDelete(note.id)}
              className="btn-ghost"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Notes() {
  const { activeProfile, addNote, updateNote, deleteNote, resetActiveNotes } =
    useProfiles();
  const notes = activeProfile.notes;
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [categoryFilter, setCategoryFilter] = useState('');

  function toggleExpanded(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    const newId = addNote();
    setExpandedIds((prev) => new Set(prev).add(newId));
  }

  const filtered = useMemo(() => {
    const list = categoryFilter
      ? notes.filter((n) => n.category === categoryFilter)
      : notes;
    return list
      .slice()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [notes, categoryFilter]);

  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Notes"
        subtitle="Jot down anything: other players, events, items, palmon, buildings. Per-profile."
      />

      <ProfilePicker />

      <div className="toolbar justify-between text-sm text-slate-300">
        <span>
          <span className="text-slate-400">Notes:</span>{' '}
          <span className="tabular-nums text-slate-100">{notes.length}</span>
        </span>
        <ResetButton
          onReset={resetActiveNotes}
          disabled={notes.length === 0}
          confirmTitle="Delete all notes?"
          confirmMessage={`Delete every note in "${activeProfile.name}". This can't be undone.`}
        />
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-lg bg-slate-800/60 p-3 ring-1 ring-slate-700/80">
        <button
          type="button"
          onClick={handleAdd}
          className="btn-primary h-8 py-0"
        >
          + Add note
        </button>
        <SelectField
          label="Filter"
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={CATEGORY_FILTER_OPTIONS}
          ariaLabel="Filter notes by category"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg bg-slate-800/40 p-6 text-center text-sm text-slate-400 ring-1 ring-slate-700/80">
          {notes.length === 0
            ? 'No notes yet. Click "Add note" to start one.'
            : 'No notes in this category.'}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              expanded={expandedIds.has(note.id)}
              onToggle={toggleExpanded}
              onChange={updateNote}
              onDelete={deleteNote}
            />
          ))}
        </div>
      )}
    </div>
  );
}
