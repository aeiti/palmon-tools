import { useMemo } from 'react';
import {
  EQUIPMENT_TIERS,
  equipmentByKey,
  slotLabel,
} from '../../lib/data/equipment.js';

const TIER_ORDER = new Map(EQUIPMENT_TIERS.map((t, i) => [t, i]));

// Per-slot picker for the Roster expanded card. Lists every equipment
// instance in the profile whose catalog slot matches this slot index,
// grouped by tier, plus an "Unassigned" entry. Choosing an instance
// already equipped by another palmon (or another slot of this palmon
// — not possible here, but handled by applyEquipmentAssignment) does
// an auto-swap at the hook level.
export default function EquipmentSlotPicker({
  slot,
  palmonId,
  currentEquipmentId,
  allEquipment,
  onAssign,
  ariaLabel,
}) {
  const groups = useMemo(() => {
    const matching = (allEquipment || []).filter((e) => {
      const catalog = equipmentByKey(e.itemKey);
      return catalog && catalog.slot === slot;
    });
    const byTier = new Map();
    for (const tier of EQUIPMENT_TIERS) byTier.set(tier, []);
    for (const e of matching) {
      const tier = equipmentByKey(e.itemKey).tier;
      byTier.get(tier).push(e);
    }
    for (const list of byTier.values()) {
      list.sort((a, b) => a.id.localeCompare(b.id));
    }
    return EQUIPMENT_TIERS.map((tier) => ({
      tier,
      options: byTier.get(tier).map((e) => {
        const catalog = equipmentByKey(e.itemKey);
        const assignedElsewhere =
          e.assignedPalmonId && e.assignedPalmonId !== palmonId;
        const label = assignedElsewhere
          ? `${catalog.name} (equipped)`
          : catalog.name;
        return { value: e.id, label };
      }),
    })).filter((g) => g.options.length > 0);
  }, [allEquipment, slot, palmonId]);

  const label = slotLabel(slot);

  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        value={currentEquipmentId || ''}
        onChange={(e) => onAssign(e.target.value || null)}
        aria-label={ariaLabel || label}
        className="select-compact"
      >
        <option value="">— None —</option>
        {groups.map((group) => (
          <optgroup key={group.tier} label={group.tier}>
            {group.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
