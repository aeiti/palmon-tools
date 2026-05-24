import { Link } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles.js';
import ProfileSummary from '../components/profile/ProfileSummary.jsx';
import ChestSummary from '../components/inventory/ChestSummary.jsx';
import ResourceTotals from '../components/inventory/ResourceTotals.jsx';
import SpeedupSummary from '../components/SpeedupSummary.jsx';
import OtherSummary from '../components/inventory/OtherSummary.jsx';
import { ROUTES } from '../routes.js';
import { hasProfileDetails, profileLabel } from '../lib/profile.js';
import { hasAnyChests } from '../lib/chests.js';
import { hasAnySpeedups } from '../lib/speedups.js';
import { hasAnyOther } from '../lib/other.js';

const tools = [
  {
    to: ROUTES.buildings,
    title: 'Buildings',
    description:
      'Track the level and assigned palmon for each building in your camp.',
    available: true,
  },
  {
    to: ROUTES.inventory,
    title: 'Inventory',
    description:
      'Track everything in your bag: miscellaneous items, resource chests, and speedups.',
    available: true,
  },
  {
    to: ROUTES.palmon,
    title: 'Palmon',
    description:
      'Track your Palmon roster: level, stars, squad, equipment, skills, and traits.',
    available: true,
  },
  {
    to: ROUTES.squads,
    title: 'Squads',
    description: 'See each squad and the Palmon assigned to it.',
    available: true,
  },
].sort((a, b) => a.title.localeCompare(b.title));

export default function Home() {
  const { activeProfile } = useProfiles();
  const showProfile = hasProfileDetails(activeProfile);
  const showOther = hasAnyOther(activeProfile.other, activeProfile.customOther);
  const showChests = hasAnyChests(activeProfile.chests);
  const showSpeedups = hasAnySpeedups(activeProfile.inventory);

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="h-page">Palmon Tools</h1>
        <p className="mt-2 text-slate-300">
          Calculators and trackers to help you plan your run in Palmon:
          Survival.
        </p>
      </section>

      {showProfile && (
        <section className="card">
          <h2 className="h-section">{profileLabel(activeProfile)}</h2>
          <div className="mt-3">
            <ProfileSummary profile={activeProfile} />
          </div>
        </section>
      )}

      {showOther && (
        <section className="card">
          <div className="flex items-center justify-between gap-2">
            <h2 className="h-section">Other Inventory</h2>
            <Link to={ROUTES.inventoryOther} className="btn-secondary text-xs">
              Edit
            </Link>
          </div>
          <div className="mt-3">
            <OtherSummary
              other={activeProfile.other}
              customItems={activeProfile.customOther}
            />
          </div>
        </section>
      )}

      {showChests && (
        <section className="card">
          <div className="flex items-center justify-between gap-2">
            <h2 className="h-section">Resource Totals</h2>
            <Link to={ROUTES.inventoryResources} className="btn-secondary text-xs">
              Edit
            </Link>
          </div>
          <div className="mt-3">
            <ResourceTotals
              chests={activeProfile.chests}
              playerLevel={activeProfile.level}
            />
          </div>
        </section>
      )}

      {showChests && (
        <section className="card">
          <div className="flex items-center justify-between gap-2">
            <h2 className="h-section">Resource Inventory</h2>
            <Link to={ROUTES.inventoryResources} className="btn-secondary text-xs">
              Edit
            </Link>
          </div>
          <div className="mt-3">
            <ChestSummary chests={activeProfile.chests} />
          </div>
        </section>
      )}

      {showSpeedups && (
        <section className="card">
          <div className="flex items-center justify-between gap-2">
            <h2 className="h-section">Speedup Inventory</h2>
            <Link to={ROUTES.inventorySpeedups} className="btn-secondary text-xs">
              Edit
            </Link>
          </div>
          <div className="mt-3">
            <SpeedupSummary inventory={activeProfile.inventory} />
          </div>
        </section>
      )}

      <section>
        <h2 className="h-eyebrow mb-2">Profile</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {tools.map((t) =>
            t.available ? (
              <Link
                key={t.to}
                to={t.to}
                className="card transition-all hover:-translate-y-0.5 hover:bg-slate-800/80 hover:shadow-md hover:ring-indigo-400/70"
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
