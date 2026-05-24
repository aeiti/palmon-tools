import { Link } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles.js';
import ProfileSummary from '../components/profile/ProfileSummary.jsx';
import ChestSummary from '../components/inventory/ChestSummary.jsx';
import ResourceTotals from '../components/inventory/ResourceTotals.jsx';
import SpeedupSummary from '../components/speedups/SpeedupSummary.jsx';
import OtherSummary from '../components/inventory/OtherSummary.jsx';
import SectionCard from '../components/ui/SectionCard.jsx';
import { ROUTES } from '../routes.js';
import { SECTIONS, toolsInSection } from '../tools.js';
import { hasProfileDetails, profileLabel } from '../lib/profile.js';
import { hasAnyChests } from '../lib/chests.js';
import { hasAnySpeedups } from '../lib/speedups.js';
import { hasAnyOther } from '../lib/other.js';

const tools = toolsInSection(SECTIONS.PROFILE);

function EditLink({ to }) {
  return (
    <Link to={to} className="btn-secondary text-xs">
      Edit
    </Link>
  );
}

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
        <SectionCard title={profileLabel(activeProfile)}>
          <ProfileSummary profile={activeProfile} />
        </SectionCard>
      )}

      {showOther && (
        <SectionCard
          title="Other Inventory"
          actions={<EditLink to={ROUTES.inventoryOther} />}
        >
          <OtherSummary
            other={activeProfile.other}
            customItems={activeProfile.customOther}
          />
        </SectionCard>
      )}

      {showChests && (
        <SectionCard
          title="Resource Totals"
          actions={<EditLink to={ROUTES.inventoryResources} />}
        >
          <ResourceTotals
            chests={activeProfile.chests}
            playerLevel={activeProfile.level}
          />
        </SectionCard>
      )}

      {showChests && (
        <SectionCard
          title="Resource Inventory"
          actions={<EditLink to={ROUTES.inventoryResources} />}
        >
          <ChestSummary chests={activeProfile.chests} />
        </SectionCard>
      )}

      {showSpeedups && (
        <SectionCard
          title="Speedup Inventory"
          actions={<EditLink to={ROUTES.inventorySpeedups} />}
        >
          <SpeedupSummary inventory={activeProfile.inventory} />
        </SectionCard>
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
