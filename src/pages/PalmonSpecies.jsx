import { Link, useParams } from 'react-router-dom';
import {
  ElementBadge,
  EvolvedBadge,
  MythicalBadge,
  RarityBadge,
} from '../components/palmon/Badges.jsx';
import { ROUTES } from '../routes.js';
import { PALMON_SPECIES_BY_KEY } from '../lib/data/palmon.js';
import { PALMON_SKILLS } from '../lib/data/palmonSkills.js';
import { speciesEvolvedName } from '../lib/palmon.js';
import {
  renderSkillEffect,
  skillEffectIsFullyKnown,
} from '../lib/palmonSkills.js';
import {
  formatPageTitle,
  useDocumentMeta,
} from '../hooks/useDocumentMeta.js';

export default function PalmonSpecies() {
  const { speciesKey } = useParams();
  const species = PALMON_SPECIES_BY_KEY[speciesKey];

  // Title and description need to be computed before the early-return
  // so the hook runs unconditionally regardless of which branch renders.
  const pageTitle = species
    ? formatPageTitle(species.name)
    : formatPageTitle('Palmon not found');
  const pageDescription = species
    ? `${species.name} — ${capitalize(species.element)} ${species.rarity.toUpperCase()} Palmon${species.mythical ? ' (mythical)' : ''}. Skills, ascension effects, and Lv 30 values.`
    : undefined;
  useDocumentMeta({ title: pageTitle, description: pageDescription });

  if (!species) {
    return (
      <article className="flex flex-col gap-4 text-slate-300">
        <h1 className="h-page">Palmon not found</h1>
        <p>
          No species matches <code className="text-slate-200">{speciesKey}</code>
          .{' '}
          <Link to={ROUTES.roster} className="link-inline">
            Back to Roster
          </Link>
          .
        </p>
      </article>
    );
  }

  const skills = PALMON_SKILLS[species.key] || [];
  const evolvedName = speciesEvolvedName(species.key);

  return (
    <article className="flex flex-col gap-6 text-slate-300">
      <header className="flex flex-col gap-2">
        <Link to={ROUTES.roster} className="link-inline text-sm">
          ← Roster
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="h-page">{species.name}</h1>
          <ElementBadge element={species.element} />
          <RarityBadge rarity={species.rarity} />
          {species.mythical && <MythicalBadge />}
          {evolvedName && <EvolvedBadge name={evolvedName} />}
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="h-section">Skills</h2>
        {skills.length === 0 ? (
          <p className="text-sm text-slate-400">
            No skill data for {species.name} yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {skills.map((skill, i) => (
              <SkillCard key={i} skill={skill} />
            ))}
          </div>
        )}
      </section>
    </article>
  );
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function SkillCard({ skill }) {
  return (
    <div className="panel">
      <div className="panel-header flex items-center justify-between px-3 py-2">
        <h3 className="text-sm font-semibold text-slate-100">{skill.name}</h3>
        <span className="text-[10px] uppercase tracking-wide text-slate-500">
          Lv 30
        </span>
      </div>
      <div className="panel-body flex flex-col gap-3 px-3 py-3">
        <p className="text-sm text-slate-300">
          {renderSkillEffect(skill, 30)}
          {!skillEffectIsFullyKnown(skill, 30) && (
            <span className="ml-2 text-xs italic text-slate-500">
              (L30 values pending)
            </span>
          )}
        </p>
        {skill.ascensionEffects.length > 0 && (
          <div>
            <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Skill Ascension Effects
            </h4>
            <ul className="flex flex-col gap-1 text-sm text-slate-300">
              {skill.ascensionEffects.map((eff, i) => (
                <li key={i} className="flex items-baseline gap-2">
                  <span
                    aria-label={`${i + 1} star${i === 0 ? '' : 's'}`}
                    className="text-amber-300 tabular-nums"
                  >
                    {'★'.repeat(i + 1)}
                  </span>
                  <span>{eff}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
