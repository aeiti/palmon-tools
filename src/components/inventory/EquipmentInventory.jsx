import { useMemo, useState } from 'react';
import {
  EQUIPMENT_CATALOG,
  EQUIPMENT_TIERS,
  equipmentByKey,
  slotLabel,
} from '../../lib/data/equipment.js';
import { palmonDisplayName } from '../../lib/palmon.js';
import { rarityBadgeClass } from '../../lib/data/rarity.js';
import CardColumns from '../ui/CardColumns.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import EquipmentDialog from './EquipmentDialog.jsx';

const TIER_ORDER = new Map(EQUIPMENT_TIERS.map((t, i) => [t, i]));
const SLOTS = Array.from(
  new Set(EQUIPMENT_CATALOG.map((e) => e.slot)),
).sort();

function InstanceRow({ instance, palmonsById, onEdit, onDelete }) {
  const catalog = equipmentByKey(instance.itemKey);
  if (!catalog) return null;
  const assigned = instance.assignedPalmonId
    ? palmonsById.get(instance.assignedPalmonId)
    : null;
  return (
    <div className="flex items-center justify-between gap-2 border-t border-slate-800 px-3 py-1.5">
      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-slate-200">
        <span
          className={[
            'rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 tabular-nums',
            rarityBadgeClass(catalog.tier),
          ].join(' ')}
        >
          {catalog.tier}
        </span>
        <span className="min-w-0 truncate">{catalog.name}</span>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-xs tabular-nums text-slate-300">
        <span>
          <span className="text-slate-500">A</span> {instance.ascendLevel}
        </span>
        <span>
          <span className="text-slate-500">E</span> {instance.enhanceLevel}
        </span>
        <span
          className={[
            'max-w-[8rem] truncate rounded-md px-1.5 py-0.5 ring-1',
            assigned
              ? 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30'
              : 'bg-slate-700/40 text-slate-500 ring-slate-700/60',
          ].join(' ')}
          title={assigned?.name || 'Unassigned'}
        >
          {assigned ? assigned.name : '—'}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(instance)}
          aria-label={`Edit ${catalog.name}`}
          className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5"
            fill="currentColor"
          >
            <path d="M11.293 1.293a1 1 0 0 1 1.414 0l2 2a1 1 0 0 1 0 1.414L5.414 13.5 1.5 14.5l1-3.914 8.793-9.293zM10.5 3.5 12.5 5.5"></path>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDelete(instance)}
          aria-label={`Delete ${catalog.name}`}
          className="rounded p-1 text-slate-500 transition-colors hover:bg-red-900/50 hover:text-red-300"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5"
            fill="currentColor"
          >
            <path d="M6 2h4l.5 1H13v1H3V3h2.5L6 2zM4 5h8l-.6 9.1a1 1 0 0 1-1 .9H5.6a1 1 0 0 1-1-.9L4 5z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function EquipmentInventory({
  equipment,
  palmons,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [dialogState, setDialogState] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const palmonsById = useMemo(() => {
    const map = new Map();
    for (const p of palmons || []) {
      map.set(p.id, { id: p.id, name: palmonDisplayName(p, palmons) });
    }
    return map;
  }, [palmons]);

  const grouped = useMemo(() => {
    const buckets = new Map(SLOTS.map((s) => [s, []]));
    for (const inst of equipment || []) {
      const catalog = equipmentByKey(inst.itemKey);
      if (!catalog) continue;
      buckets.get(catalog.slot)?.push(inst);
    }
    for (const list of buckets.values()) {
      list.sort((a, b) => {
        const ai = TIER_ORDER.get(equipmentByKey(a.itemKey).tier);
        const bi = TIER_ORDER.get(equipmentByKey(b.itemKey).tier);
        if (ai !== bi) return ai - bi;
        return a.id.localeCompare(b.id);
      });
    }
    return buckets;
  }, [equipment]);

  const cards = SLOTS.map((slot) => {
    const items = grouped.get(slot) || [];
    return {
      key: `slot-${slot}`,
      label: slotLabel(slot),
      weight: Math.max(1, items.length),
      content:
        items.length === 0 ? (
          <p className="border-t border-slate-800 px-3 py-2 text-xs text-slate-500">
            No items.
          </p>
        ) : (
          <div className="flex flex-col">
            {items.map((inst) => (
              <InstanceRow
                key={inst.id}
                instance={inst}
                palmonsById={palmonsById}
                onEdit={(it) => setDialogState(it)}
                onDelete={(it) => setPendingDelete(it)}
              />
            ))}
          </div>
        ),
    };
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setDialogState({})}
          className="btn-secondary text-xs"
        >
          + Add equipment
        </button>
      </div>
      <CardColumns items={cards} />

      <EquipmentDialog
        open={Boolean(dialogState)}
        initial={dialogState}
        palmons={palmons}
        onCancel={() => setDialogState(null)}
        onSave={(values) => {
          if (dialogState?.id) {
            onUpdate(dialogState.id, values);
          } else {
            onAdd(values.itemKey, values);
          }
          setDialogState(null);
        }}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete equipment?"
        message={
          pendingDelete
            ? `Remove this ${equipmentByKey(pendingDelete.itemKey)?.name || 'item'} permanently.`
            : ''
        }
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) onDelete(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
