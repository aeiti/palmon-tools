import { useMemo, useState } from 'react';
import {
  EQUIPMENT_CATALOG,
  EQUIPMENT_TIERS,
  MAX_ASCEND_LEVEL,
  MAX_ENHANCE_LEVEL,
  equipmentByKey,
  slotLabel,
} from '../../lib/data/equipment.js';
import { palmonDisplayName } from '../../lib/palmon.js';

// Catalog options grouped by slot, sorted by tier order within each
// slot. Static — computed once at module load.
function buildItemGroups() {
  const bySlot = new Map();
  for (const entry of EQUIPMENT_CATALOG) {
    if (!bySlot.has(entry.slot)) bySlot.set(entry.slot, []);
    bySlot.get(entry.slot).push(entry);
  }
  const tierOrder = new Map(EQUIPMENT_TIERS.map((t, i) => [t, i]));
  return Array.from(bySlot.entries())
    .sort(([a], [b]) => a - b)
    .map(([slot, items]) => ({
      label: slotLabel(slot),
      options: items
        .slice()
        .sort((a, b) => tierOrder.get(a.tier) - tierOrder.get(b.tier))
        .map((e) => ({ value: e.key, label: `${e.name} (${e.tier})` })),
    }));
}

const ITEM_GROUPS = buildItemGroups();

function parseLevel(value, max) {
  if (value === '' || value === null || value === undefined) return 0;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(max, Math.floor(n));
}

export default function EquipmentDialog({
  open,
  initial,
  palmons,
  onCancel,
  onSave,
}) {
  if (!open) return null;
  return (
    <EquipmentDialogForm
      initial={initial}
      palmons={palmons}
      onCancel={onCancel}
      onSave={onSave}
    />
  );
}

function EquipmentDialogForm({ initial, palmons, onCancel, onSave }) {
  const isEdit = Boolean(initial?.id);
  const [itemKey, setItemKey] = useState(initial?.itemKey || '');
  const [ascendLevel, setAscendLevel] = useState(
    String(initial?.ascendLevel ?? ''),
  );
  const [enhanceLevel, setEnhanceLevel] = useState(
    String(initial?.enhanceLevel ?? ''),
  );
  const [assignedPalmonId, setAssignedPalmonId] = useState(
    initial?.assignedPalmonId || '',
  );

  const palmonOptions = useMemo(
    () =>
      (palmons || []).map((p) => ({
        value: p.id,
        label: palmonDisplayName(p, palmons),
      })),
    [palmons],
  );

  const selectedItem = itemKey ? equipmentByKey(itemKey) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemKey) return;
    onSave({
      itemKey,
      ascendLevel: parseLevel(ascendLevel, MAX_ASCEND_LEVEL),
      enhanceLevel: parseLevel(enhanceLevel, MAX_ENHANCE_LEVEL),
      assignedPalmonId: assignedPalmonId || null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg bg-slate-800 p-5 shadow-2xl ring-1 ring-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-100">
          {isEdit ? 'Edit equipment' : 'Add equipment'}
        </h2>

        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-300">Item</span>
            {isEdit ? (
              <span className="rounded-md bg-slate-900/60 px-2 py-1.5 text-sm text-slate-200 ring-1 ring-slate-700">
                {selectedItem
                  ? `${selectedItem.name} — ${slotLabel(selectedItem.slot)} (${selectedItem.tier})`
                  : '—'}
              </span>
            ) : (
              <select
                autoFocus
                value={itemKey}
                onChange={(e) => setItemKey(e.target.value)}
                className="select"
                required
              >
                <option value="">Select an item…</option>
                {ITEM_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-300">Ascend</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max={MAX_ASCEND_LEVEL}
                value={ascendLevel}
                placeholder="0"
                onChange={(e) => setAscendLevel(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="input"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-300">Enhance</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max={MAX_ENHANCE_LEVEL}
                value={enhanceLevel}
                placeholder="0"
                onChange={(e) => setEnhanceLevel(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="input"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-300">Assigned palmon</span>
            <select
              value={assignedPalmonId}
              onChange={(e) => setAssignedPalmonId(e.target.value)}
              className="select"
            >
              <option value="">— Unassigned —</option>
              {palmonOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={!itemKey} className="btn-primary">
            {isEdit ? 'Save' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
}
