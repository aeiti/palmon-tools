import { Link } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles.js';
import ProfileSummary from '../components/profile/ProfileSummary.jsx';
import ChestSummary from '../components/inventory/ChestSummary.jsx';
import ResourceTotals from '../components/inventory/ResourceTotals.jsx';
import SpeedupSummary from '../components/speedups/SpeedupSummary.jsx';
import OtherSummary from '../components/inventory/OtherSummary.jsx';
import { ROUTES } from '../routes.js';
import { SECTIONS, toolsInSection } from '../tools.js';
import { hasProfileDetails, profileLabel } from '../lib/profile.js';
import { hasAnyChests } from '../lib/chests.js';
import { hasAnySpeedups } from '../lib/speedups.js';
import { hasAnyOther } from '../lib/other.js';

const tools = toolsInSection(SECTIONS.PROFILE);

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
            t.available === false ? (
              <div
                key={t.key}
                className="block cursor-not-allowed rounded-lg bg-slate-800/30 p-4 opacity-60 ring-1 ring-slate-800"
              >
                <div className="text-base font-semibold text-slate-300">
                  {t.label}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    (coming soon)
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{t.description}</p>
              </div>
            ) : (
              <Link
                key={t.key}
                to={t.path}
                className="card transition-all hover:-translate-y-0.5 hover:bg-slate-800/80 hover:shadow-md hover:ring-indigo-400/70"
              >
                <div className="text-base font-semibold text-slate-100">
                  {t.label}
                </div>
                <p className="mt-1 text-sm text-slate-400">{t.description}</p>
              </Link>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
