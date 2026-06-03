import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import { TRAIT_GRADES } from '../lib/data/palmonTraits.js';
import { traitsByGradeFor } from '../lib/palmonTraits.js';

const CATEGORIES = [
  {
    key: 'combat',
    label: 'Combat',
    blurb: 'Traits that affect battle stats — Attack, HP, Crit, etc.',
  },
  {
    key: 'work',
    label: 'Work',
    blurb:
      'Traits that affect production and camp activities — output rates, training/healing times, energy and hunger.',
  },
];

const GRADE_STYLES = {
  S: 'bg-amber-500/15 text-amber-300 ring-amber-500/40',
  A: 'bg-violet-500/15 text-violet-300 ring-violet-500/40',
  B: 'bg-sky-500/15 text-sky-300 ring-sky-500/40',
  C: 'bg-rose-500/15 text-rose-300 ring-rose-500/40',
};

const GRADE_BLURB = {
  S: 'Strongest tier. Best-in-class breeding outcomes.',
  A: 'Strong tier.',
  B: 'Modest tier.',
  C: 'Debuffs. Negative effects only.',
};

export default function Traits() {
  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Traits"
        subtitle="Every breeding trait in the game, grouped by category (Combat / Work) and grade (S / A / B / C). C-grade traits are debuffs."
      />

      {CATEGORIES.map((cat) => (
        <CategorySection key={cat.key} category={cat} />
      ))}
    </div>
  );
}

function CategorySection({ category }) {
  const buckets = traitsByGradeFor(category.key);

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="h-section">{category.label}</h2>
        <p className="text-subtle">{category.blurb}</p>
      </div>

      <div className="flex flex-col gap-3">
        {TRAIT_GRADES.map((grade) => {
          const traits = buckets[grade];
          if (traits.length === 0) return null;
          return (
            <GradeBucket
              key={grade}
              grade={grade}
              traits={traits}
              category={category.key}
            />
          );
        })}
      </div>
    </section>
  );
}

function GradeBucket({ grade, traits, category }) {
  return (
    <section className="panel">
      <header className="panel-header flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <GradeBadge grade={grade} />
          <span className="text-slate-300">{GRADE_BLURB[grade]}</span>
        </span>
        <span className="text-xs text-slate-400 tabular-nums">
          {traits.length}
        </span>
      </header>
      <ul className="panel-body divide-y divide-slate-800/80">
        {traits.map((trait) => (
          <li
            key={`${category}-${grade}-${trait.slug}`}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-3 py-2"
          >
            <span className="text-sm font-semibold text-slate-100">
              {trait.name}
            </span>
            <span
              className={`text-sm ${grade === 'C' ? 'text-rose-300/90' : 'text-slate-300'}`}
            >
              {trait.effect}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function GradeBadge({ grade }) {
  return (
    <span
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded px-1.5 text-xs font-bold ring-1 ${GRADE_STYLES[grade]}`}
    >
      {grade}
    </span>
  );
}
