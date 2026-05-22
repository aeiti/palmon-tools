import { Link } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles.js';
import ProfileSummary from '../components/ProfileSummary.jsx';
import { hasProfileDetails, profileLabel } from '../lib/profile.js';

const tools = [
  {
    to: '/speedups',
    title: 'Speedup Calculator',
    description:
      'Track your speedup inventory and check whether you have enough for an upcoming build, research, or training.',
    available: true,
  },
];

export default function Home() {
  const { activeProfile } = useProfiles();
  const showProfile = hasProfileDetails(activeProfile);

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold text-slate-100 sm:text-3xl">
          Palmon Tools
        </h1>
        <p className="mt-2 text-slate-300">
          Calculators and trackers to help you plan your run in Palmon:
          Survival.
        </p>
      </section>

      {showProfile && (
        <section className="rounded-lg bg-slate-800/60 p-4 ring-1 ring-slate-700">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-100">
              {profileLabel(activeProfile)}
            </h2>
            <Link
              to="/speedups"
              className="text-xs text-indigo-300 underline hover:text-indigo-200"
            >
              Edit
            </Link>
          </div>
          <div className="mt-3">
            <ProfileSummary profile={activeProfile} />
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Tools
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {tools.map((t) =>
            t.available ? (
              <Link
                key={t.to}
                to={t.to}
                className="block rounded-lg bg-slate-800/60 p-4 ring-1 ring-slate-700 transition-colors hover:bg-slate-800 hover:ring-indigo-400"
              >
                <div className="text-base font-semibold text-slate-100">
                  {t.title}
                </div>
                <p className="mt-1 text-sm text-slate-400">{t.description}</p>
              </Link>
            ) : (
              <div
                key={t.title}
                className="block cursor-not-allowed rounded-lg bg-slate-800/30 p-4 opacity-60 ring-1 ring-slate-800"
              >
                <div className="text-base font-semibold text-slate-300">
                  {t.title}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    (coming soon)
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{t.description}</p>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
