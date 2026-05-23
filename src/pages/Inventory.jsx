import { Link } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles.js';
import ChestSummary from '../components/ChestSummary.jsx';
import OtherSummary from '../components/OtherSummary.jsx';
import SpeedupSummary from '../components/SpeedupSummary.jsx';
import { profileLabel } from '../lib/profile.js';

const sections = [
  {
    key: 'other',
    title: 'Other Inventory',
    to: '/inventory/other',
    Summary: OtherSummary,
    propsFor: (p) => ({ other: p.other }),
  },
  {
    key: 'resources',
    title: 'Resource Inventory',
    to: '/inventory/resources',
    Summary: ChestSummary,
    propsFor: (p) => ({ chests: p.chests }),
  },
  {
    key: 'speedups',
    title: 'Speedup Inventory',
    to: '/inventory/speedups',
    Summary: SpeedupSummary,
    propsFor: (p) => ({ inventory: p.inventory }),
  },
];

export default function Inventory() {
  const { profiles, activeProfile, setActiveProfile } = useProfiles();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="h-page">Inventory</h1>
        <p className="mt-1 text-subtle">
          Track everything in your bag: miscellaneous items, resource chests,
          and speedups.
        </p>
      </header>

      {profiles.length > 1 && (
        <div className="toolbar">
          <label className="text-sm text-slate-300">Profile</label>
          <select
            value={activeProfile.id}
            onChange={(e) => setActiveProfile(e.target.value)}
            className="select min-w-0 flex-1 sm:flex-none"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {profileLabel(p)}
              </option>
            ))}
          </select>
        </div>
      )}

      {sections.map(({ key, title, to, Summary, propsFor }) => (
        <section key={key} className="card">
          <div className="flex items-center justify-between gap-2">
            <h2 className="h-section">{title}</h2>
            <Link to={to} className="btn-secondary text-xs">
              Edit
            </Link>
          </div>
          <div className="mt-3">
            <Summary {...propsFor(activeProfile)} />
          </div>
        </section>
      ))}
    </div>
  );
}
