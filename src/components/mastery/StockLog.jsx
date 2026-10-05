import { useState } from "react";
import { CHEST_RESOURCES } from "../../lib/data/chests.js";
import {
  MASTERY_CHESTS,
  MASTERY_RESOURCES,
} from "../../lib/data/campMastery.js";
import { OTHER_ITEMS } from "../../lib/data/other.js";
import { formatCompact, formatCompactFull } from "../../lib/format.js";
import CompactInput from "../ui/CompactInput.jsx";
import ResetButton from "../ui/ResetButton.jsx";
import StepperInput from "../ui/StepperInput.jsx";
import { formatWhen, toLocalInputValue } from "./format.js";

const RESOURCE_META = Object.fromEntries(
  CHEST_RESOURCES.map((r) => [r.key, r]),
);
const CHEST_LABEL = Object.fromEntries(
  OTHER_ITEMS.map((i) => [i.key, i.label]),
);

// Past readings, newest first, each with its chests and note. Edit opens a
// form for that reading above the list; new readings are logged from the
// shared ResourceSnapshot panel instead.
export default function StockLog({ log, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setDraft({
      at: toLocalInputValue(Date.parse(entry.at)),
      gold: entry.gold,
      lumber: entry.lumber,
      steel: entry.steel,
      chests: { ...entry.chests },
      note: entry.note,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const submit = (e) => {
    e.preventDefault();
    const at = Date.parse(draft.at);
    if (!Number.isFinite(at)) return;
    onUpdate(editingId, { ...draft, at: new Date(at).toISOString() });
    cancelEdit();
  };

  const setChest = (key, value) =>
    setDraft((d) => ({ ...d, chests: { ...d.chests, [key]: value } }));

  const newestFirst = [...log].reverse();

  return (
    <div className="flex flex-col gap-4">
      {editingId && (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <p className="text-sm text-indigo-300">Editing a past reading</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <label className="col-span-2 flex flex-col gap-1 sm:col-span-1">
              <span className="text-xs font-medium text-slate-400">When</span>
              <input
                type="datetime-local"
                className="input-inline h-8"
                value={draft.at}
                onChange={(e) => setDraft({ ...draft, at: e.target.value })}
                required
              />
            </label>
            {MASTERY_RESOURCES.map((r) => (
              <label key={r} className="flex flex-col gap-1">
                <span
                  className={`text-xs font-medium ${RESOURCE_META[r].accent}`}
                >
                  {RESOURCE_META[r].label}
                </span>
                <CompactInput
                  value={draft[r]}
                  onChange={(v) => setDraft((d) => ({ ...d, [r]: v }))}
                  className="input-compact"
                  ariaLabel={`${RESOURCE_META[r].label} stock`}
                />
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {MASTERY_CHESTS.map((c) => (
              <label key={c.key} className="flex flex-col gap-1">
                <span className="truncate text-xs font-medium text-slate-400">
                  {CHEST_LABEL[c.key]}
                </span>
                <StepperInput
                  value={draft.chests[c.key] ?? 0}
                  onChange={(v) => setChest(c.key, v)}
                  className="h-8 w-full"
                  ariaLabel={`${CHEST_LABEL[c.key]} count`}
                />
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              className="input-inline h-8 min-w-0 flex-1"
              placeholder="Note (optional)"
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={cancelEdit}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save changes
            </button>
          </div>
        </form>
      )}

      {newestFirst.length === 0 ? (
        <p className="text-subtle">
          No readings yet. Log one now and another in a few hours to measure
          your income rate.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-700/60">
          {newestFirst.map((e) => (
            <li
              key={e.id}
              className={[
                "flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm",
                e.id === editingId ? "bg-indigo-500/10" : "",
              ].join(" ")}
            >
              <span className="w-full text-slate-300 sm:w-32">
                {formatWhen(Date.parse(e.at))}
              </span>
              {MASTERY_RESOURCES.map((r) => (
                <span
                  key={r}
                  className={`w-14 tabular-nums ${RESOURCE_META[r].accent}`}
                  title={formatCompactFull(e[r])}
                >
                  {formatCompact(e[r])}
                </span>
              ))}
              <span className="ml-auto flex gap-2">
                <button
                  type="button"
                  className="btn-secondary px-2.5 py-1 text-xs"
                  onClick={() => startEdit(e)}
                >
                  Edit
                </button>
                <ResetButton
                  label="Delete"
                  onReset={() => {
                    if (e.id === editingId) cancelEdit();
                    onDelete(e.id);
                  }}
                  confirmTitle="Delete this reading?"
                  confirmMessage={`Remove the reading from ${formatWhen(Date.parse(e.at))}. Rates are re-measured without it.`}
                  confirmLabel="Delete"
                />
              </span>
              <ChestSummary chests={e.chests} note={e.note} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChestSummary({ chests, note }) {
  const parts = MASTERY_CHESTS.filter((c) => chests?.[c.key] != null).map(
    (c) => `${c.short} ${formatCompact(chests[c.key])}`,
  );
  if (parts.length === 0 && !note) return null;
  return (
    <span className="w-full text-xs text-slate-500">
      {parts.join(" · ")}
      {parts.length > 0 && note ? " — " : ""}
      {note}
    </span>
  );
}
