import {
  CHEST_RESOURCES,
  CHEST_TYPES,
  CHEST_TIER_BY_KEY,
  tiersForType,
} from '../../lib/data/chests.js';
import {
  hasAnyLeveledOverrides,
  LEVELED_OVERRIDE_FIELDS,
  LEVELED_OVERRIDE_TIERS,
  leveledValuesWithOverrides,
} from '../../lib/resourceTotals.js';
import { formatCompactFull } from '../../lib/format.js';
import StepperInput from '../ui/StepperInput.jsx';
import ResetButton from '../ui/ResetButton.jsx';

// Labels for the override columns. "ore" covers Gold/Lumber/Steel because the
// in-game leveled chest pays the same amount for any of the three.
const OVERRIDE_FIELD_LABELS = {
  xp: 'XP',
  electricity: 'Electricity',
  ore: 'Gold / Lumber / Steel',
};

function LeveledChestValueOverrides({
  overrides,
  playerLevel,
  onChange,
  onReset,
}) {
  // Pure modeled values (no overrides) — surfaced as a hint per cell so the
  // user can see what they'd revert to if they cleared the field.
  const modeled = leveledValuesWithOverrides(playerLevel, null);
  const hasOverrides = hasAnyLeveledOverrides(overrides);
  const levelLabel =
    Number.isFinite(playerLevel) && playerLevel > 0
      ? `level ${playerLevel}`
      : 'level 30 (default)';
  return (
    <div className="border-b border-slate-800 bg-slate-900/40">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Per-chest values
          </span>
          <span className="text-xs text-slate-500">
            Override the modeled values at {levelLabel}. Leave a field blank
            (0) to use the modeled value. Gold / Lumber / Steel share one
            field because the chest pays the same amount for any of them.
          </span>
        </div>
        {hasOverrides && onReset && (
          <ResetButton
            onReset={onReset}
            confirmTitle="Reset per-chest value overrides?"
            confirmMessage="Clear every override and fall back to the modeled per-chest values."
            label="Reset values"
          />
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/40 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Tier</th>
              {LEVELED_OVERRIDE_FIELDS.map((field) => (
                <th
                  key={field}
                  className="px-2 py-2 text-center font-medium"
                >
                  {OVERRIDE_FIELD_LABELS[field]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LEVELED_OVERRIDE_TIERS.map((tierKey) => {
              const tier = CHEST_TIER_BY_KEY[tierKey];
              if (!tier) return null;
              const tierOverrides = overrides?.[tierKey] || {};
              const tierModeled = modeled?.[tierKey] || {};
              return (
                <tr key={tierKey} className="border-t border-slate-800">
                  <td
                    className={`px-3 py-2 font-medium ${tier.accent}`}
                  >
                    {tier.label}
                  </td>
                  {LEVELED_OVERRIDE_FIELDS.map((field) => {
                    // "ore" override applies to gold/lumber/steel, which all
                    // share the same modeled value — pick gold as the hint.
                    const modeledKey = field === 'ore' ? 'gold' : field;
                    const modeledValue = tierModeled[modeledKey] || 0;
                    const overridden =
                      (Number(tierOverrides[field]) || 0) > 0;
                    return (
                      <td key={field} className="px-1 py-1.5">
                        <StepperInput
                          value={Number(tierOverrides[field]) || 0}
                          onChange={(v) => onChange(tierKey, field, v)}
                          className="h-8 w-full min-w-[6rem]"
                          ariaLabel={`${tier.label} ${OVERRIDE_FIELD_LABELS[field]} per-chest value override`}
                          title={
                            overridden
                              ? `Override in use. Modeled value: ${formatCompactFull(modeledValue)}.`
                              : `Using modeled value: ${formatCompactFull(modeledValue)}.`
                          }
                        />
                        <div
                          className={`mt-0.5 text-center text-[10px] tabular-nums ${overridden ? 'text-slate-500' : 'text-slate-600'}`}
                        >
                          model: {formatCompactFull(modeledValue)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ChestInventory({
  chests,
  onChange,
  leveledOverrides,
  playerLevel,
  onLeveledOverrideChange,
  onLeveledOverrideReset,
}) {
  return (
    <div className="flex flex-col gap-4">
      {CHEST_TYPES.map((type) => (
        <div
          key={type.key}
          className="panel overflow-x-auto"
        >
          <table className="w-full text-sm">
            <caption className="bg-slate-800/80 px-3 py-2 text-left text-sm font-semibold text-slate-100">
              {type.label}
            </caption>
            <thead className="bg-slate-800/60 text-slate-300">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Tier</th>
                {CHEST_RESOURCES.map((r) => (
                  <th
                    key={r.key}
                    className={`px-2 py-2 text-center font-medium ${r.accent}`}
                  >
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="panel-body">
              {tiersForType(type.key).map((tier) => (
                <tr key={tier.key} className="border-t border-slate-800">
                  <td
                    className={`px-3 py-2 font-medium ${tier.accent}`}
                  >
                    {tier.label}
                  </td>
                  {CHEST_RESOURCES.map((resource) => (
                    <td key={resource.key} className="px-1 py-1.5">
                      <StepperInput
                        value={chests[type.key][tier.key][resource.key]}
                        onChange={(value) =>
                          onChange(type.key, tier.key, resource.key, value)
                        }
                        className="h-8 w-full min-w-[6rem]"
                        ariaLabel={`${type.label} ${tier.label} ${resource.label} chests`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {type.key === 'leveled' && onLeveledOverrideChange && (
            <LeveledChestValueOverrides
              overrides={leveledOverrides}
              playerLevel={playerLevel}
              onChange={onLeveledOverrideChange}
              onReset={onLeveledOverrideReset}
            />
          )}
        </div>
      ))}
    </div>
  );
}
