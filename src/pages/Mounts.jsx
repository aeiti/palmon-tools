import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import {
  MAX_MOUNT_SKILL_LEVEL,
  MOUNTS,
  MOUNT_SKILL_LEVEL_THRESHOLDS,
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
  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Mounts"
        subtitle={`Reference for the ${MOUNTS.length} mounts in the Stable. Each has one skill (Slackycapy has two), and skill levels unlock as the mount reaches level ${MOUNT_SKILL_LEVEL_THRESHOLDS.join(' / ')}.`}
      />

      <div className="flex flex-col gap-4">
        {MOUNTS.map((mount) => (
          <MountCard key={mount.key} mount={mount} />
        ))}
      </div>
    </div>
  );
}

function MountCard({ mount }) {
  const skills = MOUNT_SKILLS[mount.key] || [];
  return (
    <section className="panel">
      <header className="panel-header">
        <h2>{mount.name}</h2>
      </header>
      <div className="panel-body flex flex-col gap-3 px-3 py-3">
        {skills.length === 0 ? (
          <p className="text-sm text-slate-400">
            No skill data captured for {mount.name} yet.
          </p>
        ) : (
          skills.map((skill, i) => <SkillCard key={i} skill={skill} />)
        )}
      </div>
    </section>
  );
}

function SkillCard({ skill }) {
  return (
    <div className="rounded-md bg-slate-800/60 px-3 py-2 ring-1 ring-slate-700">
      <h3 className="mb-2 text-sm font-semibold text-slate-100">
        {skill.name}
      </h3>
      <ul className="flex flex-col gap-1.5 text-sm text-slate-300">
        {SKILL_LEVELS.map((level) => (
          <li key={level} className="flex items-baseline gap-3">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500 tabular-nums">
              Lv {level}
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
        ))}
      </ul>
    </div>
  );
}
