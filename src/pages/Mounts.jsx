import { useProfiles } from '../hooks/useProfiles.js';
import CompactInput from '../components/ui/CompactInput.jsx';
import ProfilePicker from '../components/ui/ProfilePicker.jsx';
import ResetButton from '../components/ui/ResetButton.jsx';
import StepperInput from '../components/ui/StepperInput.jsx';
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import {
  MAX_MOUNT_LEVEL,
  MAX_MOUNT_SKILL_LEVEL,
  MOUNTS,
  MOUNT_SKILL_LEVEL_THRESHOLDS,
  mountSkillLevelFor,
} from '../lib/data/mounts.js';
import { MOUNT_SKILLS } from '../lib/data/mountSkills.js';
import {
  renderSkillEffect,
  skillEffectIsFullyKnown,
} from '../lib/palmonSkills.js';

const SKILL_LEVELS = Array.from(
  { length: MAX_MOUNT_SKILL_LEVEL },
  (_, i) => i + 1,
);

export default function Mounts() {
  const { activeProfile, updateMount, resetActiveMounts } = useProfiles();

  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Mounts"
        subtitle={`Track each of the ${MOUNTS.length} mounts in the Stable. Skill levels (1–5) unlock as the mount reaches level ${MOUNT_SKILL_LEVEL_THRESHOLDS.join(' / ')}.`}
      />

      <ProfilePicker />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="h-section">Stable</h2>
          <ResetButton
            onReset={resetActiveMounts}
            confirmTitle="Reset mounts?"
            confirmMessage={`Set all mount levels and power for "${activeProfile.name}" back to 0.`}
          />
        </div>

        <div className="grid items-start gap-4 sm:grid-cols-2">
          {MOUNTS.map((mount) => (
            <MountCard
              key={mount.key}
              mount={mount}
              entry={activeProfile.mounts?.[mount.key] || { level: 0, power: 0 }}
              onChange={(patch) => updateMount(mount.key, patch)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function MountCard({ mount, entry, onChange }) {
  const skills = MOUNT_SKILLS[mount.key] || [];
  const currentSkillLevel = mountSkillLevelFor(entry.level);

  return (
    <section className="panel">
      <header className="panel-header flex items-center justify-between gap-3">
        <h3>{mount.name}</h3>
        <span className="text-xs text-slate-400 tabular-nums">
          {currentSkillLevel > 0
            ? `Skill Lv ${currentSkillLevel}`
            : 'Skill locked'}
        </span>
      </header>
      <div className="panel-body flex flex-col gap-3 px-3 py-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <LabeledInput id={`${mount.key}-level`} label="Mount level">
            <StepperInput
              value={entry.level}
              onChange={(v) =>
                onChange({
                  level: Math.max(0, Math.min(MAX_MOUNT_LEVEL, Math.floor(v))),
                })
              }
              id={`${mount.key}-level`}
              ariaLabel={`${mount.name} level`}
              className="h-8 w-28"
            />
          </LabeledInput>
          <LabeledInput id={`${mount.key}-power`} label="Power">
            <CompactInput
              value={entry.power}
              onChange={(v) => onChange({ power: Math.max(0, v) })}
              id={`${mount.key}-power`}
              ariaLabel={`${mount.name} power`}
              className="h-8 w-32 rounded-md bg-slate-800 px-2 text-right tabular-nums text-sm text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </LabeledInput>
        </div>

        {skills.length === 0 ? (
          <p className="text-sm text-slate-400">
            No skill data captured for {mount.name} yet.
          </p>
        ) : (
          skills.map((skill, i) => (
            <SkillCard
              key={i}
              skill={skill}
              currentSkillLevel={currentSkillLevel}
            />
          ))
        )}
      </div>
    </section>
  );
}

function LabeledInput({ id, label, children }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm">
      <span className="shrink-0 text-xs uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function SkillCard({ skill, currentSkillLevel }) {
  return (
    <div className="rounded-md bg-slate-800/60 px-3 py-2 ring-1 ring-slate-700">
      <h4 className="mb-2 text-sm font-semibold text-slate-100">
        {skill.name}
      </h4>
      <ul className="flex flex-col gap-1.5 text-sm">
        {SKILL_LEVELS.map((level) => {
          const isCurrent = level === currentSkillLevel;
          const isLocked = currentSkillLevel < level;
          return (
            <li
              key={level}
              className={[
                'flex items-baseline gap-3 rounded px-2 py-1 transition-colors',
                isCurrent
                  ? 'bg-indigo-500/10 text-slate-100 ring-1 ring-indigo-400/40'
                  : isLocked
                    ? 'text-slate-500'
                    : 'text-slate-300',
              ].join(' ')}
            >
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wide tabular-nums">
                Lv {level}
              </span>
              <span className="shrink-0 text-[10px] uppercase tabular-nums text-slate-500">
                ≥ mount {MOUNT_SKILL_LEVEL_THRESHOLDS[level - 1]}
              </span>
              <span>
                {renderSkillEffect(skill, level)}
                {!skillEffectIsFullyKnown(skill, level) && (
                  <span className="ml-1 text-xs italic text-slate-500">
                    (values pending)
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
