import { useProfiles } from '../../hooks/useProfiles.js';
import { profileLabel } from '../../lib/profile.js';

// Profile <select> dropdown shown only when more than one profile exists.
// Reads/writes the active profile through useProfiles directly so callers
// don't have to plumb state.
export default function ProfilePicker({ label = 'Profile' }) {
  const { profiles, activeProfile, setActiveProfile } = useProfiles();
  if (profiles.length <= 1) return null;
  return (
    <div className="toolbar">
      <label className="text-sm text-slate-300">{label}</label>
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
  );
}
